// ManagerDashboard.jsx
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
import CustomLoader from '../../components/CustomLoader';

const ManagerDashboard = () => {

  const { t } = useTranslation();
  // User state and loading flag
  const [user, setUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [loadingDashboard, setLoadingDashboard] = useState(true);
  const [departments, setDepartments] = useState([]);
  const [events, setEvents] = useState([]);
  const [leaveRequestTab, setLeaveRequestTab] = useState('All');
  const [leaveTab, setLeaveTab] = useState('all');
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [leaveType, setLeaveTypes] = useState([]);
  const [users, setUsers] = useState([]);
  //leave balanace and month filter
  const [leaveStats, setLeaveStats] = useState({});
  const [leaveQuotas, setLeaveQuotas] = useState({});
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [leaveSettings, setLeaveSettings] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth()); // Default to current month
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const calendarRef = useRef(null);
  const [calendarViewDate, setCalendarViewDate] = useState(new Date(selectedYear, selectedMonth, 1));

  // Fetch user info on mount
  useEffect(() => {
    const loggedInUser = authService.getUser();
    setUser(loggedInUser);
    setLoadingUser(false);
  }, []);

  // Fetch departments, events, leave types, users after user is loaded
  useEffect(() => {
    if (!user) return;
    setLoadingDashboard(true);
    Promise.all([
      getDepartments(),
      getEvents(),
      getLeaveTypes(),
      getUsers(),
      getLeaveSettings()
    ]).then(([departmentsRes, eventsRes, leaveTypesRes, usersRes, leaveSettingsRes]) => {
      setDepartments(departmentsRes);
      setEvents(eventsRes);
      setLeaveTypes(leaveTypesRes);
      setUsers(usersRes);
      setLeaveSettings(leaveSettingsRes);
      setLoadingDashboard(false);
    }).catch((error) => {
      setLoadingDashboard(false);
      console.error('Failed to fetch dashboard data', error);
    });
  }, [user]);

  // Fetch leave requests after users are loaded
  useEffect(() => {
    if (!user || users.length === 0) return;
    const fetchLeaveRequests = async () => {
      try {
        const data = await getLeave();
        const managerDeptId = user && user.department ? user.department.id : null;
        const deptUsers = users.filter(u => u.department && u.department.id === managerDeptId);
        const deptUserIds = deptUsers.map(u => u.id);
        data.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        const formatted = data
          .map(item => {
            const userObj = users.find(u => `${u.first_name} ${u.last_name}` === item.employee_name);
            const departmentName = userObj && userObj.department ? userObj.department.name : 'Unknown';
            const departmentId = userObj && userObj.department ? userObj.department.id : null;
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
              department: departmentName,
              department_id: departmentId,
              user_id: userObj ? userObj.id : null
            };
          })
          .filter(lr => lr.user_id && deptUserIds.includes(lr.user_id));
        setLeaveRequests(formatted);
      } catch (err) {
        console.error('Failed to fetch leave requests:', err);
      }
    };
    fetchLeaveRequests();
  }, [user, users]);

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

  // Loading screen
  if (loadingUser || loadingDashboard) {
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

  // Columns for the leave requests table
  const leaveRequestColumns = [
    { key: 'employee', title: 'Employee Name', render: (row) => t(row.employee_name) },
    { key: 'type', title: 'Leave Types', render: (row) => t(row.type) },
    { key: 'from', title: 'Start Date', render: (row) => row.from },
    { key: 'to', title: 'End Date', render: (row) => row.to },
    { key: 'days', title: 'Days', render: (row) => row.days },
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

  // --- Calendar Events (with filter logic and correct color for Public Holiday) ---
  const leaveTypeColorMap = {};
  leaveType.forEach(type => {
    leaveTypeColorMap[type.name] = type.color || '#00905F';
  });

  // Filter leave requests by selected year, month, and department (overlapping logic, only 'Approved')
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

  // Employees on leave today (horizontal card)
  const employeesOnLeaveToday = leaveRequests.filter(lr => {
    // Parse dates and compare only date part (ignore time)
    const today = new Date();
    const from = new Date(lr.from);
    const to = new Date(lr.to);
    // Set all to midnight for accurate comparison
    today.setHours(0, 0, 0, 0);
    from.setHours(0, 0, 0, 0);
    to.setHours(0, 0, 0, 0);
    // Accept if today is between from and to, and status is 'Approved' (case-insensitive, fallback for missing status)
    return today >= from && today <= to && (!lr.status || lr.status.toLowerCase() === 'approved');
  });

  console.log('Employees on leave today:', employeesOnLeaveToday);

  // Calculate total employees in manager's department (excluding the manager)
  const managerDeptId = user && user.department ? user.department.id : null;
  const totalEmployees = users.filter(u => u.department && u.department.id === managerDeptId && u.id !== user.id).length;

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
        <h5 style={{ fontWeight: 'bold', marginBottom: '0' }}>Quick Team Insight</h5>
        <div style={{ marginBottom: '1rem', marginTop: '0.5rem' }}>
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
        
        {/* Stat Cards Row */}
        <div style={{ display: 'flex', gap: 18, marginBottom: 24, flexWrap: 'wrap' }}>
          {/* All */}
          <div style={{
            background: '#4D49B3',
            borderRadius: 14,
            boxShadow: '0 2px 8px #e6e8f0',
            padding: '1.2rem 2.2rem',
            minWidth: 170,
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
            justifyContent: 'center',
          }}>
            <div style={{ fontWeight: 700, fontSize: 28, color: '#fff' }}>{leaveRequests.length}</div>
            <div style={{ fontWeight: 600, color: '#fff', fontSize: 16 }}>All</div>
          </div>
          {/* Approved */}
          <div style={{
            background: '#fff',
            borderLeft: '6px solid #00905F',
            borderRadius: 14,
            boxShadow: '0 2px 8px #e6e8f0',
            padding: '1.2rem 2.2rem',
            minWidth: 170,
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
            justifyContent: 'center',
          }}>
            <div style={{ fontWeight: 700, fontSize: 28, color: '#00905F' }}>{leaveRequests.filter(lr => lr.status === 'Approved').length}</div>
            <div style={{ fontWeight: 600, color: '#333', fontSize: 16 }}>Approved</div>
          </div>
          {/* Pending */}
          <div style={{
            background: '#fff',
            borderLeft: '6px solid #FFB900',
            borderRadius: 14,
            boxShadow: '0 2px 8px #e6e8f0',
            padding: '1.2rem 2.2rem',
            minWidth: 170,
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
            justifyContent: 'center',
          }}>
            <div style={{ fontWeight: 700, fontSize: 28, color: '#FFB900' }}>{leaveRequests.filter(lr => lr.status === 'Pending').length}</div>
            <div style={{ fontWeight: 600, color: '#333', fontSize: 16 }}>Pending</div>
          </div>
          {/* Rejected */}
          <div style={{
            background: '#fff',
            borderLeft: '6px solid #C31818',
            borderRadius: 14,
            boxShadow: '0 2px 8px #e6e8f0',
            padding: '1.2rem 2.2rem',
            minWidth: 170,
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
            justifyContent: 'center',
          }}>
            <div style={{ fontWeight: 700, fontSize: 28, color: '#C31818' }}>{leaveRequests.filter(lr => lr.status === 'Rejected').length}</div>
            <div style={{ fontWeight: 600, color: '#333', fontSize: 16 }}>Rejected</div>
          </div>
        </div>
      </div>

      <Row className="g-3">
        {/* Tabbed Leave Request List */}
        <Col xl={8}>
          <div className="department-list-header">
            <h5 style={{ fontWeight: 'bold', marginBottom: 0 }}>Leave Requests Approval</h5>
            <p style={{ marginBottom: '0.5rem', color: '#666' }}>
              View and manage all leave requests from your team members. Use the tabs to filter by status.
            </p>
          </div>
          <Card className="p-3">
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
              <Button variant='outline-dark' size="m" onClick={() => window.location.href = '/leaves-approval'}>
                View All
              </Button>
            </div>
            <div
              style={{
                borderRadius: '15px',
                marginTop: '2rem',
                height: '500px',
                minHeight: '500px',
                maxHeight: '500px',
                overflowY: 'auto',
                scrollbarWidth: 'none',        // Firefox
                msOverflowStyle: 'none'        // IE/Edge
              }}
            >
              <Table
                columns={leaveRequestColumns.filter(col => col.key !== 'actions')}
                data={leaveRequests.filter(lr => leaveTab === 'all' ? true : lr.status === leaveTab)}
                onRowClick={(row) => { }}
              />
            </div>
          </Card>
        </Col>

        {/* List of Team Members */}
        <Col xl={4}>
          <div className="d-flex flex-wrap justify-content-between align-items-right mb-3">
            <div className="department-list-header">
              <h5 style={{ fontWeight: 'bold', marginBottom: 0 }}>List of Team Members</h5>
              <p style={{ marginBottom: '0.5rem', color: '#666' }}>
                The number of employee in {user?.department?.name || '-'} department
              </p>
            </div>

            {/* Total Employee */}
            <div style={{
              marginBottom: '0.3rem',
            }}>
              <span
                style={{
                  backgroundColor: '#4D49B3',
                  color: '#fff',
                  padding: '0.25rem 0.6rem',
                  borderRadius: '0.3rem',
                  fontSize: '1rem',
                  fontWeight: 'bold',
                }}
              >
                Total Employees: {users.filter(u => u.department && u.department.id === managerDeptId && u.id !== user.id).length}
              </span>
            </div>
          </div>

          <Card className="h-auto">
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 20,
              overflowY: 'auto',
              scrollbarWidth: 'none',        // Firefox
              msOverflowStyle: 'none',        // IE/Edge
              minHeight: '550px',
              height: '550px',
              maxHeight: '550px'
            }}>
              {users.filter(u => u.department && u.department.id === managerDeptId && u.id !== user.id).length === 0 ? (
                <div className="text-muted">No team members found.</div>
              ) : 
                users.filter(u => u.department && u.department.id === managerDeptId && u.id !== user.id).map(u => (
                  <div key={u.id} style={{ display: 'flex', alignItems: 'center', gap: 10, background: '#f8f9fb', borderRadius: 8, padding: '10px 16px' }}>
                    <span style={{ fontWeight: 600, color: '#4D49B3', fontSize: 16 }}>{u.first_name} {u.last_name}</span>
                    <span style={{ color: '#888', fontSize: 13, marginLeft: 'auto' }}>{u.email}</span>
                  </div>
                ))
              }
            </div>
          </Card>

        </Col>
      </Row>

      {/* Team and Holiday Calendar */}
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

      {/* On Leave Today - styled card list, moved here */}
      <Row className="g-1">
        <div className="department-list-header">
          <h5 style={{ fontWeight: 'bold', marginBottom: 0 }}>On Leave Today</h5>
          <p style={{ marginBottom: '0.5rem', color: '#666' }}>
            Track who is on leave today and their return dates
          </p>
        </div>

        <div style={{
          display: 'flex',
          flexDirection: 'row',
          overflowY: 'auto',
          scrollbarWidth: 'none',    // Firefox
          msOverflowStyle: 'none',        // IE/Edge
          minHeight: '230px',
          height: 'auto'
        }}>
          {employeesOnLeaveToday.length === 0 ? (
            <div style={{ marginTop: '0.3rem' }}>
              <span
                style={{
                  backgroundColor: '#C31818',
                  color: '#FFFFFF',
                  padding: '0.25rem 0.6rem',
                  borderRadius: '0.5rem',
                  fontSize: '0.85rem'
                }}
              >
                No one is on leave today
              </span>
            </div>
          ) : (
            employeesOnLeaveToday.map((leave) => {
              const startDate = new Date(leave.from);
              const endDate = new Date(leave.to);
              const leaveTypeObj = leaveType.find(t => t.name === leave.type);
              const cardColor = leaveTypeObj ? leaveTypeObj.color : '#4D49B3';
              return (
                <div key={leave.id} style={{ display: 'flex', gap: '1rem', padding: '0.5rem', flex: '0 0 auto' }}>
                  <div
                    className="leave-item"
                    style={{
                      background: '#fff',
                      borderRadius: '10px',
                      padding: '1.3rem 1.5rem',
                      borderLeft: `5px solid ${cardColor}`,
                      marginBottom: '1rem',
                      boxShadow: '0 2px 8px #e6e8f0',
                      width: 'auto',
                    }}
                  >
                    {/* Name */}
                    <div style={{ fontWeight: 'bold', color: '#495057', fontSize: '0.85rem', marginBottom: '0rem' }}>
                      Name
                    </div>
                    <div
                      className="leave-title"
                      style={{
                        fontWeight: 'bold',
                        color: '#212122',
                        fontSize: '1.1rem',
                        marginBottom: '0.5rem'
                      }}
                    >
                      {leave.employee_name}
                    </div>

                    {/* date and day */}
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
                        <span style={{ fontWeight: 'bold', color: '#495057', fontSize: '0.85rem', marginBottom: '0rem' }}>Dates</span>
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
                        <span style={{ fontWeight: 'bold', color: '#495057', fontSize: '0.85rem', marginBottom: '0rem' }}>Total Day(s)</span>
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
                    <div style={{ fontWeight: 'bold', color: '#495057', fontSize: '0.85rem', marginBottom: '0rem' }}>
                      Leave Type
                    </div>

                    {/* Leave Type */}
                    <div
                      className="leave-title"
                      style={{
                        fontWeight: 'bold',
                        color: cardColor,
                        fontSize: '1rem',
                        marginBottom: '0.5rem'
                      }}
                    >
                      {leave.type}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </Row>

      {/* Upcoming Holidays */}
      <Row className="g-1">
        <div className="department-list-header mb-2">
          <h5 style={{ fontWeight: 'bold', marginBottom: 0 }}>🎉 Upcoming Holidays</h5>
          <p style={{ marginBottom: '0.5rem', color: '#666' }}>
            See what holidays are coming soon
          </p>
        </div>
        <Card style={{ borderRadius: 16, boxShadow: '0 2px 12px #e6e8f0', background: '#fff', padding: 0 }}>
          <div style={{
            overflowY: 'auto',
            scrollbarWidth: 'none',        // Firefox
            msOverflowStyle: 'none',        // IE/Edge
            minHeight: '300px',
            height: 'auto',
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
      </Row>
    </div >
  );
};

export default ManagerDashboard;

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
