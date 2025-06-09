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

  }, []);

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
    { key: 'from', title: 'Start Date', render: (row) => row.from },
    { key: 'to', title: 'End Date', render: (row) => row.to },
    { key: 'days', title: 'Total Days', render: (row) => row.days },
    {
      key: 'status',
      title: 'Status',
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
  const dayName = now.toLocaleDateString(undefined, { weekday: 'long' });
  const dateStr = now.toLocaleDateString(undefined, { day: 'numeric', month: 'long', year: 'numeric' }).replace(/,/g, '');
  const timeStr = now.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });

  //Upcoming Holidays
  const upcomingHolidays = events
    .filter(event => new Date(event.date) >= now)
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

  // Approval Leave Events
  const approvedLeaveEvents = (leaveRequests ?? [])
    .filter(leave => leave?.status === 'Approved')
    .map(leave => ({
      title: leave?.employee_name
        ? `${leave?.employee_name} - ${leave?.type}`
        : leave?.type || 'Leave',
      start: leave?.from,
      end: new Date(new Date(leave?.to).getTime() + 24 * 60 * 60 * 1000), // ✅ +1 day to include end date
      color: '#00905F',
      extendedProps: {
        type: 'Leave',
        date: `${new Date(leave?.from).toLocaleDateString('id-ID', {
          day: '2-digit',
          month: 'long',
          year: 'numeric'
        })} to ${new Date(leave?.to).toLocaleDateString('id-ID', {
          day: '2-digit',
          month: 'long',
          year: 'numeric'
        })}`,
        day: leave?.days ?? 'N/A',
      },
    }));

  // Holiday Events
  const holidayEvents = events.map(event => ({
    title: event.holiday_name || 'Holiday',
    start: event.date,
    color: '#C31818',
    extendedProps: {
      type: event.holiday_type || 'Holiday',
      day: event.day || 'N/A',
      date: event.start || 'N/A', // ✅ Add this
    }
  }));
  const calendarEvents = [...holidayEvents, ...approvedLeaveEvents];

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

      {/* Month and Year Filter */}
      <div className="d-flex justify-content-center mb-3 gap-3 w-100">
        {/* Month */}
        <Form.Select
          value={selectedMonth}
          onChange={e => setSelectedMonth(Number(e.target.value))}
          className="w-100"
        >
          {[...Array(12)].map((_, i) => (
            <option key={i + 1} value={i + 1}>
              {new Date(0, i).toLocaleString('default', { month: 'long' })}
            </option>
          ))}
        </Form.Select>
        {/* Year */}
        <Form.Select
          value={selectedYear}
          onChange={e => setSelectedYear(Number(e.target.value))}
          className="w-100"
        >
          {Array.from(
            new Set(
              (leaveRequests)
                .map(lr => {
                  const date = new Date(lr.start);
                  return date.getFullYear();
                })
            )
          )
            .sort((a, b) => b - a)
            .map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
        </Form.Select>
      </div>

      {/* Leave Balance Cards */}
      <Row className="g-3 mb-4">
        {(() => {
          // Color mapping for leave types (dynamic from DB)
          const leaveTypeColors = (leaveType).reduce((acc, type) => {
            acc[type.name] = type.color;
            return acc;
          }, {});

          // Calculate used leave per type (Approved only, filtered by month/year or year for yearly types)
          const usedLeave = {};
          (leaveRequests || []).forEach(lr => {
            const isApproved = lr.status === 'Approved';
            if (!isApproved) return;
            const type = lr.type;
            const startDate = new Date(lr.start);
            const leaveMonth = startDate.getMonth() + 1;
            const leaveYear = startDate.getFullYear();
            const isYearlyType = ['Marriage Leave', 'Maternity Leave'].includes(type);

            const match =
              (isYearlyType && leaveYear === selectedYear) ||
              (!isYearlyType && leaveMonth === selectedMonth && leaveYear === selectedYear);

            if (match) {
              usedLeave[type] = (usedLeave[type] || 0) + Number(lr.days || 0);
            }
          });

          // Render cards for each leave type (active only)
          return (leaveType || []).filter(type => type.is_active).map(type => {
            const leaveName = type.name;
            const isYearly = ['Marriage Leave', 'Maternity Leave'].includes(leaveName);
            const quota = isYearly ? type.days : Math.round(type.days / 12);
            const used = Math.round(usedLeave[leaveName] || 0);
            const color = leaveTypeColors[leaveName];
            const percent = quota > 0 ? Math.min(100, Math.round((used / quota) * 100)) : 0;

            // Icon per leave type (optional, fallback to 📝)
            const leaveIcons = {
              'Annual Leave': '🌴',
              'Sick Leave': '🤒',
              'Marriage Leave': '💍',
              'Maternity Leave': '🤰',
              'Unpaid Leave': '💸',
            };
            const icon = leaveIcons[leaveName] || '📝';

            const isExceeded = used > quota;

            return (
              <Col key={leaveName} xl={4} md={6} className="d-flex">
              <Card
                className="stat-card flex-fill p-3"
                style={{
                borderLeft: `6px solid ${color}`,
                background: `${color}100`,
                boxShadow: '0 2px 8px rgba(77,73,179,0.06)'
                }}
              >
                <div className="d-flex align-items-start">
                <div className="emoji-icon flex-shrink-0">
                  <div className="emoji-circle" style={{
                  background: color,
                  color: '#fff',
                  width: 80,
                  height: 80,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: '50%',
                  fontSize: '1.5rem'
                  }}>
                  <span role="img" aria-label="Leave Type">{icon}</span>
                  </div>
                </div>
                <div className="ms-3 flex-grow-1">
                  <h5 className="fw-bold mb-1" style={{ color }}>{leaveName}</h5>
                  <p className="mb-1" style={{ fontWeight: 500, color: '#333' }}>
                  <span role="img" aria-label="Count">📅</span>{' '}
                  {used} / {quota} {isYearly ? 'per Year' : 'Per Month'}
                  </p>

                  {/* Progress Bar */}
                  <div style={{
                  background: '#e9ecef',
                  borderRadius: 8,
                  height: 10,
                  width: '100%',
                  marginTop: 8,
                  marginBottom: 2,
                  overflow: 'hidden'
                  }}>
                  <div style={{
                    width: `${percent}%`,
                    background: color,
                    height: '100%',
                    borderRadius: 8,
                    transition: 'width 0.5s'
                  }} />
                  </div>
                  <div style={{ fontSize: 12, color: '#666', textAlign: 'right' }}>
                  {percent}% used
                  </div>

                  {/* Exceeded Warning */}
                  {isExceeded && (
                  <div
                    style={{
                    background: '#C31818',
                    color: '#fff',
                    borderRadius: 5,
                    padding: '4px 10px',
                    marginTop: '1px',
                    fontWeight: 300,
                    fontSize: 13,
                    display: 'inline-block'
                    }}
                  >
                    Leave balance exceeded
                  </div>
                  )}
                </div>
                </div>
              </Card>
              </Col>
            );
          });
        })()}
      </Row>

      {/* Leave Requests and Upcoming */}
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
                {'View All'}
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
            {/* Upcoming Leaves */}
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
            <div style={{ marginBottom: '1.8rem' }}>
              {upcomingLeaves.length === 0 ? (
                <div style={{
                  marginTop: '0.3rem'
                }}>
                  <span
                    style={{
                      backgroundColor: '#C31818',
                      color: '#FFFFFF',
                      padding: '0.25rem 0.6rem',
                      borderRadius: '0.5rem',
                      fontSize: '0.85rem'
                    }}
                  >
                    No Upcoming Leaves
                  </span>
                </div>
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
                        {leave.type}
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
              <Card
                className="mb-3"
                style={{
                  maxHeight: '430px',
                  overflowY: 'auto',
                  padding: '1rem',
                  height: upcomingLeaves.length === 0 ? '430px' : '310px',
                }}
              >
                <div style={{
                  height: upcomingLeaves.length === 0 ? '430px' : '310px',
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
                    <div className="text-muted">{'No Upcoming Holidays'}</div>
                  )}
                </div>
              </Card>
            </div>
          </div>
        </Col>
      </Row>

      {/* Holiday Calendar */}
      <Row className="g-1">
        <div className="department-list-header">
          <h5 style={{ fontWeight: 'bold', marginBottom: '0' }}>📅 Holiday Calendar
          </h5>
          <p style={{ marginTop: 0, marginBottom: '0.5rem', color: '#666' }}>View all holidays and approved leaves at a glance in a unified calendar layout</p>
        </div>
        <Card>
          <div className="calendar-placeholder">
            {/* Calendar */}
            <FullCalendar
              plugins={[dayGridPlugin]}
              initialView="dayGridMonth"
              events={calendarEvents}
              eventTimeFormat={{
                hour: '2-digit',
                minute: '2-digit',
                meridiem: false,
                hour12: false,
              }}
              displayEventTime={false}
              eventDidMount={(info) => {
                const { type, day, date } = info.event.extendedProps;

                const isLeave = type === 'Leave';
                const tooltipContent = isLeave
                  ? `
              <strong>${info.event.title}</strong><br/>
              Total Days: ${day}<br/>
              Date: ${date}
            `
                  : `
              <strong>${info.event.title}</strong><br/>
              Type: ${type}<br/>
              Day: ${day}
            `;

                tippy(info.el, {
                  content: tooltipContent,
                  allowHTML: true,
                  placement: 'top',
                });
              }}
              height="auto"
            />
          </div>
        </Card>
      </Row>
    </div>
  );
};
export default EmployeeDashboard;
