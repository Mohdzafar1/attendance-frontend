import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import Header from './Header';
import Sidebar from './Sidebar';

const Layout = ({ children }) => {
  const { user } = useAuth();
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f5f6fa' }}>
      <Sidebar />

      <div
        style={{
          flex: 1,
          minWidth: 0,                              // prevents flex overflow
          marginLeft: isMobile ? '0' : '260px',    // matches Sidebar width
          paddingTop: isMobile ? '56px' : '0',     // matches mobile header height
          transition: 'margin-left 0.3s ease, padding-top 0.3s ease',
          display: 'flex',
          flexDirection: 'column',
          minHeight: '100vh',
        }}
      >
        {/* Header only on desktop */}
        {!isMobile && <Header />}

        {/* Page content */}
        <main
          style={{
            flex: 1,
            padding: isMobile ? '16px 12px' : '24px 28px',
            overflowX: 'hidden',
          }}
        >
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;