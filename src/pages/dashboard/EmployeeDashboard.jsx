// EmployeeDashboard.jsx
import React, { useEffect, useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Row, Col, Button, Form } from 'react-bootstrap';
import { FaCalendarAlt, FaUserFriends, FaFileAlt, FaChartBar, FaEllipsisV } from 'react-icons/fa';
import authService from '../../services/authService';
import { Card, Table, StatusBadge } from '../../components';
import './Dashboard.scss';
import { getEvents } from '../../services/eventService';
import { getDepartments } from '../../services/departmentService';
import { getLeave, getLeaveTypes, getLeaveSettings } from '../../services/leaveService';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import tippy from 'tippy.js';
import 'tippy.js/dist/tippy.css';

const EmployeeDashboard = () => {
  const { t } = useTranslation();
  const [user, setUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [departments, setDepartments] = useState([]);
  const [events, setEvents] = useState([]);
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [leaveTypes, setLeaveTypes] = useState([]);
  const [leaveTab, setLeaveTab] = useState('all');
  const [leaveStats, setLeaveStats] = useState({});
  const [leaveQuotas, setLeaveQuotas] = useState({});
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [calendarViewDate, setCalendarViewDate] = useState(new Date(selectedYear, selectedMonth, 1));
  const calendarRef = useRef(null);

  useEffect(() => {
    const loggedInUser = authService.getUser();
    setUser(loggedInUser);
    setLoadingUser(false);
    fetchDepartments();
    fetchEvents();
    fetchLeaveTypes();
    fetchLeaveRequests();
    // eslint-disable-next-line
  }, []);
  // --- Year/Month Filter ---
  const allYears = Array.from(new Set(leaveRequests.map(l => new Date(l.from).getFullYear())));
  const years = allYears.length ? allYears : [new Date().getFullYear()];
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // When year or month changes, update calendar view
  useEffect(() => {
    if (calendarRef.current) {
      const api = calendarRef.current.getApi();
      api.gotoDate(new Date(selectedYear, selectedMonth, 1));
    }
  }, [selectedYear, selectedMonth]);

  useEffect(() => {
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
        counts[type] += lr.days;
      } else {
        counts['Others'] += lr.days;
      }
    });
    setLeaveStats(counts);
  }, [leaveRequests, selectedMonth, selectedYear]);

  const fetchDepartments = async () => {
    try {
      const res = await getDepartments();
      setDepartments(res);
    } catch (error) {
      // handle error
    }
  };

  const fetchEvents = async () => {
    try {
      const res = await getEvents();
      setEvents(res);
    } catch (error) {
      // handle error
    }
  };

  const fetchLeaveTypes = async () => {
    try {
      const res = await getLeaveTypes();
      setLeaveTypes(res);
      const quotas = {};
      res.forEach(type => {
        if (!type.is_active) return;
        if (type.name === 'Marriage Leave' || type.name === 'Maternity Leave') {
          quotas[type.name] = type.days;
        } else {
          quotas[type.name] = type.days / 12;
        }
      });
      setLeaveQuotas(quotas);
    } catch (error) {
      // handle error
    }
  };

  const fetchLeaveRequests = async () => {
    try {
      const data = await getLeave();
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
      // handle error
    }
  };

  if (loadingUser) {
    return <div className="dashboardPage-page">Loading user info...</div>;
  }
  if (!user) {
    return <div className="dashboardPage-page">User not found. Please log in.</div>;
  }

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

  // --- Calendar Events (with filter logic and correct color for Public Holiday) ---
  const leaveTypeColorMap = {};
  leaveTypes.forEach(type => {
    leaveTypeColorMap[type.name] = type.color || '#00905F';
  });

  // Filter leave requests by selected year, month, and department (overlapping logic)
  const filteredLeaveRequests = (leaveRequests ?? []).filter(leave => {
    if (!leave.from || !leave.to) return false;
    const leaveStart = new Date(leave.from);
    const leaveEnd = new Date(leave.to);
    const monthStart = new Date(selectedYear, selectedMonth, 1);
    const monthEnd = new Date(selectedYear, selectedMonth + 1, 0, 23, 59, 59, 999); // last ms of month
    const overlapsMonth = leaveEnd >= monthStart && leaveStart <= monthEnd;
    return overlapsMonth && leave.status === 'Approved';
  });

  const filteredEvents = events.filter(event => {
    const eventYear = new Date(event.date).getFullYear();
    const matchesYear = eventYear === Number(selectedYear);
    // If department is selected, only show holidays for that department if such info exists (else show all)
    return matchesYear;
  });

  const approvedLeaveEvents = filteredLeaveRequests.map(leave => {
    const color = leaveTypeColorMap[leave.type] || '#4D49B3';
    return {
      title: leave.employee_name
        ? `${leave.employee_name} - ${leave.type} - ${leave.department}`
        : leave.type || 'Leave',
      start: leave.from,
      end: leave.to,
      color,
      allDay: true,
      extendedProps: {
        type: 'Leave',
        leaveType: leave.type,
        employee: leave.employee_name,
        department: leave.department,
        date: `${new Date(leave.from).toLocaleDateString('id-ID', {
          day: '2-digit',
          month: 'long',
          year: 'numeric'
        })} to ${new Date(leave.to).toLocaleDateString('id-ID', {
          day: '2-digit',
          month: 'long',
          year: 'numeric'
        })}`,
        day: leave.days ?? 'N/A',
      },
    };
  });

  const holidayEvents = filteredEvents.map(event => ({
    title: event.holiday_name || 'Holiday',
    start: event.date,
    color: event.holiday_type === 'Public Holiday' ? '#222' : '#212122',
    allDay: true,
    extendedProps: {
      type: event.holiday_type || 'Holiday',
      day: event.day || 'N/A',
      date: event.start || 'N/A',
    }
  }));

  const calendarEvents = [...holidayEvents, ...approvedLeaveEvents];
  const upcomingLeaves = (leaveRequests || [])
    .filter((leave) => {
      if (!leave.from) return false;
      const start = new Date(leave.from);
      const now = new Date();
      const isApproved = leave.status === 'Approved';
      const isUpcoming = start > now;
      return isApproved && isUpcoming;
    })
    .sort((a, b) => new Date(a.from) - new Date(b.from))
    .slice(0, 1);
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
      {/* <div className="d-flex justify-content-center mb-3 gap-3 w-100">
        
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
      </div> */}

      {/* Leave Balance Cards */}
      <Row className="g-1 mb-4">
        <div style={{
          display: 'flex',
          flexDirection: 'row',
          overflowY: 'auto',
          scrollbarWidth: 'none',    // Firefox
          msOverflowStyle: 'none',        // IE/Edge
          minHeight: '100px',
          height: 'auto',
          gap: 20
        }}>
          {(() => {
            const leaveTypeColors = (leaveTypes).reduce((acc, type) => {
              acc[type.name] = type.color;
              return acc;
            }, {});
            const usedLeave = {};
            (leaveRequests || []).forEach(lr => {
              const isApproved = lr.status === 'Approved';
              if (!isApproved) return;
              const type = lr.type;
              const startDate = new Date(lr.start);
              const leaveMonth = startDate.getMonth();
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
            return (leaveTypes || []).filter(type => type.is_active).map(type => {
              const leaveName = type.name;
              const isYearly = ['Marriage Leave', 'Maternity Leave'].includes(leaveName);
              const quota = isYearly ? type.days : Math.round(type.days / 12);
              const used = Math.round(usedLeave[leaveName] || 0);
              const color = leaveTypeColors[leaveName];
              const percent = quota > 0 ? Math.min(100, Math.round((used / quota) * 100)) : 0;
              const icon = type.icon
              const isExceeded = used > quota;

              return (
                <Col key={leaveName} xl={4} md={6} className="d-flex">
                  <Card
                    className="stat-card flex-fill p-3"
                    style={{
                      borderLeft: `6px solid ${color}`,
                      background: `${color}100`,
                      boxShadow: '0 2px 8px rgba(77,73,179,0.06)',
                      width: '200px',
                      height: 'auto',
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
                          <span role="img" aria-label="Leave Type"
                            style={{ fontSize: '2rem' }}>
                            {icon}</span>
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
        </div></Row>

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
            </div>

            {/* NEW Scrollable Table */}
            <Card>
              <div className="d-flex justify-content-between align-items-center mb-2">
                <div>
                  <Button
                    variant={leaveTab === 'all' ? 'primary' : '#4D49B3'}
                    size="m"
                    className="me-2"
                    onClick={() => setLeaveTab('all')}
                  >All</Button>
                  <Button
                    variant={leaveTab === 'Approved' ? 'success' : 'outline-success'}
                    size="m"
                    className="me-2"
                    onClick={() => setLeaveTab('Approved')}
                  >Approved</Button>
                  <Button
                    variant={leaveTab === 'Pending' ? 'warning' : 'outline-warning'}
                    size="m"
                    className="me-2"
                    onClick={() => setLeaveTab('Pending')}
                  >Pending</Button>
                  <Button
                    variant={leaveTab === 'Rejected' ? 'danger' : 'outline-danger'}
                    size="m"
                    onClick={() => setLeaveTab('Rejected')}
                  >Rejected</Button>
                </div>
                <Button variant='outline-dark' size="m" onClick={() => window.location.href = '#'}>
                  View All
                </Button>
              </div>
              <div
                style={{
                  borderRadius: '20px',
                  marginTop: '2rem',
                  height: '510px',
                  minHeight: '510px',
                  maxHeight: '510px',
                  overflowY: 'auto',
                  scrollbarWidth: 'none',        // Firefox
                  msOverflowStyle: 'none'        // IE/Edge
                }}
                className="scroll-container"
              >
                <Table
                  columns={leaveRequestColumns}
                  data={leaveRequests.filter(lr => leaveTab === 'all' ? true : lr.status === leaveTab)}
                  onRowClick={(row) => { }}
                />
              </div>
            </Card>
          </div>
        </Col>

        {/* Upcoming */}
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
                  height: upcomingLeaves.length === 0 ? '430px' : '350px',
                }}
              >
                <div style={{
                  height: upcomingLeaves.length === 0 ? '430px' : '350px',
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
          <h5 style={{ fontWeight: 'bold', marginBottom: '0' }}>📅 Team Calendar
          </h5>
          <p style={{ marginTop: 0, marginBottom: '0.5rem', color: '#666' }}>
            Keep track of holidays and team leave days</p>
        </div>
        <Col>
          <div className="calendar-modern-container" style={{ background: '#fff', borderRadius: 10, boxShadow: '0 2px 16px #e6e8f0', padding: 32, marginBottom: 24 }}>
            {/* Header: Month/Year label with custom prev/next buttons and filters */}
            <div className="d-flex flex-wrap align-items-center justify-content-between gap-2 mb-3">
              {/* Month First + Custom Prev/Next */}
              <div className="d-flex align-items-center gap-2">
                <button
                  aria-label="Previous Month"
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: '50%',
                    background: '#4D49B3',
                    color: '#fff',
                    border: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 18,
                    boxShadow: '0 1px 4px #e6e8f0',
                    cursor: 'pointer',
                  }}
                  onClick={() => {
                    let prevMonth = selectedMonth - 1;
                    let year = selectedYear;
                    if (prevMonth < 0) {
                      prevMonth = 11;
                      year = selectedYear - 1;
                    }
                    setSelectedMonth(prevMonth);
                    setSelectedYear(year);
                    setCalendarViewDate(new Date(year, prevMonth, 1));
                    if (calendarRef.current) {
                      calendarRef.current.getApi().gotoDate(new Date(year, prevMonth, 1));
                    }
                  }}
                >
                  {/* Smooth left chevron SVG */}
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M13 16L8 10L13 4" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
                <button
                  aria-label="Next Month"
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: '50%',
                    background: '#4D49B3',
                    color: '#fff',
                    border: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 18,
                    boxShadow: '0 1px 4px #e6e8f0',
                    marginRight: 8,
                    cursor: 'pointer',
                  }}
                  onClick={() => {
                    let nextMonth = selectedMonth + 1;
                    let year = selectedYear;
                    if (nextMonth > 11) {
                      nextMonth = 0;
                      year = selectedYear + 1;
                    }
                    setSelectedMonth(nextMonth);
                    setSelectedYear(year);
                    setCalendarViewDate(new Date(year, nextMonth, 1));
                    if (calendarRef.current) {
                      calendarRef.current.getApi().gotoDate(new Date(year, nextMonth, 1));
                    }
                  }}
                >
                  {/* Smooth right chevron SVG */}
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M7 4L12 10L7 16" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
                <div style={{ fontWeight: 700, fontSize: 22, color: '#4D49B3', whiteSpace: 'nowrap' }}>
                  {months[calendarViewDate.getMonth()]} {calendarViewDate.getFullYear()}
                </div>
              </div>
              {/* Filter */}
              <div className="d-flex align-items-center gap-2 flex-wrap">
                <Button
                  variant="outline-dark"
                  size="sm"
                  style={{ fontWeight: 600 }}
                  onClick={() => {
                    const today = new Date();
                    setSelectedYear(today.getFullYear());
                    setSelectedMonth(today.getMonth());
                    setCalendarViewDate(new Date(today.getFullYear(), today.getMonth(), 1));
                    if (calendarRef.current) {
                      calendarRef.current.getApi().gotoDate(today);
                    }
                  }}
                >Today</Button>
                <Form.Select
                  size="sm"
                  style={{ width: 120, borderRadius: 8, fontWeight: 500 }}
                  value={selectedYear}
                  onChange={e => {
                    setSelectedYear(Number(e.target.value));
                    setCalendarViewDate(new Date(Number(e.target.value), selectedMonth, 1));
                  }}
                >
                  {years.map(y => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </Form.Select>
                <Form.Select
                  size="sm"
                  style={{ width: 120, borderRadius: 8, fontWeight: 500 }}
                  value={selectedMonth}
                  onChange={e => {
                    setSelectedMonth(Number(e.target.value));
                    setCalendarViewDate(new Date(selectedYear, Number(e.target.value), 1));
                  }}
                >
                  {months.map((m, idx) => (
                    <option key={m} value={idx}>{m}</option>
                  ))}
                </Form.Select>
              </div>
            </div>

            <div style={{ padding: 12 }}>
              <FullCalendar
                ref={calendarRef}
                plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                initialView="dayGridMonth"
                events={calendarEvents}
                headerToolbar={{
                  left: '',
                  center: '',
                  right: 'dayGridMonth,timeGridWeek,timeGridDay'
                }}
                eventDidMount={(info) => {
                  const { type, day, date, leaveType, employee, department } = info.event.extendedProps;
                  let tooltipContent;
                  if (type === 'Leave') {
                    tooltipContent = `
                              <div style='font-weight:bold;'>${info.event.title}</div>
                              <div><b>Type:</b> ${leaveType || '-'}</div>
                              <div><b>Employee:</b> ${employee || '-'}</div>
                              <div><b>Department:</b> ${department || '-'}</div>
                              <div><b>Total Days:</b> ${day}</div>
                              <div><b>Date:</b> ${date}</div>
                            `;
                  } else {
                    tooltipContent = `
                              <div style='font-weight:bold;'>${info.event.title}</div>
                              <div><b>Type:</b> ${type}</div>
                              <div><b>Day:</b> ${day}</div>
                            `;
                  }
                  const tip = tippy(info.el, {
                    content: tooltipContent,
                    allowHTML: true,
                    placement: 'top',
                    trigger: 'mouseenter',
                    hideOnClick: true,
                    interactive: false,
                    onShow(instance) {
                      document.querySelectorAll('.tippy-box').forEach(box => {
                        if (box._tippy && box._tippy !== instance) box._tippy.hide();
                      });
                    },
                  });
                  info.el.addEventListener('mouseleave', () => {
                    tip[0]?.hide && tip[0].hide();
                  });
                }}
                dateSet={arg => {
                  setSelectedMonth(arg.start.getMonth());
                  setSelectedYear(arg.start.getFullYear());
                  setCalendarViewDate(new Date(arg.start.getFullYear(), arg.start.getMonth(), 1));
                }}
                height="auto"
              />
              {/* Legend below calendar, with circle indicators */}
              <div className="d-flex align-items-center gap-3 flex-wrap mt-3" style={{ fontSize: 14 }}>
                <div className="d-flex align-items-center gap-1">
                  <span style={{ display: 'inline-block', width: 16, height: 16, borderRadius: '50%', background: '#222', marginRight: 4, border: '2px solid #fff', boxShadow: '0 0 0 1.5px #e6e8f0' }}></span>
                  <span>Public Holiday and Company Event</span>
                </div>
                {/* Add leave type color legend dynamically */}
                {leaveTypes && leaveTypes.length > 0 && leaveTypes.map(type => (
                  <div key={type.name} className="d-flex align-items-center gap-1">
                    <span style={{ display: 'inline-block', width: 16, height: 16, borderRadius: '50%', background: type.color, marginRight: 4, border: '2px solid #fff', boxShadow: '0 0 0 1.5px #e6e8f0' }}></span>
                    <span>{type.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Col>
      </Row>
    </div>
  );
};
export default EmployeeDashboard;
