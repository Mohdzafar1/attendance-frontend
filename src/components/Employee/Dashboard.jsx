import React, { useState, useEffect } from 'react';
import attendanceService from '../../services/attendanceService';
import toast from 'react-hot-toast';
import { FiClock, FiCheckCircle, FiXCircle, FiAlertCircle } from 'react-icons/fi';

const Dashboard = () => {
  const [todayStatus, setTodayStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [location, setLocation] = useState('');

  useEffect(() => {
    fetchTodayStatus();
  }, []);

  const fetchTodayStatus = async () => {
    try {
      const response = await attendanceService.getTodayStatus();
      setTodayStatus(response.data);
    } catch (error) {
      console.error('Error fetching status:', error);
    }
  };

  const handleClockIn = async () => {
    setLoading(true);
    try {
      await attendanceService.clockIn(location || 'Main Office');
      toast.success('Clocked in successfully!');
      fetchTodayStatus();
      setLocation('');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to clock in');
    } finally {
      setLoading(false);
    }
  };

  const handleClockOut = async () => {
    setLoading(true);
    try {
      await attendanceService.clockOut(location || 'Main Office');
      toast.success('Clocked out successfully!');
      fetchTodayStatus();
      setLocation('');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to clock out');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = () => {
    if (!todayStatus || todayStatus.status === 'not_started') {
      return <FiAlertCircle size={48} color="#ffc107" />;
    }
    if (todayStatus.clock_in_time && !todayStatus.clock_out_time) {
      return <FiClock size={48} color="#28a745" />;
    }
    if (todayStatus.clock_out_time) {
      return <FiCheckCircle size={48} color="#28a745" />;
    }
    return <FiXCircle size={48} color="#dc3545" />;
  };

  const getStatusText = () => {
    if (!todayStatus || todayStatus.status === 'not_started') {
      return 'Not Started';
    }
    if (todayStatus.clock_in_time && !todayStatus.clock_out_time) {
      return 'Working';
    }
    if (todayStatus.clock_out_time) {
      return 'Completed';
    }
    return 'Unknown';
  };

  return (
    <div>
      <div className="stats-grid">
        <div className="stat-card" style={{ textAlign: 'center' }}>
          {getStatusIcon()}
          <div className="stat-value">{getStatusText()}</div>
          <div style={{ marginTop: '10px', color: '#666' }}>
            {todayStatus?.clock_in_time && (
              <div>Clock In: {new Date(todayStatus.clock_in_time).toLocaleTimeString()}</div>
            )}
            {todayStatus?.clock_out_time && (
              <div>Clock Out: {new Date(todayStatus.clock_out_time).toLocaleTimeString()}</div>
            )}
            {todayStatus?.total_hours && (
              <div>Total Hours: {todayStatus.total_hours} hrs</div>
            )}
          </div>
        </div>
      </div>

      <div className="card">
        <h3 className="card-title">Mark Attendance</h3>
        <div className="form-group">
          <label>Location (Optional)</label>
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Enter your work location"
          />
        </div>
        
        <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
          <button
            className="btn-primary"
            onClick={handleClockIn}
            disabled={loading || (todayStatus?.clock_in_time)}
          >
            {loading ? 'Processing...' : 'Clock In'}
          </button>
          <button
            className="btn-primary"
            onClick={handleClockOut}
            disabled={loading || !todayStatus?.clock_in_time || todayStatus?.clock_out_time}
            style={{ background: '#dc3545' }}
          >
            {loading ? 'Processing...' : 'Clock Out'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;