import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  FiHome, 
  FiClock, 
  FiCalendar, 
  FiUsers, 
  FiUserCheck, 
  FiFileText, 
  FiSettings,
  FiActivity,
  FiList
} from 'react-icons/fi';

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAdmin, isHR, isEmployee } = useAuth();

  const menuItems = [];

  // Common menu items for all roles
  if (isEmployee) {
    menuItems.push(
      { path: '/dashboard', label: 'Dashboard', icon: <FiHome /> },
      // { path: '/attendance', label: 'Mark Attendance', icon: <FiClock /> },
      { path: '/history', label: 'My History', icon: <FiCalendar /> },
      { path: '/corrections', label: 'Correction Requests', icon: <FiFileText /> }
    );
  }

  if (isHR) {
    menuItems.push(
      { path: '/hr', label: 'HR Dashboard', icon: <FiHome /> },
      { path: '/hr/requests', label: 'Pending Requests', icon: <FiList /> },
      { path: '/hr/attendance', label: 'All Attendance', icon: <FiUserCheck /> }
    );
  }

  if (isAdmin) {
    menuItems.push(
      { path: '/admin', label: 'Admin Dashboard', icon: <FiHome /> },
      { path: '/admin/users', label: 'User Management', icon: <FiUsers /> },
      { path: '/admin/rules', label: 'Attendance Rules', icon: <FiSettings /> },
      { path: '/admin/audit', label: 'Audit Logs', icon: <FiActivity /> }
    );
  }

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <h3>Attendance System</h3>
      </div>
      <div className="sidebar-nav">
        {menuItems.map((item) => (
          <div
            key={item.path}
            className={`nav-item ${location.pathname === item.path ? 'active' : ''}`}
            onClick={() => navigate(item.path)}
          >
            {item.icon}
            <span>{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Sidebar;