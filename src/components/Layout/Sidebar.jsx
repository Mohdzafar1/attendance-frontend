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

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
      if (!mobile) setIsMobileMenuOpen(false);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    document.body.style.overflow = isMobileMenuOpen ? 'hidden' : 'unset';
    return () => { document.body.style.overflow = 'unset'; };
  }, [isMobileMenuOpen]);

  // ✅ FIX: Use startsWith for nested routes so /hr/requests stays active
  const isActive = (path) => {
    if (path === '/dashboard' || path === '/admin' || path === '/hr') {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  const menuItems = [];

  if (isEmployee) {
    menuItems.push(
      { path: '/dashboard', label: 'Mark Attendance', icon: <FiTarget /> },
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

  const handleNavigation = (path) => {
    navigate(path);
    setIsMobileMenuOpen(false);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
    setIsMobileMenuOpen(false);
  };

  const SidebarContent = () => (
    <div style={{
      width: '260px',
      height: '100vh',
      background: 'white',
      display: 'flex',
      flexDirection: 'column',
      overflowY: 'auto',
      overflowX: 'hidden'
    }}>
      {/* Header */}
      <div style={{
        padding: '24px 20px 20px',
        borderBottom: '1px solid #f0f0f0',
        position: 'relative',
        flexShrink: 0
      }}>
        {isMobile && (
          <button
            onClick={() => setIsMobileMenuOpen(false)}
            style={{
              position: 'absolute',
              top: '16px',
              right: '16px',
              background: '#f5f5f5',
              border: 'none',
              cursor: 'pointer',
              padding: '6px',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#666'
            }}
          >
            <FiX size={20} />
          </button>
        )}

        {/* Logo / Title */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: user ? '16px' : 0 }}>
          <div style={{
            width: '36px',
            height: '36px',
            background: 'linear-gradient(135deg, #667eea, #764ba2)',
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}>
            <FiUserCheck size={18} color="white" />
          </div>
          <h3 style={{ margin: 0, color: '#333', fontSize: '16px', fontWeight: 700, lineHeight: 1.2 }}>
            Attendance<br />
            <span style={{ color: '#667eea', fontWeight: 500, fontSize: '13px' }}>Management</span>
          </h3>
        </div>

        {/* User Info Card */}
        {user && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '10px 12px',
            background: 'linear-gradient(135deg, #f0f4ff, #f8f0ff)',
            borderRadius: '10px',
            border: '1px solid #e8e0ff'
          }}>
            <div style={{
              width: '36px',
              height: '36px',
              background: 'linear-gradient(135deg, #667eea, #764ba2)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              flexShrink: 0
            }}>
              <FiUser size={16} />
            </div>
            <div style={{ overflow: 'hidden' }}>
              <p style={{
                fontWeight: 600,
                color: '#333',
                margin: 0,
                fontSize: '13px',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
              }}>
                {user.full_name || user.username}
              </p>
              <p style={{ fontSize: '10px', color: '#667eea', margin: '2px 0 0', fontWeight: 600 }}>
                {user.role?.toUpperCase()}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Nav Items */}
      <nav style={{ padding: '12px 8px', flex: 1 }}>
        {menuItems.map((item) => {
          const active = isActive(item.path);
          return (
            <div
              key={item.path}
              onClick={() => handleNavigation(item.path)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '11px 14px',
                margin: '2px 0',
                borderRadius: '10px',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                backgroundColor: active ? 'rgba(102, 126, 234, 0.12)' : 'transparent',
                borderLeft: active ? '3px solid #667eea' : '3px solid transparent',
                WebkitTapHighlightColor: 'transparent',
                userSelect: 'none'
              }}
              onMouseEnter={(e) => {
                if (!active) e.currentTarget.style.backgroundColor = '#f7f7f7';
              }}
              onMouseLeave={(e) => {
                if (!active) e.currentTarget.style.backgroundColor = 'transparent';
              }}
              onTouchStart={(e) => {
                // Mobile touch feedback
                if (!active) e.currentTarget.style.backgroundColor = '#f0f4ff';
              }}
              onTouchEnd={(e) => {
                if (!active) e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              <span style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '18px',
                color: active ? '#667eea' : '#888',
                flexShrink: 0,
                transition: 'color 0.2s'
              }}>
                {item.icon}
              </span>
              <span style={{
                fontSize: '13.5px',
                fontWeight: active ? '600' : '500',
                color: active ? '#667eea' : '#444',
                transition: 'all 0.2s',
                whiteSpace: 'nowrap'
              }}>
                {item.label}
              </span>
            </div>
          );
        })}
      </nav>

      {/* Logout */}
      <div style={{ padding: '12px', borderTop: '1px solid #f0f0f0', flexShrink: 0 }}>
        <button
          onClick={handleLogout}
          style={{
            width: '100%',
            padding: '11px',
            background: 'transparent',
            color: '#e53e3e',
            border: '1.5px solid #fed7d7',
            borderRadius: '10px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            fontSize: '13.5px',
            fontWeight: 600,
            transition: 'all 0.2s',
            WebkitTapHighlightColor: 'transparent'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = '#fff5f5';
            e.currentTarget.style.borderColor = '#fc8181';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'transparent';
            e.currentTarget.style.borderColor = '#fed7d7';
          }}
        >
          <FiLogOut size={16} /> Logout
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* ── MOBILE ── */}
      {isMobile && (
        <>
          {/* Top Mobile Header */}
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            height: '56px',
            background: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 16px',
            boxShadow: '0 1px 8px rgba(0,0,0,0.08)',
            zIndex: 998
          }}>
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '8px',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                color: '#667eea',
                WebkitTapHighlightColor: 'transparent'
              }}
            >
              <FiMenu size={22} />
            </button>

            <span style={{ fontWeight: 700, fontSize: '15px', color: '#333' }}>
              Attendance System
            </span>

            <div style={{
              width: '34px',
              height: '34px',
              background: 'linear-gradient(135deg, #667eea, #764ba2)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white'
            }}>
              <FiUser size={16} />
            </div>
          </div>

          {/* Backdrop */}
          {isMobileMenuOpen && (
            <div
              onClick={() => setIsMobileMenuOpen(false)}
              style={{
                position: 'fixed',
                inset: 0,
                background: 'rgba(0,0,0,0.45)',
                zIndex: 1000,
                animation: 'fadeIn 0.25s ease'
              }}
            />
          )}

          {/* Drawer */}
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            height: '100vh',
            zIndex: 1001,
            transform: isMobileMenuOpen ? 'translateX(0)' : 'translateX(-100%)',
            transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            boxShadow: isMobileMenuOpen ? '4px 0 24px rgba(0,0,0,0.15)' : 'none'
          }}>
            <SidebarContent />
          </div>
        </>
      )}

      {/* ── DESKTOP ── */}
      {!isMobile && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          height: '100vh',
          boxShadow: '2px 0 12px rgba(0,0,0,0.06)',
          zIndex: 100
        }}>
          <SidebarContent />
        </div>
      )}

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
    </>
  );
};

export default Sidebar;