import { Link, useLocation } from 'react-router-dom';
import './Sidebar.scss';
import { MdSpaceDashboard } from "react-icons/md";
import { IoPaperPlane } from "react-icons/io5";
import { BsCalendarWeekFill, BsFillChatLeftQuoteFill } from "react-icons/bs";
import { FaBuilding, FaUserTie, FaCog, FaUsers } from "react-icons/fa";
import { useTranslation } from 'react-i18next';
import authService from '../../services/authService';

const Sidebar = () => {
  const { t } = useTranslation(); 
  const location = useLocation();
  
  const isActive = (path) => {
    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  };

  // Get user role and permissions
  const userRole = authService.getUserRole();
  const userPermissions = authService.getUserPermissions();


  // Define all menu items with their required permissions
  const allMenuItems = [
    { path: '/dashboard', icon: <MdSpaceDashboard />, textKey: 'sidebar.dashboard', permission: 'dashboard' }, 
    { path: '/my-leaves', icon: <IoPaperPlane />, textKey: 'sidebar.myLeaves', permission: 'my-leaves' },    { path: '/leaves-approval', icon: <IoPaperPlane />, textKey: 'sidebar.leavesApproval', permission: 'leaves-approval' }, 
    { path: '/leaves-history', icon: <IoPaperPlane />, textKey: 'sidebar.leavesHistory', permission: 'leaves-history' }, 
    { path: '/employees', icon: <FaUsers />, textKey: 'sidebar.employees', permission: 'employees' },
    { path: '/department', icon: <FaBuilding />, textKey: 'sidebar.department', permission: 'department' }, 
    { path: '/role', icon: <FaUserTie />, textKey: 'sidebar.role', permission: 'role' },
    { path: '/leave-setting', icon: <FaCog />, textKey: 'sidebar.leaveSetting', permission: 'leave-setting' },
    { path: '/calender', icon: <BsCalendarWeekFill />, textKey: 'sidebar.calendar', permission: 'calender' },
    { path: '/faq', icon: <BsFillChatLeftQuoteFill />, textKey: 'sidebar.faq', permission: 'faq' }, 
  ];

  // Filter menu items based on user permissions
  const getFilteredMenuItems = () => {
    if (!userRole || !userPermissions.length) {
      // If no role or permissions, show default items
      return allMenuItems.filter(item => ['dashboard', 'my-leaves', 'calendar', 'faq'].includes(item.permission));
    }

    console.log('userPermissions:', userPermissions)

    // Filter based on user permissions
    return allMenuItems.filter(item => userPermissions.includes(item.permission));
  };

  const menuItems = getFilteredMenuItems();

  
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
