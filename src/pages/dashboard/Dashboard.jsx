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

const Dashboard = () => {
  // Sample data for cards
  const stats = [
    { title: 'Available Leave Days', value: '15', icon: <FaCalendarAlt />, variant: 'primary' },
    { title: 'Team Members', value: '12', icon: <FaUserFriends />, variant: 'success' },
    { title: 'Pending Requests', value: '3', icon: <FaFileAlt />, variant: 'warning' },
    { title: 'Total Departments', value: '4', icon: <FaChartBar />, variant: 'info' }
  ];

  // Sample data for recent leave requests table
  const leaveRequests = [
    { id: 1, employee: 'Jane Smith', type: 'Annual Leave', from: '2025-05-26', to: '2025-05-30', days: 5, status: 'pending' },
    { id: 2, employee: 'Michael Brown', type: 'Sick Leave', from: '2025-05-24', to: '2025-05-25', days: 2, status: 'approved' },
    { id: 3, employee: 'Sarah Johnson', type: 'Personal Leave', from: '2025-06-01', to: '2025-06-03', days: 3, status: 'rejected' },
    { id: 4, employee: 'David Lee', type: 'Work From Home', from: '2025-05-27', to: '2025-05-27', days: 1, status: 'approved' }
  ];

  // Sample data for upcoming events
  const events = [
    { id: 1, title: 'Team Meeting', date: '2025-05-24 10:00', type: 'meeting' },
    { id: 2, title: 'Project Deadline', date: '2025-05-30 18:00', type: 'deadline' },
    { id: 3, title: 'Company Holiday', date: '2025-05-31', type: 'holiday' }
  ];

  // Sample data for team members
  const teamMembers = [
    { id: 1, name: 'Jane Smith', position: 'UI Designer', status: 'active' },
    { id: 2, name: 'Michael Brown', position: 'Developer', status: 'active' },
    { id: 3, name: 'Sarah Johnson', position: 'Project Manager', status: 'on-leave' },
    { id: 4, name: 'David Lee', position: 'QA Engineer', status: 'active' }
  ];

  // Table columns definition
  const leaveRequestColumns = [
    { key: 'employee', title: 'Employee' },
    { key: 'type', title: 'Leave Type' },
    { key: 'from', title: 'From Date' },
    { key: 'to', title: 'To Date' },
    { key: 'days', title: 'Days' },
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

  return (
    <MainLayout>
      <div className="dashboard-page">
        <div className="page-header">
          <h1>Dashboard</h1>
          <div className="page-actions">
            <Button variant="primary" size="sm" className="ms-2">
              <FaRegClock className="me-2" />
              Time Log
            </Button>
            <Button variant="success" size="sm" className="ms-2">
              <FaCalendarPlus className="me-2" />
              Request Leave
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
                    <p className="stat-title mb-0">{stat.title}</p>
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
              title="Recent Leave Requests" 
              count={leaveRequests.length} 
              headerRight={
                <Button variant="outline-primary" size="sm">View All</Button>
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
            <Card title="Team Calendar" className="calendar-card">
              <div className="calendar-placeholder">
                <div className="text-center py-5">
                  <FaCalendarAlt className="display-4 text-muted" />
                  <h5 className="mt-3">Team Calendar</h5>
                  <p className="text-muted">Calendar view will be displayed here</p>
                </div>
              </div>
            </Card>
          </Col>

          <Col lg={4}>
            {/* Upcoming Events */}
            <Card 
              title="Upcoming Events" 
              icon={<FaCalendarAlt />} 
              className="mb-3"
            >
              <div className="events-list">
                {events.map(event => (
                  <div key={event.id} className="event-item">
                    <div className={`event-indicator ${event.type}`}></div>
                    <div className="event-content">
                      <h6 className="event-title">{event.title}</h6>
                      <p className="event-date mb-0">
                        <small><FaCalendarAlt className="me-1" /> {event.date}</small>
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Team Members */}
            <Card title="Team Members" icon={<FaUserFriends />} count={teamMembers.length}>
              <div className="team-list">
                {teamMembers.map(member => (
                  <div key={member.id} className="team-member">
                    <div className="member-avatar">
                      {member.name.charAt(0)}
                    </div>
                    <div className="member-info">
                      <h6 className="member-name">{member.name}</h6>
                      <p className="member-position mb-0">{member.position}</p>
                    </div>
                    <div className="member-status">
                      <Badge bg={member.status === 'active' ? 'success' : 'warning'} pill>
                        {member.status === 'active' ? 'Active' : 'On Leave'}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </Col>
        </Row>
      </div>
    </MainLayout>
  );
};

export default Dashboard;
