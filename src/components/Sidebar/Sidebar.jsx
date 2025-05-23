import { Link, useLocation } from 'react-router-dom';
import './Sidebar.scss';
import { MdSpaceDashboard } from "react-icons/md";
import { IoPaperPlane } from "react-icons/io5";
import { BsCalendarWeekFill, BsFillChatLeftQuoteFill } from "react-icons/bs";
import { useTranslation } from 'react-i18next';

const Sidebar = () => {
  const { t } = useTranslation(); 
  const location = useLocation();
  
  const isActive = (path) => {
    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  };
    const menuItems = [
    { path: '/dashboard', icon: <MdSpaceDashboard />, textKey: 'sidebar.dashboard' }, 
    { path: '/my-leaves', icon: <IoPaperPlane />, textKey: 'sidebar.myLeaves' }, 
    { path: '/calender', icon: <BsCalendarWeekFill />, textKey: 'sidebar.calendar' },
    { path: '/faq', icon: <BsFillChatLeftQuoteFill />, textKey: 'sidebar.faq' }, 
    // { path: '/reports', icon: <FaChartBar />, textKey: 'sidebar.reports' },
    // { path: '/documents', icon: <FaFileAlt />, textKey: 'sidebar.documents' },
    // { path: '/settings', icon: <FaCog />, textKey: 'sidebar.settings' },
  ];
  
  return (
    <aside className={`sidebar`}> 
      <div className="sidebar-content">
          <ul className="nav-menu">
            {menuItems.map((item) => (
              <li className="nav-item" key={item.path}>
                <Link 
                  to={item.path} 
                  className={`nav-link d-flex flex-column ${isActive(item.path) ? 'active' : ''}`}
                >
                  <span className="nav-icon">{item.icon}</span>
                  <span className="nav-text" style={{fontSize: '14px'}}>{t(item.textKey)}</span>
                </Link>
              </li>
            ))}
          </ul>
      </div>
    </aside>
  );
}
export default Sidebar
