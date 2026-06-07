import React, { useState, useEffect } from 'react';
import adminService from '../../services/adminService';
import { FiUsers, FiClock, FiCheckCircle, FiFileText } from 'react-icons/fi';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    total_users: 0,
    today_clocked_in: 0,
    pending_corrections: 0,
    late_arrivals_month: 0
  });
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await adminService.getDashboardStats();
      setStats(response.data);
      
      // Mock chart data
      setChartData([
        { name: 'Week 1', present: 45, absent: 5, late: 3 },
        { name: 'Week 2', present: 48, absent: 2, late: 2 },
        { name: 'Week 3', present: 47, absent: 3, late: 4 },
        { name: 'Week 4', present: 50, absent: 0, late: 1 }
      ]);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  return (
    <div>
      <div className="stats-grid">
        <div className="stat-card">
          <FiUsers size={32} color="#667eea" />
          <div className="stat-value">{stats.total_users}</div>
          <div>Total Users</div>
        </div>
        
        <div className="stat-card">
          <FiClock size={32} color="#28a745" />
          <div className="stat-value">{stats.today_clocked_in}</div>
          <div>Clocked In Today</div>
        </div>
        
        <div className="stat-card">
          <FiFileText size={32} color="#ffc107" />
          <div className="stat-value">{stats.pending_corrections}</div>
          <div>Pending Corrections</div>
        </div>
        
        <div className="stat-card">
          <FiCheckCircle size={32} color="#dc3545" />
          <div className="stat-value">{stats.late_arrivals_month}</div>
          <div>Late Arrivals (Month)</div>
        </div>
      </div>
      
      <div className="card">
        <h3 className="card-title">Attendance Trends</h3>
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="present" stroke="#28a745" />
            <Line type="monotone" dataKey="late" stroke="#ffc107" />
            <Line type="monotone" dataKey="absent" stroke="#dc3545" />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default AdminDashboard;