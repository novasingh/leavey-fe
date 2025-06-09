// ManagerDashboard.jsx
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Row, Col, Button, Form } from 'react-bootstrap';
import { FaCalendarAlt, FaUserFriends, FaFileAlt, FaChartBar, FaEllipsisV } from 'react-icons/fa';
import authService from '../../services/authService';
import { Card, Table, StatusBadge } from '../../components';
import './Dashboard.scss';
import { getDepartments } from '../../services/departmentService';
import { getEvents } from '../../services/eventService';
import { getLeave, getLeaveTypes } from '../../services/leaveService';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import tippy from 'tippy.js';
import 'tippy.js/dist/tippy.css';

const ManagerDashboard = () => {

  const { t } = useTranslation();
  // User state and loading flag
  const [user, setUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [departments, setDepartments] = useState([]);
  const [events, setEvents] = useState([]);
  const [leaveRequestTab, setLeaveRequestTab] = useState('All');
  const [leaveTab, setLeaveTab] = useState('all');
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
      } catch (error) {
        console.error('Failed to fetch leave types', error);
      }
    }
    fetchLeaveTypes();

    // fetchLeaveRequest()
    const fetchLeaveRequests = async () => {
      try {
        const data = await getLeave();
        console.log('Fetched leave:', data);
        const formatted = data.map(item => ({
          id: item.id,
          type: item.leave_type_name,
          from: item.start_date,
          to: item.end_date,
          days: item.days,
          status: item.status,
          created: new Date(item.created_at).toLocaleDateString(),
          created_at: item.created_at, // ✅ add this line
          leave_type_name: item.leave_type_name, // ✅ if you’re using it in chart
          department: item.department_name || "Unknown"
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
    { key: 'employee', title: t('dashboardPage.table.employee'), render: (row) => t(row.employeeKey) },
    { key: 'type', title: t('dashboardPage.table.leaveType'), render: (row) => t(row.typeKey) },
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

  // Calendar events: holidays + approved team leaves
  const holidayEvents = events.map((event) => ({
    title: event.holiday_name || 'No Title',
    date: event.date,
    color: '#4D49B3', // holiday color
    extendedProps: {
      day: event.day || 'no data',
      type: event.holiday_type || 'no data',
      isHoliday: true
    }
  }));

  // Approved leaves for current team (filter as needed)
  const approvedLeaveEvents = (leaveRequests || [])
    .filter(lr => lr.status === 'approved')
    .map(lr => ({
      title: `On Leave: ${t(lr.employeeKey)} (${t(lr.typeKey)})`,
      start: lr.from,
      end: lr.to,
      color: '#E74C3C', // leave color
      extendedProps: {
        employee: t(lr.employeeKey),
        type: t(lr.typeKey),
        isLeave: true
      }
    }));

  const calendarEvents = [...holidayEvents, ...approvedLeaveEvents];

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

  const currentWorkHours = {
    startTime: '9:00 AM',
    endTime: '5:00 PM',
    daysActive: 5,
  };

  const leaveCycleStatus = {
    leaveYear: 2025,
    companyLeaveLeft: 12,
  };

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
        <h5 style={{ fontWeight: 'bold', marginBottom: '0' }}>List of Department</h5>
        <p style={{ marginTop: 0, marginBottom: '0.7rem', color: '#666' }}>lorem ipsum</p>
      </div>

      {/* Stats Cards */}
      <Row className="g-3 mb-4">
        {Array.isArray(departments) && departments.length > 0 ? (
          departments.map((dept) => (
            <Col key={dept.id} xl={3} md={6} className="d-flex">
              <Card className="stat-card flex-fill p-3">
                <div className="d-flex align-items-start">
                  {/* Emoji Icon */}
                  <div className="emoji-icon flex-shrink-0">
                    <div className="emoji-circle">
                      <span role="img" aria-label="Department Icon">👨‍💼</span>
                    </div>
                  </div>
                  {/* Department Info */}
                  <div className="ms-3">
                    <h5 className="fw-bold mb-1">{dept.name}</h5>
                    <p className="mb-1"><span role="img" aria-label="Employees">👥</span> Total Employees: {dept.total_employees} employees</p>
                    <p className="mb-1"><span role="img" aria-label="Manager">🧑‍💼</span> Manager: {dept.manager_name}</p>
                    <p className="mb-0"><span role="img" aria-label="Updated">🔄</span> Last Updated: {dept.updated_at}</p>
                  </div>
                </div>
              </Card>
            </Col>
          ))
        ) : (
          <p>No departments available.</p>
        )}
      </Row>

      {/* --- NEW: Leave Request Stat Cards, Tabbed List, On Leave Today --- */}
      <Row className="g-3 mb-4">
        {/* Leave Request Stat Cards */}
        <Col xl={9}>
          <Row className="g-3 mb-2">
            {Array.isArray(leaveRequests) && leaveRequests.length > 0 && (
              <>
                <Col md={3} sm={6} xs={12}>
                  <Card className="text-center p-3" style={{ borderLeft: `6px solid #4D49B3`, boxShadow: '0 2px 8px #f0f1f2' }}>
                    <div style={{ fontSize: 28, fontWeight: 700, color: '#4D49B3' }}>{leaveRequests.length}</div>
                    <div style={{ fontWeight: 600, color: '#333' }}>Total Requests</div>
                  </Card>
                </Col>
                <Col md={3} sm={6} xs={12}>
                  <Card className="text-center p-3" style={{ borderLeft: `6px solid #4BB543`, boxShadow: '0 2px 8px #f0f1f2' }}>
                    <div style={{ fontSize: 28, fontWeight: 700, color: '#4BB543' }}>{leaveRequests.filter(lr => lr.status === 'approved').length}</div>
                    <div style={{ fontWeight: 600, color: '#333' }}>Approved</div>
                  </Card>
                </Col>
                <Col md={3} sm={6} xs={12}>
                  <Card className="text-center p-3" style={{ borderLeft: `6px solid #E74C3C`, boxShadow: '0 2px 8px #f0f1f2' }}>
                    <div style={{ fontSize: 28, fontWeight: 700, color: '#E74C3C' }}>{leaveRequests.filter(lr => lr.status === 'rejected').length}</div>
                    <div style={{ fontWeight: 600, color: '#333' }}>Rejected</div>
                  </Card>
                </Col>
                <Col md={3} sm={6} xs={12}>
                  <Card className="text-center p-3" style={{ borderLeft: `6px solid #F1C40F`, boxShadow: '0 2px 8px #f0f1f2' }}>
                    <div style={{ fontSize: 28, fontWeight: 700, color: '#F1C40F' }}>{leaveRequests.filter(lr => lr.status === 'pending').length}</div>
                    <div style={{ fontWeight: 600, color: '#333' }}>Pending</div>
                  </Card>
                </Col>
              </>
            )}
          </Row>

          {/* Tabbed Leave Request List */}
          <Card className="p-3">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <div>
                <Button
                  variant={leaveTab === 'all' ? 'primary' : 'outline-primary'}
                  size="sm"
                  className="me-2"
                  onClick={() => setLeaveTab('all')}
                >All</Button>
                <Button
                  variant={leaveTab === 'approved' ? 'success' : 'outline-success'}
                  size="sm"
                  className="me-2"
                  onClick={() => setLeaveTab('approved')}
                >Approved</Button>
                <Button
                  variant={leaveTab === 'rejected' ? 'danger' : 'outline-danger'}
                  size="sm"
                  onClick={() => setLeaveTab('rejected')}
                >Rejected</Button>
              </div>
              <Button variant="link" size="sm" style={{ fontWeight: 600 }} onClick={() => window.location.href = '/leaves-approval'}>
                View All
              </Button>
            </div>
            <Table
              columns={leaveRequestColumns.filter(col => col.key !== 'actions')}
              data={leaveRequests.filter(lr => leaveTab === 'all' ? true : lr.status === leaveTab)}
              onRowClick={(row) => { }}
            />
          </Card>
        </Col>
        {/* On Leave Today */}
        <Col xl={3}>
          <Card className="p-3 h-100">
            <div style={{ fontWeight: 'bold', fontSize: 16, marginBottom: 8 }}>On Leave Today</div>
            <div style={{ maxHeight: 320, overflowY: 'auto' }}>
              {leaveRequests.filter(lr => {
                const today = new Date();
                const from = new Date(lr.from);
                const to = new Date(lr.to);
                return today >= from && today <= to && lr.status === 'Approved';
              }).length === 0 && (
                  <div className="text-muted">No one is on leave today.</div>
                )}
              {leaveRequests.filter(lr => {
                const today = new Date();
                const from = new Date(lr.from);
                const to = new Date(lr.to);
                return today >= from && today <= to && lr.status === 'Approved';
              }).map(lr => (
                <Card key={lr.id} className="mb-2" style={{ borderLeft: '5px solid #4D49B3', background: '#f8f9fa' }}>
                  <div style={{ fontWeight: 600 }}>{t(lr.employeeKey)}</div>
                  <div style={{ fontSize: 13, color: '#4D49B3' }}>{t(lr.typeKey)}</div>
                  <div style={{ fontSize: 12, color: '#888' }}>Return: {new Date(lr.to).toLocaleDateString()}</div>
                </Card>
              ))}
            </div>
          </Card>
        </Col>
      </Row>
      {/* --- END NEW --- */}

      {/* Worksflow Overview */}
      <Row className="g-3">
        <Col lg={8}>
          <div className="d-flex flex-column h-100">
            <div className="department-list-header">
              <h5 style={{ fontWeight: 'bold', marginBottom: '0' }}>Workflows Leave Overview</h5>
              <p style={{ marginTop: 0, marginBottom: '0.5rem', color: '#666' }}>lorem ipsum</p>
            </div>
            <Card>
              <div className="events-list">
                {events.map(event => (
                  <div key={event.id} className="event-item">
                    {/* leave table Here */}
                    <div className={`event-indicator ${event.date}`}></div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </Col>

        {/* Types */}
        <Col lg={4}>
          <div className="d-flex flex-column h-100">
            <div className="department-list-header">
              <h5 style={{ fontWeight: 'bold', marginBottom: '0' }}>Leave Types</h5>
              <p style={{ marginTop: 0, marginBottom: '0.5rem', color: '#666' }}>lorem ipsum</p>
            </div>
            <Card>
              <div className="events-list">
                {events.map(event => (
                  <div key={event.id} className="event-item">
                    {/* leave type */}
                    <div className={`event-indicator ${event.date}`}></div>
                  </div>
                ))}
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
              events={calendarEvents}
              eventDidMount={(info) => {
                if (info.event.extendedProps.isHoliday) {
                  tippy(info.el, {
                    content: `
                      <strong>${info.event.title}</strong><br/>
                      Day: ${info.event.extendedProps.day}<br/>
                      Type: ${info.event.extendedProps.type}
                    `,
                    allowHTML: true,
                    placement: 'top',
                  });
                } else if (info.event.extendedProps.isLeave) {
                  tippy(info.el, {
                    content: `
                      <strong>${info.event.title}</strong><br/>
                      Type: ${info.event.extendedProps.type}
                    `,
                    allowHTML: true,
                    placement: 'top',
                  });
                }
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



    </div>
  );
};

export default ManagerDashboard;
