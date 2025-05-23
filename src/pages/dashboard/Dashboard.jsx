// Dashboard.jsx
import React from 'react';
import { Row, Col, Badge, Button } from 'react-bootstrap';
import MainLayout from '../../layouts/MainLayout';
import { Card, Table, StatusBadge } from '../../components';
import { 
  FaCalendarAlt, 
  FaUserFriends, 
  FaFileAlt, 
  FaChartBar,
  FaRegClock,
  FaCalendarPlus,
  FaEllipsisV
} from 'react-icons/fa';
import './Dashboard.scss';
import { useTranslation } from 'react-i18next'; // Added

const Dashboard = () => {
  const { t } = useTranslation(); // Added

  // Sample data for cards
  const stats = [
    { titleKey: 'dashboardPage.availableLeaveDays', value: '15', icon: <FaCalendarAlt />, variant: 'primary' },
    { titleKey: 'dashboardPage.teamMembers', value: '12', icon: <FaUserFriends />, variant: 'success' },
    { titleKey: 'dashboardPage.pendingRequests', value: '3', icon: <FaFileAlt />, variant: 'warning' },
    { titleKey: 'dashboardPage.totalDepartments', value: '4', icon: <FaChartBar />, variant: 'info' }
  ];

  // Sample data for recent leave requests table
  const leaveRequests = [
    { id: 1, employeeKey: 'dashboardPage.employees.janeSmith', typeKey: 'dashboardPage.leaveTypes.annual', from: '2025-05-26', to: '2025-05-30', days: 5, status: 'pending' },
    { id: 2, employeeKey: 'dashboardPage.employees.michaelBrown', typeKey: 'dashboardPage.leaveTypes.sick', from: '2025-05-24', to: '2025-05-25', days: 2, status: 'approved' },
    { id: 3, employeeKey: 'dashboardPage.employees.sarahJohnson', typeKey: 'dashboardPage.leaveTypes.personal', from: '2025-06-01', to: '2025-06-03', days: 3, status: 'rejected' },
    { id: 4, employeeKey: 'dashboardPage.employees.davidLee', typeKey: 'dashboardPage.leaveTypes.wfh', from: '2025-05-27', to: '2025-05-27', days: 1, status: 'approved' }
  ];

  // Sample data for upcoming events
  const events = [
    { id: 1, titleKey: 'dashboardPage.events.teamMeeting', date: '2025-05-24 10:00', type: 'meeting' },
    { id: 2, titleKey: 'dashboardPage.events.projectDeadline', date: '2025-05-30 18:00', type: 'deadline' },
    { id: 3, titleKey: 'dashboardPage.events.companyHoliday', date: '2025-05-31', type: 'holiday' }
  ];

  // Sample data for team members
  const teamMembers = [
    { id: 1, nameKey: 'dashboardPage.employees.janeSmith', positionKey: 'dashboardPage.positions.uiDesigner', status: 'active' },
    { id: 2, nameKey: 'dashboardPage.employees.michaelBrown', positionKey: 'dashboardPage.positions.developer', status: 'active' },
    { id: 3, nameKey: 'dashboardPage.employees.sarahJohnson', positionKey: 'dashboardPage.positions.projectManager', status: 'on-leave' },
    { id: 4, nameKey: 'dashboardPage.employees.davidLee', positionKey: 'dashboardPage.positions.qaEngineer', status: 'active' }
  ];

  // Table columns definition
  const leaveRequestColumns = [
    { key: 'employee', title: t('dashboardPage.table.employee'), render: (row) => t(row.employeeKey) },
    { key: 'type', title: t('dashboardPage.table.leaveType'), render: (row) => t(row.typeKey) },
    { key: 'from', title: t('dashboardPage.table.fromDate') },
    { key: 'to', title: t('dashboardPage.table.toDate') },
    { key: 'days', title: t('dashboardPage.table.days') },
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

  return (
      <div className="dashboardPage-page">
        <div className="page-header">
          <h1>{t('dashboardPage.title')}</h1>
          <div className="page-actions">
            <Button variant="primary" size="sm" className="ms-2">
              <FaRegClock className="me-2" />
              {t('dashboardPage.timeLogButton')}
            </Button>
            <Button variant="success" size="sm" className="ms-2">
              <FaCalendarPlus className="me-2" />
              {t('dashboardPage.requestLeaveButton')}
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
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
          {/* Recent Leave Requests */}
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

            {/* Team Calendar (placeholder) */}
            <Card title={t('dashboardPage.teamCalendarTitle')} className="calendar-card">
              <div className="calendar-placeholder">
                <div className="text-center py-5">
                  <FaCalendarAlt className="display-4 text-muted" />
                  <h5 className="mt-3">{t('dashboardPage.teamCalendarTitle')}</h5>
                  <p className="text-muted">{t('dashboardPage.calendarPlaceholderText')}</p>
                </div>
              </div>
            </Card>
          </Col>

          <Col lg={4}>
            {/* Upcoming Events */}
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

            {/* Team Members */}
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

export default Dashboard;
