// EmpployeeDashboard.jsx
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Row, Col, Button, Form } from 'react-bootstrap';
import { FaCalendarAlt, FaUserFriends, FaFileAlt, FaChartBar, FaEllipsisV } from 'react-icons/fa';
import authService from '../../services/authService';
import { Card, Table, StatusBadge } from '../../components';
import './Dashboard.scss';
import { getEvents } from '../../services/eventService';
import { getDepartments } from '../../services/departmentService';
import { getLeave, getLeaveTypes } from '../../services/leaveService';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import tippy from 'tippy.js';
import 'tippy.js/dist/tippy.css';

const EmployeeDashboard = () => {

  const { t } = useTranslation();
  // User state and loading flag
  const [user, setUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [departments, setDepartments] = useState([]);
  const [events, setEvents] = useState([]);
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [leaveType, setLeaveTypes] = useState([]);
  //leave balanace and month filter
  const [leaveStats, setLeaveStats] = useState({});
  const [leaveQuotas, setLeaveQuotas] = useState({});
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1); // Default to current month
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  useEffect(() => {
    // Fetch user info on mount
    const loggedInUser = authService.getUser();
    console.log('Fetched user:', loggedInUser);
    setUser(loggedInUser);
    setLoadingUser(false);

    const token = localStorage.getItem('access_token');

    // fetchDepartments();
    const fetchDepartments = async () => {
      try {
        const res = await getDepartments();
        console.log('Fetched Departments:', res);

        setDepartments(res);
      } catch (error) {
        console.error('Failed to fetch departments', error);
      }
    }
    fetchDepartments();

    // fetchEvent()
    const fetchEvents = async () => {
      try {
        const res = await getEvents();
        console.log('Fetched Events:', res);

        setEvents(res);
      } catch (error) {
        console.error('Failed to fetch events', error);
      }
    }
    fetchEvents();

    // fetchLEaveTypes()
    const fetchLeaveTypes = async () => {
      try {
        const res = await getLeaveTypes();
        console.log('Fetched Leave Types:', res);
        setLeaveTypes(res);

        const quotas = {};
        res.forEach(type => {
          if (!type.is_active) return;

          if (type.name === 'Marriage Leave' || type.name === 'Maternity Leave') {
            quotas[type.name] = type.days; // yearly
          } else {
            quotas[type.name] = type.days / 12; // monthly
          }
        });

        setLeaveQuotas(quotas); // 💡 This replaces the hardcoded quotas
      } catch (error) {
        console.error('Failed to fetch leave types', error);
      }
    };
    fetchLeaveTypes();

    // fetchLeaveRequest()
    const fetchLeaveRequests = async () => {
      try {
        const data = await getLeave();
        console.log('Fetched leave:', data);
        const formatted = data.map(item => ({
          id: item.id,
          type: item.leave_type_name,
          employee_name: item.employee_name,
          message: item.message,
          from: item.start_date,
          to: item.end_date,
          days: item.days,
          status: item.status,
          start: new Date(item.start_date).toLocaleDateString(),
          created: new Date(item.created_at).toLocaleDateString(),
        }));
        setLeaveRequests(formatted);
      } catch (err) {
        console.error('Failed to fetch leave requests:', err);
      }
    }
    fetchLeaveRequests();

    const generateApprovedLeaveEvents = (requests) => {
      return (requests ?? [])
        .filter(leave => leave?.status === 'Approved')
        .map(leave => ({
          title: `${leave?.employee_name ?? 'Unknown'} - ${leave?.type || 'Leave'}`,
          start: leave?.from,
          end: leave?.to,
          color: '#00905F',
          extendedProps: {
            type: 'Leave',
            date: leave?.from ?? leave?.to,
            day: leave?.days ?? 'N/A',
            days: leave?.days,
            message: leave?.message ?? '-',
            employee: leave?.employee_name ?? '-'
          }
        }));
    };

    //Leave Balanace
    if (!leaveRequests || leaveRequests.length === 0) return;
    const filtered = leaveRequests.filter(lr => {
      const startDate = new Date(lr.start);
      const leaveMonth = startDate.getMonth() + 1;
      const leaveYear = startDate.getFullYear();
      const isApproved = lr.status === 'Approved';
      const isMatchingMonth = leaveMonth === selectedMonth;
      const isMatchingYear = leaveYear === selectedYear;

      const isYearlyType = ['Marriage Leave', 'Maternity Leave'].includes(lr.type);

      return isApproved && (
        (isYearlyType && isMatchingYear) ||
        (!isYearlyType && isMatchingMonth && isMatchingYear)
      );
    });
    console.log('Filtered Approved Leaves:', filtered);

    const counts = {
      'Annual Leave': 0,
      'Sick Leave': 0,
      'Marriage Leave': 0,
      'Maternity Leave': 0,
      'Emergency Leave': 0,
      'Others': 0,
    };

    filtered.forEach(lr => {
      const type = lr.type;
      if (counts.hasOwnProperty(type)) {
        counts[type] += lr.days; // use days instead of count++
      } else {
        counts['Other'] += lr.days;
      }
    });
    setLeaveStats(counts);
  }, [leaveRequests, selectedMonth, selectedYear]);

  // Loading screen
  if (loadingUser) {
    return <div className="dashboardPage-page">Loading user info...</div>;
  }

  // No user fallback
  if (!user) {
    return <div className="dashboardPage-page">User not found. Please log in.</div>;
  }

  // Columns for the leave requests table
  const leaveRequestColumns = [
    { key: 'type', title: 'Leave Type', render: row => row.type },
    { key: 'message', title: 'Reasons', render: row => row.message },
    { key: 'from', title: t('dashboardPage.table.fromDate'), render: (row) => row.from },
    { key: 'to', title: t('dashboardPage.table.toDate'), render: (row) => row.to },
    { key: 'days', title: t('dashboardPage.table.days'), render: (row) => row.days },
    {
      key: 'status',
      title: t('dashboardPage.table.status'),
      render: (row) => <StatusBadge status={row.status} />
    },
    {
      key: 'actions',
      title: '',
      width: '50px',
      render: () => (
        <Button variant="link" size="sm" className="p-0">
          <FaEllipsisV />
        </Button>
      )
    }
  ];

  // Date/time display for header
  const now = new Date();
  const today = new Date();
  const dayName = now.toLocaleDateString(undefined, { weekday: 'long' });
  const dateStr = now.toLocaleDateString(undefined, { day: 'numeric', month: 'long', year: 'numeric' }).replace(/,/g, '');
  const timeStr = now.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });

  // Approval Leave Events
  const approvedLeaveEvents = (leaveRequests ?? [])
    .filter(leave => leave?.status === 'Approved')
    .map(leave => ({
      title: leave?.type || 'Leave',
      start: leave?.from,
      end: leave?.to,
      color: '#00905F',
      extendedProps: {
        date: leave?.from ?? leave?.to,
        day: leave?.days ?? 'N/A'
      }
    }));
  console.log('Approved Leave Events:', approvedLeaveEvents);

  //Holiday Events
  const holidayEvents = events.map(event => ({
    title: event.holiday_name || 'Holiday',
    date: event.date,
    color: '#C31818',
    extendedProps: {
      type: event.holiday_type || 'Holiday',
      day: event.day || 'N/A'
    }
  }));
  const calendarEvents = [...holidayEvents, ...approvedLeaveEvents];

  //Upcoming Holiday
  const upcomingHoliday = [
    { key: 'day', title: 'Day', render: (row) => t(row.day) },
    { key: 'date', title: 'Date', render: (row) => t(row.date) },
    { key: 'name', title: 'Holida Name', render: (row) => row.name },
    { key: 'type', title: 'Holiday Type', render: (row) => row.type },
    {
      key: 'actions',
      title: '',
      width: '50px',
      render: () => (
        <Button variant="link" size="sm" className="p-0">
          <FaEllipsisV />
        </Button>
      )
    }
  ];
  const upcomingHolidays = events
    .filter(event => new Date(event.date) >= today)
    .map(event => {
      const formattedDate = new Date(event.date).toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      });

      return {
        day: event.day,
        date: formattedDate,
        name: event.holiday_name,
        type: event.holiday_type
      };
    });

  // NEW Upcoming Leaves
  const upcomingLeaves = (leaveRequests || [])
    .filter((leave) => {
      if (!leave.from) return false;
      const start = new Date(leave.from);
      const now = new Date();
      const isApproved = leave.status === 'Approved';
      const isUpcoming = start > now;
      return isApproved && isUpcoming;
    })
    .sort((a, b) => new Date(a.from) - new Date(b.from)) // Sort by start date
    .slice(0, 1); // Take only the earliest one
  console.log('Filtered upcoming leaves:', upcomingLeaves);

  return (
    <div className="dashboardPage-page">

      {/* Welcome header */}
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-3" style={{ gap: 16 }}>
        <div>
          <h2>
            Hi <span style={{ fontWeight: 800 }}>
              {user.first_name && user.last_name
                ? `${user.first_name} ${user.last_name}`
                : user.username}
              {/* ({user?.role_details?.name}) */}
            </span> 👋
          </h2>

          {/* NEW Department name below user name */}
          <div style={{
            marginBottom: '0.5rem',
          }}>
            <span
              style={{
                backgroundColor: '#4D49D3',
                color: '#FEFEFE',
                padding: '0.25rem 0.6rem',
                borderRadius: '0.3rem',
                fontSize: '1rem',
                fontWeight: 'bold',
              }}
            >
              {loadingUser ? '' : user?.department?.name || 'No Department'} Department
            </span>
          </div>
          {/* Sub header */}
          <div className="text-muted" style={{ fontSize: 16 }}>
            Your leave status and requests are just a click away!
          </div>
        </div>

        {/* Date and time display */}
        <div className="text-end" style={{ minWidth: 220 }}>
          <div style={{ fontWeight: 600, color: '#3B3B3B', fontSize: 15 }}>
            <span>Today is</span>
          </div>
          <div style={{ fontSize: 15 }}>
            <span style={{ color: '#4D49B3', fontWeight: 700 }}>{dayName}, </span>{dateStr}
          </div>
          <div style={{ fontSize: 15 }}>{timeStr}</div>
        </div>
      </div>

      <Row>
        <div style={{
          borderTop: "0.5px solid #a9a9a9 ", marginBottom: '1rem'
        }}></div>
      </Row>

      {/* List of Leave Balance header and sub-header */}
      <div className="department-list-header d-flex align-items-center justify-content-between flex-wrap">
        <div>
          <h5 style={{ fontWeight: 'bold', marginBottom: '0' }}>🔍 Leave Balance</h5>
          <p style={{ marginTop: 0, marginBottom: '0.7rem', color: '#666' }}>See how much leave you’ve used and what’s left</p>
        </div>
        <div>
          <span
            style={{
              backgroundColor: '#00905F',
              color: '#FFFFFF',
              padding: '0.25rem 0.6rem',
              borderRadius: '0.5rem',
              fontSize: '0.85rem',
              fontWeight: 'bold',
            }}
          >
            {new Date().toLocaleString('default', { month: 'long', year: 'numeric' })}
          </span>
        </div>
      </div>

      {/* Month and Year Filter
      <div className="d-flex justify-content-end mb-3 gap-2">
        <Form.Select
          value={selectedMonth}
          onChange={e => setSelectedMonth(Number(e.target.value))}
          className="w-auto"
        >
          {[...Array(12)].map((_, i) => (
            <option key={i + 1} value={i + 1}>
              {new Date(0, i).toLocaleString('default', { month: 'long' })}
            </option>
          ))}
        </Form.Select>

        <Form.Select
          value={selectedYear}
          onChange={e => setSelectedYear(Number(e.target.value))}
          className="w-auto"
        >
          {[2023, 2024, 2025].map(year => (
            <option key={year} value={year}>{year}</option>
          ))}
        </Form.Select>
      </div> */}

      {/* Leave Balance Cards */}
      <Row className="g-3 mb-4">
        {Object.entries(leaveStats).map(([type, used]) => {
          const isMarriageOrMaternity = ['Marriage Leave', 'Maternity Leave'].includes(type);
          const quota = leaveQuotas[type] || 0;
          const displayUsed = Math.round(used);
          const displayQuota = Math.round(quota);

          return (
            <Col key={type} xl={4} md={6} className="d-flex">
              <Card className="stat-card flex-fill p-3">
                <div className="d-flex align-items-start">
                  <div className="emoji-icon flex-shrink-0">
                    <div className="emoji-circle">
                      <span role="img" aria-label="Leave Type">📝</span>
                    </div>
                  </div>
                  <div className="ms-3">
                    <h5 className="fw-bold mb-1">{type}</h5>
                    <p className="mb-0">
                      <span role="img" aria-label="Count">📅</span>{' '}
                      {displayUsed} / {displayQuota}{' '}
                      {isMarriageOrMaternity ? `per Year` : `Per Month`}
                    </p>
                  </div>
                </div>
              </Card>
            </Col>
          );
        })}
      </Row>

      {/* My Leave Request */}
      <Row className="g-3">
        <Col lg={8}>
          <div className="d-flex flex-column h-100">
            <div className="department-list-header d-flex justify-content-between align-items-center">
              <div className="d-flex align-items-center">
                <div className="d-flex justify-content-between align-items-start">
                  <div>
                    <h5 style={{ fontWeight: 'bold', marginBottom: 0 }}>📝 My Leaves</h5>
                    <p style={{ marginBottom: '0.5rem', color: '#666' }}>
                      All your submitted leave requests, past and present
                    </p>
                  </div>
                </div>

                {/* Circle Badges */}
                <div
                  style={{
                    marginLeft: '5px',
                    width: '22px',
                    height: '22px',
                    borderRadius: '50%',
                    backgroundColor: '#4D49B3',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.7rem',
                    fontWeight: 'bold'
                  }}
                >
                  {leaveRequests.length}
                </div>
              </div>
              <Button variant="outline-primary" size="sm">
                {t('dashboardPage.viewAllButton')}
              </Button>
            </div>

            {/* NEW Scrollable Table */}
            <Card>
              <div
                style={{
                  height: '550px', // fixed height regardless of data
                  overflowY: 'auto',
                  scrollbarWidth: 'none',        // Firefox
                  msOverflowStyle: 'none'        // IE/Edge
                }}
                className="scroll-container"
              >
                <Table
                  columns={leaveRequestColumns}
                  data={leaveRequests}
                  onRowClick={(row) => console.log('Row clicked:', row)}
                />
              </div>
            </Card>
          </div>
        </Col>

        {/* NEW Upcoming */}
        <Col lg={4}>
          <div className="d-flex flex-column" > 
            {/* Upcoming Header */}
            <div className="department-list-header">
              <div className="d-flex align-items-center">
                <div>
                  <h5 style={{ fontWeight: 'bold', marginBottom: '0' }}>😉 Upcoming Leaves</h5>
                  <p style={{ marginBottom: '0.5rem', color: '#666' }}>
                    Stay informed about your upcoming time off
                  </p>
                </div>
              </div>
            </div>
            {/* Content */}
            <div style={{ marginBottom: '1.5rem' }}>
              {upcomingLeaves.length === 0 ? (
                <p>No Upcoming Leave</p>
              ) : (
                upcomingLeaves.map((leave) => {
                  const startDate = new Date(leave.from);
                  const endDate = new Date(leave.to);
                  return (
                    <div
                      className="leave-item"
                      style={{
                        background: 'rgba(77, 73, 179, 0.10)', // #4D49B3 at 10% opacity
                        borderRadius: '10px',
                        padding: '1.3rem 1.5rem',
                        borderLeft: '5px solid #4D49B3',
                      }}
                      key={leave.id}
                    >
                      {/* Leave Type Header */}
                      <div style={{ fontWeight: 'bold', color: '#495057', fontSize: '0.95rem', marginBottom: 2 }}>
                        Leave Type
                      </div>
                      <div
                        className="leave-title"
                        style={{
                          fontWeight: 'bold',
                          color: '#4D49D3',
                          fontSize: '1.1rem',
                          marginBottom: '0.5rem'
                        }}
                      >
                        {leave.type || 'No Upcoming Leave'}
                      </div>
                      <div
                        className="leave-details"
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'flex-start',
                          marginBottom: '0.2rem'
                        }}
                      >
                        <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                          <span style={{ fontWeight: 'bold', color: '#495057', fontSize: '0.85rem', marginBottom: 2 }}>Dates</span>
                          <span
                            className="dates"
                            style={{
                              color: '#333',
                              fontSize: '1rem'
                            }}
                          >
                            {startDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} –{' '}
                            {endDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                          </span>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', flex: 1 }}>
                          <span style={{ fontWeight: 'bold', color: '#495057', fontSize: '0.85rem', marginBottom: 2 }}>Total Day(s)</span>
                          <span
                            className="days"
                            style={{
                              color: '#666',
                              fontSize: '1rem',
                              fontWeight: 500
                            }}
                          >
                            {leave.days} day(s)
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Upcoming Holidays */}
            <div className="department-list-header">
              <div className="d-flex align-items-center">
                <div>
                  <h5 style={{ fontWeight: 'bold', marginBottom: '0' }}>🎉 Upcoming Holidays</h5>
                  <p style={{ marginBottom: '0.5rem', color: '#666' }}>
                    See what holidays are coming soon
                  </p>
                </div>
              </div>
            </div>
            <div style={{ marginBottom: '1.5rem' }}>
              <Card className="mb-3" style={{ maxHeight: '250px', overflowY: 'auto', padding: '1rem' }}>
                <div style={{
                  height: '320px', // fixed height regardless of data
                  overflowY: 'auto',
                  scrollbarWidth: 'none',        // Firefox
                  msOverflowStyle: 'none'        // IE/Edge
                }}
                className="scroll-container">
                  {upcomingHolidays.length > 0 ? (
                    upcomingHolidays.map((event, index) => (
                      <div key={index} className="event-item mb-3" style={{ borderBottom: '1px solid #eee', paddingBottom: '0.5rem' }}>
                        <div className="event-content">
                          <h6 className="event-title"
                            style={{
                              fontWeight: 'bold',
                              color: '#4D49D3',
                              fontSize: '1.1rem',
                              marginBottom: '0.25rem',
                            }}>
                            {event.name}
                          </h6>
                          <p className="event-type mb-1">
                            <small className="text-muted">{event.type}</small>
                          </p>
                          <p className="event-date mb-0">
                            <small><FaCalendarAlt className="me-1" /> {event.date} ({event.day})</small>
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-muted">{t('dashboardPage.noUpcomingHolidays')}</div>
                  )}
                </div>
              </Card>
            </div>
          </div>
        </Col>
      </Row>
    </div>
  );
};
export default EmployeeDashboard;
