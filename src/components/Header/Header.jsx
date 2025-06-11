import React, { useState, useEffect } from 'react';
import { Navbar, Nav, Dropdown, Button, Image } from 'react-bootstrap';
import { FaBell, FaUser } from 'react-icons/fa';
import './Header.scss';
import logo from '../../assets/images/logo.png';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import authService from '../../services/authService';

const Header = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(authService.getUser());

  useEffect(() => {
    const handleProfileUpdate = () => {
      setCurrentUser(authService.getUser());
    };
    window.addEventListener('profileUpdated', handleProfileUpdate);
    return () => {
      window.removeEventListener('profileUpdated', handleProfileUpdate);
    };
  }, []);

  const changeLanguage = (lng) => {
    console.log(lng);
    i18n.changeLanguage(lng);
    document.documentElement.lang = lng;
  };

  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };

  const userRole = currentUser?.role_details?.name || authService.getUserRole();

  const profilePictureUrl = currentUser?.profile_picture
    ? `${currentUser.profile_picture}?t=${new Date().getTime()}`
    : `https://ui-avatars.com/api/?name=${currentUser?.first_name}+${currentUser?.last_name}&background=eeeeee&color=5B4B8A`;


  return (
    <header className="app-header px-3">
      <Navbar expand="lg" className="p-0 align-items-center">
        <div className="navbar-left d-flex align-items-center">
          <Navbar.Brand
            href={
              userRole === 'Admin'
                ? '/dashboard/admin'
                : userRole === 'Manager'
                  ? '/dashboard/manager'
                  : userRole === 'Employee'
                    ? '/dashboard/employee'
                    : '/dashboard'
            }
            className="d-flex align-items-center me-0"
          >
            <img src={logo} alt="Leavey Logo" className="header-logo-img me-2" />
            <span className="header-logo-text">
              {userRole === 'Admin'
                ? t('header.forAdmin')
                : userRole === 'Manager'
                  ? t('header.forManager')
                  : userRole === 'Employee'
                    ? t('header.forEmployee')
                    : ''}
            </span>
          </Navbar.Brand>
        </div>

        <Nav className="ms-auto header-nav align-items-center">
          {/* Language Switcher */}
          <Dropdown align="end" className="me-2">
            <Dropdown.Toggle variant="outline-secondary" size="sm" id="lang-switch">
              {i18n.language === 'en' && t('header.lang.enShort')}
              {i18n.language === 'ms' && t('header.lang.msShort')}
              {i18n.language === 'zh' && t('header.lang.zhShort')}
            </Dropdown.Toggle>
            <Dropdown.Menu>
              <Dropdown.Item onClick={() => changeLanguage('en')}>{t('header.lang.english')}</Dropdown.Item>
              <Dropdown.Item onClick={() => changeLanguage('ms')}>{t('header.lang.malay')}</Dropdown.Item>
              <Dropdown.Item onClick={() => changeLanguage('zh')}>{t('header.lang.chinese')}</Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>

          <Dropdown align="end" className="notification-dropdown me-4">
            <Dropdown.Toggle variant="link" id="notification-dropdown" className="p-0">
              <span className="badge-container text-dark">
                <FaBell size={25} />
                <span className="badge">3</span>
              </span>
            </Dropdown.Toggle>
            <Dropdown.Menu>
              <div className="notification-header">
                <h6 className="mb-0">{t('header.notifications.title')}</h6>
                <small className="text-muted">{t('header.notifications.newCount', { count: 3 })}</small>
              </div>
              <Dropdown.Item href="#/action-1">
                <div className="notification-item">
                  <div className="notification-content">
                    <p className="mb-0">{t('header.notifications.sample.leaveApproved')}</p>
                    <small className="text-muted">{t('header.notifications.sample.timeAgo', { time: '2 hours' })}</small>
                  </div>
                </div>
              </Dropdown.Item>
              <Dropdown.Item href="#/action-2">
                <div className="notification-item">
                  <div className="notification-content">
                    <p className="mb-0">{t('header.notifications.sample.newTeamMember')}</p>
                    <small className="text-muted">{t('header.notifications.sample.timeAgo', { time: 'Yesterday' })}</small>
                  </div>
                </div>
              </Dropdown.Item>
              <Dropdown.Divider />
              <Dropdown.Item as={Link} to="/notifications" className="text-center">
                <small>{t('header.notifications.viewAll')}</small>
              </Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>

          <Dropdown align="end" className="user-dropdown">
            <Dropdown.Toggle variant="link" id="user-dropdown" className="p-0">
              <div className="avatar">
                <Image
                  src={profilePictureUrl}
                  roundedCircle
                  style={{ width: '40px', height: '40px', objectFit: 'cover' }}
                />
              </div>
            </Dropdown.Toggle>
            <Dropdown.Menu>
              <Dropdown.Item as={Link} to="/profile">
                <FaUser className="me-2" /> {t('header.user.profile')}
              </Dropdown.Item>
              <Dropdown.Item onClick={handleLogout}>
                {t('header.user.logout')}
              </Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
        </Nav>
      </Navbar>
    </header>
  );
};

export default Header;
