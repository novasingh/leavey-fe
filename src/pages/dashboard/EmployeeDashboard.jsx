// Dashboard.jsx
import React, { useEffect, useState } from 'react';
import { Row, Col, Badge, Button } from 'react-bootstrap';
import { Card, Table, StatusBadge } from '../../components';
import { 
  FaCalendarAlt, 
  FaUserFriends, 
  FaFileAlt, 
  FaChartBar 
} from 'react-icons/fa';

import { getLeave } from '../../services/leaveService';
import { getEvents } from '../../services/eventService';
import { useTranslation } from 'react-i18next';
// import authService from '../../services/authService';

import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';

import tippy from 'tippy.js';
import 'tippy.js/dist/tippy.css';

import './Dashboard.scss';

const EmployeeDashboard = () => {
  const { t } = useTranslation();

  const [leaveRequests, setLeaveRequests] = useState([]);
  const [events, setEvents] = useState([]);
  const [upcomingHolidays, setUpcomingHolidays] = useState([]);
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const fetchLeaveRequests = async () => {
      try {
        const data = await getLeave();
        const formatted = data.map(item => ({
          id: item.id,
          type: item.leave_type_name,
          from: item.start_date,
          to: item.end_date,
          days: item.days,
          status: item.status,
          created: new Date(item.created_at).toLocaleDateString(),
        }));
        setLeaveRequests(formatted);
      } catch (err) {
        console.error('Failed to fetch leave requests:', err);
      }
    };

    const fetchHolidays = async () => {
      try {
        const data = await getEvents();
        setEvents(data);

        const upcoming = data
          .filter(e => new Date(e.date) >= new Date())
          .sort((a, b) => new Date(a.date) - new Date(b.date))
          .slice(0, 5);

        setUpcomingHolidays(upcoming);
      } catch (err) {
        console.error('Failed to fetch events:', err);
      }
    };

    fetchLeaveRequests();
    fetchHolidays();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const dayName = now.toLocaleDateString(undefined, { weekday: 'long' });
  const dateStr = now.toLocaleDateString(undefined, { day: 'numeric', month: 'long', year: 'numeric' }).replace(/,/g, '');
  const timeStr = now.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });

  const stats = [
    { titleKey: 'dashboardPage.availableLeaveDays', value: '15', icon: <FaCalendarAlt />, variant: 'primary' },
    { titleKey: 'dashboardPage.teamMembers', value: '12', icon: <FaUserFriends />, variant: 'success' },
    { titleKey: 'dashboardPage.pendingRequests', value: '3', icon: <FaFileAlt />, variant: 'warning' },
    { titleKey: 'dashboardPage.totalDepartments', value: '4', icon: <FaChartBar />, variant: 'info' }
  ];

  const leaveRequestColumns = [
    { key: 'created', title: 'Date', render: row => row.created },
    { key: 'type', title: 'Leave Type', render: row => row.type },
    { key: 'from', title: 'Start', render: row => new Date(row.from).toLocaleDateString() },
    { key: 'to', title: 'End', render: row => new Date(row.to).toLocaleDateString() },
    { key: 'days', title: 'Days' },
    {
      key: 'status',
      title: 'Status',
      render: row => <StatusBadge status={row.status} />
    }
  ];

  const calendarEvents = events.map(event => ({
    title: event.holiday_name || 'Holiday',
    date: event.date,
    extendedProps: {
      type: event.holiday_type || '—',
      day: event.day || '—'
    }
  }));

  const handleEventDidMount = info => {
    const { type, day } = info.event.extendedProps;
    tippy(info.el, {
      content: `<strong>${info.event.title}</strong><br/>${day} (${type})`,
      allowHTML: true,
      placement: 'top',
      theme: 'light-border',
    });
  };

  const teamMembers = [
    { id: 1, nameKey: 'dashboardPage.employees.janeSmith', positionKey: 'dashboardPage.positions.uiDesigner', status: 'active' },
    { id: 2, nameKey: 'dashboardPage.employees.michaelBrown', positionKey: 'dashboardPage.positions.developer', status: 'active' },
    { id: 3, nameKey: 'dashboardPage.employees.sarahJohnson', positionKey: 'dashboardPage.positions.projectManager', status: 'on-leave' },
    { id: 4, nameKey: 'dashboardPage.employees.davidLee', positionKey: 'dashboardPage.positions.qaEngineer', status: 'active' }
  ];


  return (
  <div className="dashboardPage-page">
    <div className="d-flex flex-wrap justify-content-between align-items-center mb-3" style={{ gap: 16 }}>
      <div>
        <h2 style={{ fontWeight: 700, fontSize: '2rem', marginBottom: 0 }}>
          Hi <span style={{ fontWeight: 800 }}>Jacob Sartorius</span> <span role="img" aria-label="wave">👋</span>
        </h2>
        <div className="text-muted" style={{ fontSize: 16 }}>
          Your leave status and requests are just a click away!
        </div>
      </div>
      <div className="text-end" style={{ minWidth: 220 }}>
        <div style={{ fontWeight: 600, color: '#3B3B3B', fontSize: 15 }}>
          <span style={{ color: '#3B3B3B' }}>Today is</span>
        </div>
        <div style={{ fontSize: 15 }}>
          <span style={{ color: '#2D4BFF', fontWeight: 700 }}>{dayName}, </span>{dateStr}
        </div>
        <div style={{ fontSize: 15 }}>{timeStr}</div>
      </div>
    </div>

    <Row className="g-3 mb-4">
      {stats.map((stat, index) => (
        <Col key={index} xl={3} md={6} className="d-flex">
          <Card className="stat-card flex-fill" variant={stat.variant}>
            <div className="d-flex align-items-center">
              <div className={`stat-icon icon-${stat.variant}`}>
                {stat.icon}
              </div>
              <div className="stat-content ms-3">
                <h4 className="stat-value">{stat.value}</h4>
                <p className="stat-title mb-0">{t(stat.titleKey)}</p>
              </div>
            </div>
          </Card>
        </Col>
      ))}
    </Row>

    <Row className="g-3">
      <Col lg={8}>
        <Card
          title={t('dashboardPage.recentLeaveRequestsTitle')}
          count={leaveRequests.length}
          headerRight={
            <Button variant="outline-primary" size="sm">{t('dashboardPage.viewAllButton')}</Button>
          }
          className="mb-3"
        >
          <Table
            columns={leaveRequestColumns}
            data={leaveRequests}
            onRowClick={(row) => console.log('Row clicked:', row)}
          />
        </Card>

        <Card title={t('dashboardPage.teamCalendarTitle')} className="calendar-card mb-3">
          <FullCalendar
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
            initialView="dayGridMonth"
            events={calendarEvents}
            eventDidMount={handleEventDidMount}
            height="auto"
          />
        </Card>
      </Col>

      <Col lg={4}>
        <Card title={t('dashboardPage.upcomingHolidays')} icon={<FaCalendarAlt />} className="mb-3">
          <div className="events-list">
            {upcomingHolidays.map((event, index) => (
              <div key={index} className="event-item">
                <div className="event-content">
                  <h6 className="event-title">{event.holiday_name}</h6>
                  <p className="event-date mb-0">
                    <small><FaCalendarAlt className="me-1" /> {event.date} ({event.day})</small><br />
                    <small className="text-muted">{event.holiday_type}</small>
                  </p>
                </div>
              </div>
            ))}
            {upcomingHolidays.length === 0 && (
              <div className="text-muted">{t('dashboardPage.noUpcomingHolidays')}</div>
            )}
          </div>
        </Card>

        <Card
          title={t('dashboardPage.upcomingEventsTitle')}
          icon={<FaCalendarAlt />}
          className="mb-3"
        >
          <div className="events-list">
            {events.map(event => (
              <div key={event.id} className="event-item">
                <div className={`event-indicator ${event.type}`}></div>
                <div className="event-content">
                  <h6 className="event-title">{t(event.titleKey)}</h6>
                  <p className="event-date mb-0">
                    <small><FaCalendarAlt className="me-1" /> {event.date}</small>
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card title={t('dashboardPage.teamMembersCardTitle')} icon={<FaUserFriends />} count={teamMembers.length}>
          <div className="team-list">
            {teamMembers.map(member => (
              <div key={member.id} className="team-member">
                <div className="member-avatar">
                  {t(member.nameKey).charAt(0)}
                </div>
                <div className="member-info">
                  <h6 className="member-name">{t(member.nameKey)}</h6>
                  <p className="member-position mb-0">{t(member.positionKey)}</p>
                </div>
                <div className="member-status">
                  <Badge bg={member.status === 'active' ? 'success' : 'warning'} pill>
                    {member.status === 'active' ? t('dashboardPage.statusActive') : t('dashboardPage.statusOnLeave')}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </Col>
    </Row>
  </div>
);

};

export default EmployeeDashboard;
