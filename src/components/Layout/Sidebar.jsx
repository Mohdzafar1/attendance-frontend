import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  FiHome, 
  FiCalendar, 
  FiUsers, 
  FiUserCheck, 
  FiFileText, 
  FiSettings,
  FiActivity,
  FiList,
  FiMenu,
  FiX,
  FiLogOut,
  FiUser,
  FiTarget
} from 'react-icons/fi';

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAdmin, isHR, isEmployee, user, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  // Check if screen is mobile
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
      if (!mobile) {
        setIsMobileMenuOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMobileMenuOpen]);

  const menuItems = [];

  // Employee menu items
  if (isEmployee) {
    menuItems.push(
      { path: '/dashboard', label: 'Mark Attendance', icon: <FiTarget /> },
      { path: '/history', label: 'My History', icon: <FiCalendar /> },
      { path: '/corrections', label: 'Correction Requests', icon: <FiFileText /> }
    );
  }

  // HR menu items
  if (isHR) {
    menuItems.push(
      { path: '/hr', label: 'HR Dashboard', icon: <FiHome /> },
      { path: '/hr/requests', label: 'Pending Requests', icon: <FiList /> },
      { path: '/hr/attendance', label: 'All Attendance', icon: <FiUserCheck /> }
    );
  }

  // Admin menu items
  if (isAdmin) {
    menuItems.push(
      { path: '/admin', label: 'Admin Dashboard', icon: <FiHome /> },
      { path: '/admin/users', label: 'User Management', icon: <FiUsers /> },
      { path: '/admin/rules', label: 'Attendance Rules', icon: <FiSettings /> },
      { path: '/admin/audit', label: 'Audit Logs', icon: <FiActivity /> }
    );
  }

  const handleNavigation = (path) => {
    navigate(path);
    setIsMobileMenuOpen(false);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
    setIsMobileMenuOpen(false);
  };

  const openMobileMenu = () => {
    setIsMobileMenuOpen(true);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      {/* Mobile Header with Hamburger Icon */}
      {isMobile && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          height: '60px',
          background: 'white',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 16px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
          zIndex: 999
        }}>
          <button 
            onClick={openMobileMenu}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '8px',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#667eea'
            }}
          >
            <FiMenu size={24} />
          </button>
          <div>
            <h3 style={{ margin: 0, fontSize: '18px', color: '#667eea' }}>Attendance System</h3>
          </div>
          <div style={{
            width: '36px',
            height: '36px',
            background: '#f0f4ff',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#667eea'
          }}>
            <FiUser size={20} />
          </div>
        </div>
      )}

      {/* Overlay for mobile */}
      {isMobile && isMobileMenuOpen && (
        <div 
          onClick={closeMobileMenu}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.5)',
            zIndex: 1000,
            animation: 'fadeIn 0.3s ease'
          }}
        />
      )}

      {/* Sidebar */}
      <div style={{
        position: isMobile ? 'fixed' : 'fixed',
        top: 0,
        left: isMobile ? (isMobileMenuOpen ? '0' : '-280px') : '0',
        width: '280px',
        height: '100vh',
        background: 'white',
        zIndex: 1001,
        transition: 'left 0.3s ease',
        boxShadow: '2px 0 10px rgba(0,0,0,0.1)',
        display: 'flex',
        flexDirection: 'column',
        overflowY: 'auto'
      }}>
        {/* Sidebar Header */}
        <div style={{
          padding: '25px 20px',
          textAlign: 'center',
          borderBottom: '1px solid #e0e0e0',
          position: 'relative'
        }}>
          {isMobile && (
            <button 
              onClick={closeMobileMenu}
              style={{
                position: 'absolute',
                top: '16px',
                right: '16px',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '8px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#999'
              }}
            >
              <FiX size={24} />
            </button>
          )}
          <h3 style={{ margin: 0, color: '#667eea', fontSize: '20px' }}>Attendance System</h3>
          
          {/* User Info - Desktop only */}
          {!isMobile && user && (
            <div style={{
              marginTop: '20px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '12px',
              background: '#f8f9fa',
              borderRadius: '12px'
            }}>
              <div style={{
                width: '40px',
                height: '40px',
                background: 'linear-gradient(135deg, #667eea, #764ba2)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white'
              }}>
                <FiUser size={20} />
              </div>
              <div style={{ textAlign: 'left', flex: 1 }}>
                <p style={{ fontWeight: 600, color: '#333', margin: 0, fontSize: '14px' }}>
                  {user.full_name || user.username}
                </p>
                <p style={{ fontSize: '11px', color: '#667eea', margin: '4px 0 0', fontWeight: 500 }}>
                  {user.role?.toUpperCase()}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Navigation Menu */}
        <div style={{ padding: '20px 0', flex: 1 }}>
          {menuItems.map((item) => (
            <div
              key={item.path}
              onClick={() => handleNavigation(item.path)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px 20px',
                margin: '4px 12px',
                borderRadius: '10px',
                cursor: 'pointer',
                transition: 'all 0.3s',
                backgroundColor: location.pathname === item.path ? 'rgba(102, 126, 234, 0.1)' : 'transparent',
                color: location.pathname === item.path ? '#667eea' : '#666'
              }}
              onMouseEnter={(e) => {
                if (location.pathname !== item.path) {
                  e.currentTarget.style.backgroundColor = '#f5f5f5';
                }
              }}
              onMouseLeave={(e) => {
                if (location.pathname !== item.path) {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }
              }}
            >
              <span style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                fontSize: '20px',
                color: location.pathname === item.path ? '#667eea' : '#666'
              }}>
                {item.icon}
              </span>
              <span style={{ 
                flex: 1,
                fontSize: '14px',
                fontWeight: location.pathname === item.path ? '600' : '500',
                color: location.pathname === item.path ? '#667eea' : '#333',
                display: 'block'
              }}>
                {item.label}
              </span>
            </div>
          ))}
        </div>

        {/* Mobile User Profile */}
        {isMobile && user && (
          <div style={{
            padding: '20px',
            paddingBottom:"100px",
            borderTop: '1px solid #e0e0e0',
            marginTop: 'auto'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '12px',
              background: '#f8f9fa',
              borderRadius: '12px',
              marginBottom: '15px'
            }}>
              <FiUser size={24} style={{ color: '#667eea' }} />
              <div>
                <p style={{ fontWeight: 600, color: '#333', margin: 0, fontSize: '14px' }}>
                  {user.full_name || user.username}
                </p>
                <p style={{ fontSize: '11px', color: '#999', margin: '2px 0' }}>{user.email}</p>
                <p style={{ fontSize: '10px', color: '#667eea', margin: 0, fontWeight: 600 }}>
                  {user.role?.toUpperCase()}
                </p>
              </div>
            </div>
            <button 
              onClick={handleLogout}
              style={{
                width: '100%',
                padding: '12px',
                background: '#dc3545',
                color: 'white',
                border: 'none',
                borderRadius: '10px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                fontSize: '14px',
                fontWeight: 500
              }}
            >
              <FiLogOut /> Logout
            </button>
          </div>
        )}

        {/* Desktop Logout Button */}
        {!isMobile && (
          <div style={{
            padding: '20px',
            borderTop: '1px solid #e0e0e0'
          }}>
            <button 
              onClick={handleLogout}
              style={{
                width: '100%',
                padding: '10px',
                background: '#dc3545',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                fontSize: '14px',
                fontWeight: 500
              }}
            >
              <FiLogOut /> Logout
            </button>
          </div>
        )}
      </div>
    </>
  );
};

export default Sidebar;