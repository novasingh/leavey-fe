import { Navbar, Nav, Dropdown, Button } from 'react-bootstrap';
import { FaBell, FaUser } from 'react-icons/fa';
import './Header.scss';
import logo from '../../assets/images/logo.png';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const Header = () => {
  const { t, i18n } = useTranslation(); // Added t

  const changeLanguage = (lng) => {
    console.log(lng);
    i18n.changeLanguage(lng);
    document.documentElement.lang = lng;
  };

  return (
    <header className="app-header px-3">
      <Navbar expand="lg" className="p-0 align-items-center">
        <div className="navbar-left d-flex align-items-center">
          <Navbar.Brand href="/dashboard" className="d-flex align-items-center me-0">
            <img src={logo} alt="Leavey Logo" className="header-logo-img me-2" />
            <span className="header-logo-text">{t('header.forEmployee')}</span> {/* Changed */}
          </Navbar.Brand>
        </div> 

        <Nav className="ms-auto header-nav align-items-center">
          {/* Language Switcher */}
          <Dropdown align="end" className="me-2">
            <Dropdown.Toggle variant="outline-secondary" size="sm" id="lang-switch">
              {i18n.language === 'en' && t('header.lang.enShort')} {/* Changed */}
              {i18n.language === 'ms' && t('header.lang.msShort')} {/* Changed */}
              {i18n.language === 'zh' && t('header.lang.zhShort')} {/* Changed */}
            </Dropdown.Toggle>
            <Dropdown.Menu>
              <Dropdown.Item onClick={() => changeLanguage('en')}>{t('header.lang.english')}</Dropdown.Item> {/* Changed */}
              <Dropdown.Item onClick={() => changeLanguage('ms')}>{t('header.lang.malay')}</Dropdown.Item> {/* Changed */}
              <Dropdown.Item onClick={() => changeLanguage('zh')}>{t('header.lang.chinese')}</Dropdown.Item> {/* Changed */}
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
                <h6 className="mb-0">{t('header.notifications.title')}</h6> {/* Changed */}
                <small className="text-muted">{t('header.notifications.newCount', { count: 3 })}</small> {/* Changed */}
              </div>
              <Dropdown.Item href="#/action-1">
                <div className="notification-item">
                  <div className="notification-content">
                    <p className="mb-0">{t('header.notifications.sample.leaveApproved')}</p> {/* Changed */}
                    <small className="text-muted">{t('header.notifications.sample.timeAgo', { time: '2 hours'})}</small> {/* Changed */}
                  </div>
                </div>
              </Dropdown.Item>
              <Dropdown.Item href="#/action-2">
                <div className="notification-item">
                  <div className="notification-content">
                    <p className="mb-0">{t('header.notifications.sample.newTeamMember')}</p> {/* Changed */}
                    <small className="text-muted">{t('header.notifications.sample.timeAgo', { time: 'Yesterday'})}</small> {/* Changed */}
                  </div>
                </div>
              </Dropdown.Item>
              <Dropdown.Divider />
              <Dropdown.Item as={Link} to="/notifications" className="text-center">
                <small>{t('header.notifications.viewAll')}</small> {/* Changed */}
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
                <FaUser className="me-2" /> {t('header.user.profile')} {/* Changed */}
              </Dropdown.Item>
              <Dropdown.Item href="/logout">
                {t('header.user.logout')} {/* Changed */}
              </Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
        </Nav>
      </Navbar>
    </header>
  );
};

export default Header;
