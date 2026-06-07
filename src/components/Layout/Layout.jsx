import React from 'react';
import { useAuth } from '../../context/AuthContext';
import Header from './Header';
import Sidebar from './Sidebar';

const Layout = ({ children }) => {
  const { user } = useAuth();

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar />
      <div className="main-content" style={{ 
        flex: 1, 
        padding: '20px',
        marginLeft: window.innerWidth > 768 ? '280px' : '0',
        paddingTop: window.innerWidth <= 768 ? '70px' : '20px'
      }}>
        {window.innerWidth > 768 && <Header />}
        {children}
      </div>
    </div>
  );
};

export default Layout;