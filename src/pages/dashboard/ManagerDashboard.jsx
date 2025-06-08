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

  }, []);

  // Loading screen
  if (loadingUser) {
    return <div className="dashboardPage-page">Loading user info...</div>;
  }

  // No user fallback
  if (!user) {
    return <div className="dashboardPage-page">User not found. Please log in.</div>;
  }

  // Sample leave requests data
  const leaveRequests = [
    { id: 1, employeeKey: 'dashboardPage.employees.janeSmith', typeKey: 'dashboardPage.leaveTypes.annual', from: '2025-05-26', to: '2025-05-30', days: 5, status: 'pending' },
    { id: 2, employeeKey: 'dashboardPage.employees.michaelBrown', typeKey: 'dashboardPage.leaveTypes.sick', from: '2025-05-24', to: '2025-05-25', days: 2, status: 'approved' },
    { id: 3, employeeKey: 'dashboardPage.employees.sarahJohnson', typeKey: 'dashboardPage.leaveTypes.personal', from: '2025-06-01', to: '2025-06-03', days: 3, status: 'rejected' },
    { id: 4, employeeKey: 'dashboardPage.employees.davidLee', typeKey: 'dashboardPage.leaveTypes.wfh', from: '2025-05-27', to: '2025-05-27', days: 1, status: 'approved' }
  ];

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

  // Calendar
  const calendarEvents = events.map((event) => ({
    title: event.holiday_name || 'No Title',
    date: event.date,
    extendedProps: {
      day: event.day || 'no data',
      type: event.holiday_type || 'no data'
    }
  })
  );

  const teamMembers = [
    { id: 1, nameKey: 'dashboardPage.employees.janeSmith', positionKey: 'dashboardPage.positions.uiDesigner', status: 'active' },
    { id: 2, nameKey: 'dashboardPage.employees.michaelBrown', positionKey: 'dashboardPage.positions.developer', status: 'active' },
    { id: 3, nameKey: 'dashboardPage.employees.sarahJohnson', positionKey: 'dashboardPage.positions.projectManager', status: 'on-leave' },
    { id: 4, nameKey: 'dashboardPage.employees.davidLee', positionKey: 'dashboardPage.positions.qaEngineer', status: 'active' }
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



    </div>
  );
};

export default ManagerDashboard;
