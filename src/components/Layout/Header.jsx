import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const Header = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    toast.success('Logged out successfully');
    navigate('/login');
  };

  return (
    <div className="header">
      <h2>Welcome, {user?.full_name || user?.username}!</h2>
      <div className="user-info">
        <span className="user-name">{user?.email}</span>
        <span className="user-role">{user?.role?.toUpperCase()}</span>
        <button onClick={handleLogout} className="logout-btn">
          Logout
        </button>
      </div>
    </div>
  );
};

export default Header;