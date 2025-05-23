import { Link, useLocation } from 'react-router-dom';
import { 
  FaHome, 
  FaCalendarAlt, 
  FaUserFriends, 
  FaClipboardList, 
  FaCog, 
  FaChartBar, 
  FaFileAlt
} from 'react-icons/fa';
import './Sidebar.scss';

const Sidebar = ({ collapsed }) => {
  const location = useLocation();
  
  const isActive = (path) => {
    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  };
    const menuItems = [
    { path: '/dashboard', icon: <FaHome />, text: 'Dashboard' },
    { path: '/calendar', icon: <FaCalendarAlt />, text: 'Calendar' },
    { path: '/team', icon: <FaUserFriends />, text: 'Team' },
    { path: '/leave-requests', icon: <FaClipboardList />, text: 'Leave Requests' },
    { path: '/reports', icon: <FaChartBar />, text: 'Reports' },
    { path: '/documents', icon: <FaFileAlt />, text: 'Documents' },
    { path: '/settings', icon: <FaCog />, text: 'Settings' },
  ];
  
  return (
    <aside className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
      {/* <div className="sidebar-logo">
        <Link to="/">
          <span className="logo-icon">L</span>
          <span className="logo-text">Leavey</span>
        </Link>
      </div> */}
      
      <div className="sidebar-content">
        <div className="menu-category">
          <span className="menu-title">Main Menu</span>
          <ul className="nav-menu">
            {menuItems.map((item) => (
              <li className="nav-item" key={item.path}>
                <Link 
                  to={item.path} 
                  className={`nav-link ${isActive(item.path) ? 'active' : ''}`}
                >
                  <span className="nav-icon">{item.icon}</span>
                  <span className="nav-text">{item.text}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </aside>
  );
}
export default Sidebar
