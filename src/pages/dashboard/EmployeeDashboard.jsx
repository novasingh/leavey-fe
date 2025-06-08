// EmpployeeDashboard.jsx
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Row, Col, Button, Form } from 'react-bootstrap';
import { FaEllipsisV } from 'react-icons/fa';
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
  const dayName = now.toLocaleDateString(undefined, { weekday: 'long' });
  const dateStr = now.toLocaleDateString(undefined, { day: 'numeric', month: 'long', year: 'numeric' }).replace(/,/g, '');
  const timeStr = now.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });

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
  const today = new Date();
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
          {/* Department name below user name */}
          <div className="text-muted" style={{ fontSize: 16, marginTop: 4 }}>
            {loadingUser || departments.length === 0
              ? '' // or a spinner here
              : departments.find((d) => d.id === user.department)?.name || 'No Department'}
          </div>


          <div className="text-muted" style={{ fontSize: 16 }}>
            Your leave status and requests are just a click away!
          </div>
        </div>
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
          <h5 style={{ fontWeight: 'bold', marginBottom: '0' }}>Leave Balance</h5>
          <p style={{ marginTop: 0, marginBottom: '0.7rem', color: '#666' }}>See how much leave you’ve used and what’s left</p>
        </div>
        <div>
          <span
            style={{
              backgroundColor: '#d4edda', // light green
              color: '#155724', // dark green text
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
      </div>

      {/* Leave Type Cards */}
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

      {/* Leave Reuqest */}
      <Row className="g-3">
        <Col lg={8}>
          <div className="d-flex flex-column h-100">
            <div className="department-list-header d-flex justify-content-between align-items-center">
              <div className="d-flex align-items-center">
                <div className="d-flex justify-content-between align-items-start">
                  <div>
                    <h5 style={{ fontWeight: 'bold', marginBottom: 0 }}>Leave Request List</h5>
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

            {/* Content */}
            <Card>
              <Table
                columns={leaveRequestColumns}
                data={leaveRequests}
                onRowClick={(row) => console.log('Row clicked:', row)}
              />
            </Card>
          </div>
        </Col>

        {/* Types */}
        <Col lg={4}>
          <div className="d-flex flex-column h-100">
            <div className="department-list-header">
              <div className="d-flex align-items-center">
                <div>
                  <h5 style={{ fontWeight: 'bold', marginBottom: '0' }}>Leave Types</h5>
                  <p style={{ marginBottom: '0.5rem', color: '#666' }}>
                    Explore the different leave categories you can apply for
                  </p>
                </div>
              </div>
            </div>

            {/* Content */}
            <Card className="mb-3 h-100">
              <div className="events-list">
                {leaveType.length > 0 ? (
                  leaveType.map((leave, index) => {
                    const badgeColors = {
                      'Annual Leave': '#4D49B3',     // Purple
                      'Sick Leave': '#FFB900',       // Yellow
                      'Maternity Leave': '#0041C2',  // Blue
                      'Marriage Leave': '#CD60AE',   // Pink
                      'Emergency Leave': '#C31818',  // Red
                      'Others': '#00905F'             // Green
                    };
                    const badgeColor = badgeColors[leave.name] || '#00905F'; // Default gray if not matched
                    return (
                      <div key={index} className="event-item d-flex align-items-center mb-2">
                        <span
                          style={{
                            width: '20px',
                            height: '20px',
                            borderRadius: '50%',
                            backgroundColor: badgeColor,
                            display: 'inline-block',
                            marginRight: '8px',
                          }}
                        ></span>
                        <h6 className="event-title mb-0">{leave.name}</h6>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-muted">No leave requests found.</div>
                )}
              </div>
            </Card>
          </div>
        </Col>
      </Row>

      {/* Holiday Calendar */}
      <Row className="g-1">
        <div className="department-list-header">
          <h5 style={{ fontWeight: 'bold', marginBottom: '0' }}>Holiday Calendar</h5>
          <p style={{ marginTop: 0, marginBottom: '0.5rem', color: '#666' }}>lorem ipsum</p>
        </div>
        <Card>
          <div className="calendar-placeholder">
            {/* Calendar */}
            <FullCalendar
              plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
              initialView="dayGridMonth"
              headerToolbar={{
                left: 'prev,next today',
                center: 'title',
                right: 'dayGridMonth,timeGridWeek,timeGridDay'
              }}
              events={
                events.map((event) => ({
                  title: event.holiday_name || 'No Title',
                  date: event.date,
                  extendedProps: {
                    day: event.day || 'no data',
                    type: event.holiday_type || 'no data'
                  }
                }))
              }
              eventDidMount={(info) => {
                const day = info.event.extendedProps.day;
                const type = info.event.extendedProps.type;

                tippy(info.el, {
                  content: `
                  <strong>${info.event.holiday_name}</strong><br/>
                  Day: ${day}<br/>
        Type: ${type}
      `,
                  allowHTML: true,
                  placement: 'top',
                });
              }}
              height="auto"
            />
          </div>
        </Card>
      </Row>

      {/* Left column with Upcoming Holidays */}
      <Row className="g-3">
        <Col lg={8}>
          <div className="d-flex flex-column h-100">
            <div className="department-list-header d-flex justify-content-between align-items-center">
              <div className="d-flex align-items-center">
                <div>
                  <h5 style={{ fontWeight: 'bold', marginBottom: 0 }}>Upcoming Holidays</h5>
                  <p style={{ marginTop: 0, marginBottom: '0.5rem', color: '#666' }}>
                    Check the upcoming holiday schedule
                  </p>
                </div>
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
                  {upcomingHolidays.length}
                </div>
              </div>

              {/* 🔽 Filters */}
              <div className="d-flex gap-2">
                <Form.Select size="sm" style={{ width: '140px' }}>
                  <option>See by Month</option>
                  <option>January</option>
                  <option>February</option>
                  <option>March</option>
                  <option>April</option>
                  <option>May</option>
                  <option>June</option>
                  <option>July</option>
                  <option>August</option>
                  <option>September</option>
                  <option>October</option>
                  <option>November</option>
                  <option>December</option>
                </Form.Select>
                <Form.Select size="sm" style={{ width: '140px' }}>
                  <option>See by Type</option>
                  <option>Public Holiday</option>
                  <option>Company Holiday</option>
                  <option>Company Birthday</option>
                </Form.Select>
              </div>
            </div>

            <Card>
              <Table
                columns={upcomingHoliday}
                data={upcomingHolidays}
                onRowClick={(row) => console.log('Row clicked:', row)}
              />
            </Card>
          </div>
        </Col>

        {/* Right column with Ayam and Sapi stacked */}
        <Col lg={4}>
          <div className="d-flex flex-column h-100">
            <div>
              <h5 style={{ fontWeight: 'bold', marginBottom: 0 }}>Current Work Hours Overview</h5>
              <p style={{ marginTop: 0, marginBottom: '0.5rem', color: '#666' }}>
                syalalalalala
              </p>
            </div>

            {/* Ayam Card */}
            <Card className="mb-4 flex-grow-1">
              <div className="events-list">
                {events.map(event => (
                  <div key={event.id} className="event-item">
                    <div className={`event-indicator ${event.type}`}></div>
                  </div>
                ))}
              </div>
            </Card>

            <div>
              <h5 style={{ fontWeight: 'bold', marginBottom: 0 }}>Leave Cycle Status</h5>
              <p style={{ marginTop: 0, marginBottom: '0.5rem', color: '#666' }}>
                syalalalalala
              </p>
            </div>
            {/* Ayam Card */}
            <Card className="mb-4 flex-grow-1">
              <div className="events-list">
                {events.map(event => (
                  <div key={event.id} className="event-item">
                    <div className={`event-indicator ${event.type}`}></div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </Col>
      </Row>

      {/* Team Leave Calendar */}
      
    </div>
  );
};

export default EmployeeDashboard;
