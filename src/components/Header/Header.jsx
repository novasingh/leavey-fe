
import { Navbar, Nav, Dropdown, Button } from 'react-bootstrap';
import { FaBell, FaUser } from 'react-icons/fa';
import './Header.scss';
import logo from '../../assets/images/logo.png';
import { Link } from 'react-router-dom';

const Header = () => {
  
  return (
    <header className="app-header px-3">
      <Navbar expand="lg" className="p-0 align-items-center">
        <div className="navbar-left d-flex align-items-center">
          <Navbar.Brand href="/dashboard" className="d-flex align-items-center me-0">
            <img src={logo} alt="Leavey Logo" className="header-logo-img me-2" />
            <span className="header-logo-text">{" "}for Employee</span>
          </Navbar.Brand>
        </div> 

        <Nav className="ms-auto header-nav align-items-center">
          <Dropdown align="end" className="notification-dropdown me-4">
            <Dropdown.Toggle variant="link" id="notification-dropdown" className="p-0">
              <span className="badge-container text-dark">
                <FaBell size={25} />
                <span className="badge">3</span>
              </span>
            </Dropdown.Toggle>
            <Dropdown.Menu>
              <div className="notification-header">
                <h6 className="mb-0">Notifications</h6>
                <small className="text-muted">3 New</small>
              </div>
              <Dropdown.Item href="#/action-1">
                <div className="notification-item">
                  <div className="notification-content">
                    <p className="mb-0">Your leave request was approved</p>
                    <small className="text-muted">2 hours ago</small>
                  </div>
                </div>
              </Dropdown.Item>
              <Dropdown.Item href="#/action-2">
                <div className="notification-item">
                  <div className="notification-content">
                    <p className="mb-0">New team member added</p>
                    <small className="text-muted">Yesterday</small>
                  </div>
                </div>
              </Dropdown.Item>
              <Dropdown.Divider />
              <Dropdown.Item as={Link} to="/notifications" className="text-center">
                <small>View all notifications</small>
              </Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>

          <Dropdown align="end" className="user-dropdown">
            <Dropdown.Toggle variant="link" id="user-dropdown" className="p-0">
              <div className="avatar">
                {/* Placeholder for user image or initials */}
                <FaUser />
              </div>
            </Dropdown.Toggle>
            <Dropdown.Menu>
              <Dropdown.Item href="/profile">
                <FaUser className="me-2" /> Profile
              </Dropdown.Item>
              <Dropdown.Item href="/logout">
                Log Out
              </Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
        </Nav>
      </Navbar>
    </header>
  );
};

export default Header;
