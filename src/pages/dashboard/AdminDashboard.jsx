// AdminDashboard.jsx
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
import { getUsers } from '../../services/userService';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import tippy from 'tippy.js';
import 'tippy.js/dist/tippy.css';
import LeaveBarChart from '../../components/Chart/LeaveBarChart';
import LeaveTypeMonthBarChart from '../../components/Chart/LeaveTypeMonthBarChart';
import CustomLoader from '../../components/CustomLoader';

const AdminDashboard = () => {

  const { t } = useTranslation();
  // User state and loading flag
  const [user, setUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [departments, setDepartments] = useState([]);
  const [events, setEvents] = useState([]);
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [leaveType, setLeaveTypes] = useState([]);
  const [users, setUsers] = useState([]);
  const [leaveSettings, setLeaveSettings] = useState(null);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const calendarRef = useRef(null);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth()); // 0-based
  // Add state to track calendar's current view date
  const [calendarViewDate, setCalendarViewDate] = useState(new Date(selectedYear, selectedMonth, 1));

  // Fetch user info on mount
  useEffect(() => {
    const loggedInUser = authService.getUser();
    setUser(loggedInUser);
    setLoadingUser(false);
  }, []);

  // Fetch departments, events, leave types, and users on mount
  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [departmentsRes, eventsRes, leaveTypesRes, usersRes] = await Promise.all([
          getDepartments(),
          getEvents(),
          getLeaveTypes(),
          getUsers()
        ]);
        setDepartments(departmentsRes);
        setEvents(eventsRes);
        setLeaveTypes(leaveTypesRes);
        setUsers(usersRes);
      } catch (error) {
        console.error('Failed to fetch initial data', error);
      }
    };
    fetchAll();
  }, []);

  // Fetch leave requests after users are loaded
  useEffect(() => {
    if (users.length === 0) return;
    const fetchLeaveRequests = async () => {
      try {
        const data = await getLeave();
        data.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        // Enrich leave requests with department name from users
        const formatted = data.map(item => {
          const user = users.find(u => `${u.first_name} ${u.last_name}` === item.employee_name);
          const departmentName = user && user.department ? user.department.name : 'Unknown';
          return {
            id: item.id,
            employee_name: item.employee_name,
            type: item.leave_type_name,
            from: item.start_date,
            to: item.end_date,
            days: item.days,
            status: item.status,
            created: new Date(item.created_at).toLocaleDateString(),
            created_at: item.created_at,
            leave_type_name: item.leave_type_name,
            department: departmentName
          };
        });
        setLeaveRequests(formatted);
      } catch (err) {
        console.error('Failed to fetch leave requests:', err);
      }
    };
    fetchLeaveRequests();
  }, [users]);

  // Fetch leave settings on mount
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const settings = await getLeaveSettings();
        setLeaveSettings(settings);
      } catch (err) {
        console.error('Failed to fetch leave settings:', err);
      }
    };
    fetchSettings();
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

  // Update calendarViewDate when dropdowns change
  useEffect(() => {
    setCalendarViewDate(new Date(selectedYear, selectedMonth, 1));
  }, [selectedYear, selectedMonth]);

  // --- Monthly Approved Leave Aggregation ---
  const approvedLeavesByMonth = Array(12).fill(0); // Jan to Dec
  leaveRequests.forEach(lr => {
    if ((lr.status === 'Approved' || lr.status === 'approved') && new Date(lr.from).getFullYear() === Number(selectedYear)) {
      const month = new Date(lr.from).getMonth(); // 0-based
      approvedLeavesByMonth[month]++;
    }
  });

  // Loading screen
  if (loadingUser) {
    return (
      <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <CustomLoader />
      </div>
    );
  }

  // No user fallback
  if (!user) {
    return <div className="dashboardPage-page">User not found. Please log in.</div>;
  }

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

  // --- Calendar Events (with filter logic and correct color for Public Holiday) ---
  const leaveTypeColorMap = {};
  leaveType.forEach(type => {
    leaveTypeColorMap[type.name] = type.color || '#00905F';
  });

  // Filter leave requests by selected year, month, and department (overlapping logic)
  const filteredLeaveRequests = (leaveRequests ?? []).filter(leave => {
    if (!leave.from || !leave.to) return false;
    const leaveStart = new Date(leave.from);
    const leaveEnd = new Date(leave.to);
    const monthStart = new Date(selectedYear, selectedMonth, 1);
    const monthEnd = new Date(selectedYear, selectedMonth + 1, 0, 23, 59, 59, 999); // last ms of month
    const matchesDept = !selectedDepartment || leave.department === selectedDepartment;
    const overlapsMonth = leaveEnd >= monthStart && leaveStart <= monthEnd;
    return matchesDept && overlapsMonth && leave.status === 'Approved';
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

  // Debug: Log leave requests per department (approved only)
  const approvedLeavesPerDepartment = departments.map(dept => {
    const approved = leaveRequests.filter(lr => lr.department === dept.name && lr.status === 'Approved');
    return { department: dept.name, approvedCount: approved.length, approvedLeaves: approved };
  });
  console.log('Approved leave requests per department HERE:', approvedLeavesPerDepartment);

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
          <div className="text-muted" style={{ fontSize: 16 }}>
            Manage settings, view reports, and stay in control
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

      {/* List of Department header and sub-header */}
      <div className="department-list-header">
        <h5 style={{ fontWeight: 'bold', marginBottom: '0.7rem' }}>List of Department</h5>
      </div>

      <div style={{
        display: 'flex',
        flexDirection: 'row',
        overflowY: 'auto',
        scrollbarWidth: 'none',    // Firefox
        msOverflowStyle: 'none',        // IE/Edge
        minHeight: '230px',
        height: 'auto',
        width: 'calc(100vw - 200px)'
      }}>
        {departments.length > 0 ? (
          departments.map((dept) => {
            const icon = dept.icon || '🏢';
            return (
              <Col key={dept.id} style={{ display: 'flex', gap: '1rem', padding: '0.5rem', flex: '0 0 auto' }}>
                <Card
                  className="stat-card department-card"
                  style={{
                    border: 'none',
                    boxShadow: '0 2px 16px #e6e8f0',
                    transition: 'box-shadow 0.2s',
                    marginBottom: 0,
                    padding: '100px',
                  }}
                >
                  <div className="d-flex gap-1 w-100" style={{ padding: 20 }}>
                    {/* Emoji Icon with circle and stroke */}
                    <div
                      className="emoji-icon flex-shrink-0"
                      style={{
                        width: 80,
                        height: 80,
                        borderRadius: '100%',
                        background: '#f4f4fa',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: '2px solid #e0e0f0',
                      }}
                    >
                      <span role="img" aria-label="Department Icon" style={{ fontSize: 40 }}>{icon}</span>
                    </div>
                    {/* Department Info */}
                    <div className="ms-2" style={{ flex: 1 }}>
                      <h5 className="fw-bold mb-1" style={{ color: '#4D49B3', fontSize: 22 }}>{dept.name}</h5>
                      <p className="mb-1" style={{ fontSize: 16, color: '#555' }}>
                        <span role="img" aria-label="Employees">👥</span> <b>{dept.total_employees}</b> Employees
                      </p>
                      <p className="mb-1" style={{ fontSize: 16, color: '#555' }}>
                        <span role="img" aria-label="Manager">🧑‍💼</span> Manager: <b>{dept.manager_name}</b>
                      </p>
                      <p className="mb-0" style={{ fontSize: 14, color: '#888' }}>
                        <span role="img" aria-label="Updated">🔄</span> Last Updated: {formatDateDMY(dept.updated_at)}
                      </p>
                    </div>
                  </div>
                </Card>
              </Col>
            );
          })
        ) : (
          <Col><p>No departments available.</p></Col>
        )}
      </div>

      {/* Leave Requests Overview */}
      <Row className="g-3">
        <Col lg={9}>
          <Card className="mb-3">
            <div style={{ padding: 24 }}>
              <div className="d-flex flex-wrap align-items-center justify-content-between mb-3" style={{ gap: 16 }}>
                <div>
                  <h5 style={{ fontWeight: 'bold', marginBottom: 0 }}>📊 Leaves Overview</h5>
                  <p style={{ marginBottom: 0, color: '#666' }}>
                    Number of leave requests per type, per month
                  </p>
                </div>
                <div className="d-flex gap-2">
                  <Form.Select
                    size="sm"
                    style={{ width: 180 }}
                    value={selectedDepartment}
                    onChange={e => setSelectedDepartment(e.target.value)}
                  >
                    <option value="">All Departments</option>
                    {departments.map(d => (
                      <option key={d.id} value={d.name}>{d.name}</option>
                    ))}
                  </Form.Select>
                  <Form.Select
                    size="sm"
                    style={{ width: 120 }}
                    value={selectedYear}
                    onChange={e => setSelectedYear(Number(e.target.value))}
                  >
                    {years.map(y => (
                      <option key={y} value={y}>{y}</option>
                    ))}
                  </Form.Select>
                </div>
              </div>
              <div className="d-flex flex-row" style={{ gap: 32, alignItems: 'flex-start' }}>
                <div style={{ flex: 1 }}>
                  <LeaveTypeMonthBarChart
                    leaveRequests={leaveRequests}
                    leaveTypes={leaveType}
                    department={selectedDepartment}
                    year={selectedYear}
                    hideLegend={true}
                  />
                </div>
              </div>
            </div>
          </Card>
        </Col>

        {/* Types */}
        <Col lg={3}>
          <div className="d-flex flex-column h-100">
            <Card>
               <div className="department-list-header">
              <div className="d-flex align-items-center">
                <div>
                  <h5 style={{ fontWeight: 'bold', marginBottom: 0 }}>Leave Types</h5>
                  <p style={{ marginBottom: '0.5rem', color: '#666' }}>
                    Each color represents a different type of leave
                  </p>
                </div>
              </div>
            </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 20, padding: 16, minHeight: '300px', height: '650px', maxHeight: '650px' }}>
                {leaveType.length > 0 ? (
                  leaveType.map((type) => (
                    <div className="leave-type-row"
                      key={type.leave_type_id || type.id || type.name}>
                      <span
                        className="leave-dot"
                        style={{
                          width: 20,
                          height: 20,
                          borderRadius: '50%',
                          backgroundColor: type.color,
                          display: 'inline-block',
                          marginRight: 1,
                        }}
                      ></span>
                      <span className="leave-type-name" style={{ fontWeight: 600, fontSize: 16, color: '#333', flex: 1 }}>
                        {type.name}
                      </span>
                      <span style={{
                        background: '#f1f3fa',
                        color: '#4D49B3',
                        fontWeight: 700,
                        fontSize: 13,
                        borderRadius: 8,
                        padding: '4px 12px',
                        marginLeft: 10,
                        letterSpacing: 0.5,
                      }}>{type.days} days</span>
                    </div>
                  ))
                ) : (
                  <div className="text-muted">No leave types found.</div>
                )}
              </div>
            </Card>
          </div>
        </Col>
      </Row>

      {/* Holiday Calendar */}
      <Row className="g-1">
        <div className="department-list-header mb-2">
          <h5 style={{ fontWeight: 'bold', marginTop: '0.5rem' }}>📅 Team Calendar</h5>
          <p style={{ marginBottom: '0rem', color: '#666' }}>
            Keep track of holidays and team leave days
          </p>
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
                  style={{ width: 180, borderRadius: 8, fontWeight: 500 }}
                  value={selectedDepartment}
                  onChange={e => setSelectedDepartment(e.target.value)}
                >
                  <option value="">All Departments</option>
                  {departments.map(d => (
                    <option key={d.id} value={d.name}>{d.name}</option>
                  ))}
                </Form.Select>

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
                {leaveType && leaveType.length > 0 && leaveType.map(type => (
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

      {/* --- Modern Upcoming Holidays Table --- */}
      <Row className="g-3">
        <Col lg={8}>
          <div className="department-list-header mb-2">
            <h5 style={{ fontWeight: 'bold', marginBottom: 0 }}>🎉 Upcoming Holidays</h5>
            <p style={{ marginBottom: '0.5rem', color: '#666' }}>
              See what holidays are coming soon
            </p>
          </div>
          <Card style={{ borderRadius: 10, boxShadow: '0 2px 12px #e6e8f0', background: '#fff', padding: 0 }}>
            <div style={{
              overflowY: 'auto',
              scrollbarWidth: 'none',        // Firefox
              msOverflowStyle: 'none',        // IE/Edge
              minHeight: '270px',
              height: '400px',
              maxHeight: '500px'
            }}>
              <table className="table table-borderless align-middle mb-0" style={{ minWidth: 520, gap: 5 }}>
                <thead style={{ background: '#f8f9fb', position: 'sticky', top: 0, zIndex: 2 }}>
                  <tr style={{ fontWeight: 700, color: '#4D49B3', fontSize: 15 }}>
                    <th style={{ padding: '12px 16px' }}>Date</th>
                    <th style={{ padding: '12px 16px' }}>Day</th>
                    <th style={{ padding: '12px 16px' }}>Name</th>
                    <th style={{ padding: '12px 16px' }}>Type</th>
                  </tr>
                </thead>
                <tbody>
                  {upcomingHolidays.length > 0 ? (
                    upcomingHolidays.map((event, idx) => (
                      <tr key={idx} style={{ borderBottom: '1px solid #f0f1f2' }}>
                        <td style={{ padding: '12px 16px' }}>{event.date}</td>
                        <td style={{ padding: '12px 16px', fontWeight: 600 }}>{event.day}</td>
                        <td style={{ padding: '12px 16px', fontWeight: 500 }}>{event.name}</td>
                        <td style={{ padding: '12px 16px' }}>
                          <span
                            style={{
                              background: '#d6d6d6',
                              color: '#212122',
                              fontWeight: 700,
                              borderRadius: 8,
                              padding: '4px 12px',
                              fontSize: 13,
                              display: 'inline-block',
                              minWidth: 90,
                              textAlign: 'center',
                              letterSpacing: 0.2
                            }}
                          >
                            {event.type}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="text-muted text-center py-4">No upcoming holidays</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </Col>

        {/* Leave Setting Display */}
        <Col lg={4}>
          <div className="department-list-header">
            {/* Work Hours Overview */}
            <div className="d-flex align-items-center">
              <div>
                <h5 style={{ fontWeight: 'bold', marginBottom: '0' }}>Current Work Hours Overview</h5>
                <p style={{ marginBottom: '0.5rem', color: '#666' }}>
                  See your current work hours at a glance
                </p>
              </div>
            </div>
          </div>
          {/* Content */}
          <div className="d-flex flex-column">
            <Card className="mb-4 flex-grow-1" style={{ background: '#f8f9fb', border: 'none', borderRadius: 18, boxShadow: '0 2px 12px #e6e8f0', minHeight: 180, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: 0 }}>
              <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: 5, height: '100%' }}>
                <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 32 }}>
                  <div>
                    <div style={{ fontWeight: 'bold', color: '#495057', fontSize: '0.95rem', marginBottom: 3 }}>Start Time - End Time</div>
                    <div style={{ fontSize: 18, color: '#212122', marginBottom: 0 }}>
                      {leaveSettings ? (
                        leaveSettings.is_flexible_hours_enabled
                          ? 'Flexible Hours'
                          : `${formatTime(leaveSettings.working_hours_start)} - ${formatTime(leaveSettings.working_hours_end)}`
                      ) : '...'}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontWeight: 'bold', color: '#495057', fontSize: '0.95rem', marginBottom: 3 }}>Days Active</div>
                    <div style={{ fontSize: 18, color: '#212122', marginBottom: 0 }}>
                      {leaveSettings ? getActiveDaysText(leaveSettings) : '...'}
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Header Leave Cycle Status */}
          <div className="department-list-header">
            <div className="d-flex align-items-center">
              <div>
                <h5 style={{ fontWeight: 'bold', marginBottom: '0' }}>Leave Cycle Status</h5>
                <p style={{ marginBottom: '0.5rem', color: '#666' }}>
                  See your current leave cycle status at a glance
                </p>
              </div>
            </div>
          </div>
          {/* Content */}
          <div className="d-flex flex-column">
            <Card className="mb-4 flex-grow-1" style={{ background: '#f8f9fb', border: 'none', borderRadius: 18, boxShadow: '0 2px 12px #e6e8f0', minHeight: 180, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: 0 }}>
              <div style={{ display: 'flex', flexDirection: 'column', padding: 5, height: '100%' }}>
                {/* Leave Cycle Status */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <div style={{ fontWeight: 'bold', color: '#495057', fontSize: '0.95rem', marginBottom: -5 }}>Leave Year</div>
                  <div style={{ fontSize: 18, fontWeight: 600, color: '#00905F', marginBottom: -7 }}>
                    {leaveSettings ? (
                      leaveSettings.cycle_type === 'annual'
                        ? 'Annual Cycle'
                        : 'Join Date Anniversary'
                    ) : '...'}
                  </div>
                  <div style={{ fontSize: 15, color: '#555' }}>
                    {leaveSettings && leaveSettings.cycle_type === 'annual'
                      ? 'January 1st to December 31st'
                      : ''}
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </Col>
      </Row>
    </div>
  );
};

export default AdminDashboard;

// --- Helper functions for formatting ---
function formatTime(timeStr) {
  if (!timeStr) return '';
  const [h, m] = timeStr.split(':');
  const date = new Date();
  date.setHours(Number(h), Number(m));
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}
function getActiveDaysText(settings) {
  if (!settings) return '';
  const days = [];
  if (settings.is_weekday_workday) days.push('Monday to Friday');
  if (settings.is_weekend_workday) days.push('Saturday to Sunday');
  return days.length ? days.join(', ') : 'N/A';
}
function formatDateDMY(dateStr) {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  if (isNaN(date)) return dateStr;
  const day = date.getDate();
  const month = date.toLocaleString('default', { month: 'short' });
  const year = date.getFullYear();
  return `${day} ${month} ${year}`;
}
