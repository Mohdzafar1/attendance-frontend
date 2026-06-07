import React, { useState, useEffect } from 'react';
import attendanceService from '../../services/attendanceService';

const AttendanceHistory = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ limit: 30, offset: 0 });

  useEffect(() => {
    fetchHistory();
  }, [filters]);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const response = await attendanceService.getHistory(filters);
      setHistory(response.data);
    } catch (error) {
      console.error('Error fetching history:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      present: 'status-present',
      late: 'status-late',
      absent: 'status-absent'
    };
    return <span className={`status-badge ${statusMap[status] || 'status-present'}`}>{status || 'present'}</span>;
  };

  return (
    <div className="card">
      <h3 className="card-title">Attendance History</h3>
      
      {loading ? (
        <div className="spinner"></div>
      ) : (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Clock In</th>
                <th>Clock Out</th>
                <th>Total Hours</th>
                <th>Status</th>
                <th>Location</th>
              </tr>
            </thead>
            <tbody>
              {history.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center' }}>No attendance records found</td>
                </tr>
              ) : (
                history.map((record) => (
                  <tr key={record.id}>
                    <td>{new Date(record.attendance_date).toLocaleDateString()}</td>
                    <td>{record.clock_in_time ? new Date(record.clock_in_time).toLocaleTimeString() : '-'}</td>
                    <td>{record.clock_out_time ? new Date(record.clock_out_time).toLocaleTimeString() : '-'}</td>
                    <td>{record.total_hours || '-'}</td>
                    <td>{getStatusBadge(record.status)}</td>
                    <td>{record.clock_in_location || '-'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AttendanceHistory;