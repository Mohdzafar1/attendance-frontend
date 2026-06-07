import React, { useState, useEffect } from 'react';
import attendanceService from '../../services/attendanceService';
import toast from 'react-hot-toast';
import { FiMapPin, FiClock, FiCheckCircle, FiXCircle, FiAlertCircle, FiTrendingUp } from 'react-icons/fi';

const AttendancePanel = () => {
  const [todayStatus, setTodayStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [location, setLocation] = useState('');
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isGettingLocation, setIsGettingLocation] = useState(false);

  useEffect(() => {
    fetchTodayStatus();
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const fetchTodayStatus = async () => {
    try {
      const response = await attendanceService.getTodayStatus();
      console.log('Today status response:', response.data);
      setTodayStatus(response.data);
    } catch (error) {
      console.error('Error fetching status:', error);
    }
  };

  const getCurrentLocation = () => {
    setIsGettingLocation(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setLocation(`Lat: ${latitude.toFixed(4)}, Lng: ${longitude.toFixed(4)}`);
          toast.success('Location detected successfully');
          setIsGettingLocation(false);
        },
        (error) => {
          console.error('Geolocation error:', error);
          toast.error('Unable to get location. Please enter manually.');
          setIsGettingLocation(false);
        }
      );
    } else {
      toast.error('Geolocation is not supported by your browser');
      setIsGettingLocation(false);
    }
  };

  const handleClockIn = async () => {
    if (!location) {
      toast.error('Please enter or detect your location');
      return;
    }
    
    setLoading(true);
    try {
      const response = await attendanceService.clockIn(location);
      toast.success(response.message || 'Clocked in successfully!');
      fetchTodayStatus();
      setLocation('');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to clock in');
    } finally {
      setLoading(false);
    }
  };

  const handleClockOut = async () => {
    if (!location) {
      toast.error('Please enter or detect your location');
      return;
    }
    
    setLoading(true);
    try {
      const response = await attendanceService.clockOut(location);
      toast.success(response.message || 'Clocked out successfully!');
      console.log('Clock out response:', response.data);
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
      return 'Not Clocked In';
    }
    if (todayStatus.clock_in_time && !todayStatus.clock_out_time) {
      return 'Currently Working';
    }
    if (todayStatus.clock_out_time) {
      return 'Completed';
    }
    return 'Unknown';
  };

  const getStatusColor = () => {
    if (!todayStatus || todayStatus.status === 'not_started') return '#ffc107';
    if (todayStatus.clock_in_time && !todayStatus.clock_out_time) return '#28a745';
    if (todayStatus.clock_out_time) return '#28a745';
    return '#dc3545';
  };

  const isClockedIn = todayStatus?.clock_in_time && !todayStatus?.clock_out_time;
  const isClockedOut = todayStatus?.clock_out_time;
  const canClockIn = !todayStatus?.clock_in_time;
  const canClockOut = todayStatus?.clock_in_time && !todayStatus?.clock_out_time;

  // Format hours display
  const formatHours = (hours) => {
    if (!hours || hours === 0) return '0.00';
    return parseFloat(hours).toFixed(2);
  };

  return (
    <div>
      {/* Current Time Display */}
      <div className="card" style={{ textAlign: 'center', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
        <h2 style={{ fontSize: '48px', marginBottom: '10px' }}>
          {currentTime.toLocaleTimeString()}
        </h2>
        <p style={{ fontSize: '18px' }}>
          {currentTime.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </div>

      {/* Today's Status Card */}
      <div className="stats-grid">
        <div className="stat-card" style={{ textAlign: 'center' }}>
          {getStatusIcon()}
          <div className="stat-value" style={{ color: getStatusColor() }}>
            {getStatusText()}
          </div>
          <div style={{ marginTop: '15px', textAlign: 'left' }}>
            {todayStatus?.clock_in_time && (
              <div style={{ marginBottom: '8px' }}>
                <strong>🕐 Clock In:</strong> {new Date(todayStatus.clock_in_time).toLocaleTimeString()}
                {todayStatus.clock_in_location && (
                  <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
                    📍 {todayStatus.clock_in_location}
                  </div>
                )}
              </div>
            )}
            {todayStatus?.clock_out_time && (
              <div style={{ marginBottom: '8px' }}>
                <strong>🕒 Clock Out:</strong> {new Date(todayStatus.clock_out_time).toLocaleTimeString()}
                {todayStatus.clock_out_location && (
                  <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
                    📍 {todayStatus.clock_out_location}
                  </div>
                )}
              </div>
            )}
            {(todayStatus?.total_hours || todayStatus?.total_hours === 0) && todayStatus.clock_out_time && (
              <div style={{ marginTop: '8px', paddingTop: '8px', borderTop: '1px solid #e0e0e0' }}>
                <strong>⏱️ Total Hours:</strong> {formatHours(todayStatus.total_hours)} hrs
                {todayStatus.overtime_hours > 0 && (
                  <span style={{ color: '#28a745', marginLeft: '10px' }}>
                    <FiTrendingUp style={{ verticalAlign: 'middle' }} /> Overtime: {formatHours(todayStatus.overtime_hours)} hrs
                  </span>
                )}
              </div>
            )}
            {todayStatus?.clock_in_time && !todayStatus?.clock_out_time && (
              <div style={{ marginTop: '8px', paddingTop: '8px', borderTop: '1px solid #e0e0e0', color: '#667eea' }}>
                <strong>⏱️ Working Hours:</strong> Calculating...
              </div>
            )}
            {todayStatus?.status === 'late' && (
              <div style={{ marginTop: '8px', color: '#ffc107' }}>
                ⚠️ Late Arrival
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Attendance Actions Card */}
      <div className="card">
        <h3 className="card-title">Mark Attendance</h3>
        
        <div className="form-group">
          <label>📍 Location</label>
          <div style={{ display: 'flex', gap: '10px' }}>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Enter your work location or detect automatically"
              style={{ flex: 1 }}
              disabled={isClockedOut}
            />
            <button
              type="button"
              onClick={getCurrentLocation}
              className="btn-primary"
              disabled={isGettingLocation || isClockedOut}
              style={{ width: 'auto', padding: '0 20px' }}
            >
              {isGettingLocation ? 'Detecting...' : <><FiMapPin /> Detect</>}
            </button>
          </div>
        </div>
        
        <div style={{ display: 'flex', gap: '15px', marginTop: '25px' }}>
          <button
            className="btn-primary"
            onClick={handleClockIn}
            disabled={loading || !canClockIn || isClockedOut}
            style={{ 
              flex: 1,
              background: !canClockIn ? '#ccc' : 'linear-gradient(135deg, #28a745, #20c997)',
              cursor: !canClockIn ? 'not-allowed' : 'pointer',
              fontSize: '16px',
              padding: '12px'
            }}
          >
            {loading ? 'Processing...' : '🟢 CLOCK IN'}
          </button>
          
          <button
            className="btn-primary"
            onClick={handleClockOut}
            disabled={loading || !canClockOut || isClockedOut}
            style={{ 
              flex: 1,
              background: !canClockOut ? '#ccc' : '#dc3545',
              cursor: !canClockOut ? 'not-allowed' : 'pointer',
              fontSize: '16px',
              padding: '12px'
            }}
          >
            {loading ? 'Processing...' : '🔴 CLOCK OUT'}
          </button>
        </div>

        {/* Info Messages */}
        {isClockedOut && (
          <div style={{ marginTop: '15px', padding: '10px', background: '#e8f5e9', borderRadius: '8px', color: '#2e7d32' }}>
            ✅ You have completed your attendance for today. Total hours worked: {formatHours(todayStatus?.total_hours)} hours
          </div>
        )}
        
        {!canClockIn && !isClockedOut && !isClockedIn && (
          <div style={{ marginTop: '15px', padding: '10px', background: '#fff3cd', borderRadius: '8px', color: '#856404' }}>
            ⏰ You haven't clocked in yet. Please clock in to start your workday.
          </div>
        )}
        
        {isClockedIn && !isClockedOut && (
          <div style={{ marginTop: '15px', padding: '10px', background: '#d1ecf1', borderRadius: '8px', color: '#0c5460' }}>
            💼 You are currently working. Don't forget to clock out when you finish!
          </div>
        )}

        {/* Tips */}
        <div style={{ marginTop: '20px', padding: '15px', background: '#f8f9fa', borderRadius: '8px' }}>
          <h4 style={{ marginBottom: '10px', color: '#333' }}>📝 Tips:</h4>
          <ul style={{ marginLeft: '20px', color: '#666', fontSize: '13px' }}>
            <li>Always clock in and out to maintain accurate attendance records</li>
            <li>Use location detection for accurate tracking</li>
            <li>Total hours are calculated automatically when you clock out</li>
            <li>If you forget to clock in/out, submit a correction request</li>
            <li>Check your attendance history regularly</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default AttendancePanel;