import { Link, useLocation } from 'react-router-dom';
import './Sidebar.scss';
import { MdSpaceDashboard } from "react-icons/md";
import { IoPaperPlane } from "react-icons/io5";
import { BsCalendarWeekFill, BsFillChatLeftQuoteFill } from "react-icons/bs";

const Sidebar = () => {
  const location = useLocation();
  
  const isActive = (path) => {
    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  };
    const menuItems = [
    { path: '/dashboard', icon: <MdSpaceDashboard />, text: 'Dashboard' },
    { path: '/my-leaves', icon: <IoPaperPlane />, text: 'My Leaves' },
    { path: '/calender', icon: <BsCalendarWeekFill />, text: 'Calender' },
    { path: '/faq', icon: <BsFillChatLeftQuoteFill />, text: 'FAQ' },
    // { path: '/reports', icon: <FaChartBar />, text: 'Reports' },
    // { path: '/documents', icon: <FaFileAlt />, text: 'Documents' },
    // { path: '/settings', icon: <FaCog />, text: 'Settings' },
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
                  <span className="nav-text" style={{fontSize: '14px'}}>{item.text}</span>
                </Link>
              </li>
            ))}
          </ul>
      </div>
    </aside>
  );
}
export default Sidebar
