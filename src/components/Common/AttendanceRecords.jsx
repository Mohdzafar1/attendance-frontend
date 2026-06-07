import React, { useState, useEffect, useCallback } from 'react';
import hrService from '../../services/hrService';

import { 
  FiCalendar, 
  FiDownload, 
  FiSearch, 
  FiRefreshCw, 
  FiClock, 
  FiCheckCircle, 
  FiXCircle,
  FiFilter,
  FiUser,
  FiBriefcase,
  FiTrendingUp,
  FiMapPin
} from 'react-icons/fi';
import toast from 'react-hot-toast';

const EMPTY_FILTERS = { start_date: '', end_date: '', department: '', status: '' };

const AttendanceRecords = () => {
  const [attendance, setAttendance] = useState([]);
  const [allAttendance, setAllAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ total: 0, present: 0, absent: 0, late: 0, totalHours: 0 });
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [showFilters, setShowFilters] = useState(true);
  const [exporting, setExporting] = useState(false);

  // ✅ Format time without seconds (HH:MM AM/PM)
  const formatTime = (dateTime) => {
    if (!dateTime) return '-';
    
    const date = new Date(dateTime);
    if (isNaN(date.getTime())) return '-';
    
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  // ✅ Format date consistently
  const formatDate = (date) => {
    if (!date) return '-';
    
    const d = new Date(date);
    if (isNaN(d.getTime())) return '-';
    
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  // ✅ Improved hours calculation with better precision
  const calculateHours = (clockIn, clockOut) => {
    if (!clockIn || !clockOut) return 0;
    
    const start = new Date(clockIn);
    const end = new Date(clockOut);
    
    if (isNaN(start.getTime()) || isNaN(end.getTime())) return 0;
    if (end <= start) return 0;
    
    const diffMs = end - start;
    const diffHours = diffMs / (1000 * 60 * 60);
    
    // Round to 2 decimal places
    return Math.round(diffHours * 100) / 100;
  };

  // ✅ Compute hours for a single record
  const computeRecordHours = (record) => {
    // First try to use total_hours from DB if it exists and is valid
    if (record.total_hours && record.total_hours > 0) {
      return parseFloat(record.total_hours);
    }
    // Otherwise calculate from timestamps
    return calculateHours(record.clock_in_time, record.clock_out_time);
  };

  // ✅ Calculate statistics from data
  const calculateStats = (data) => {
    const total = data.length;
    const present = data.filter(r => r.status === 'present').length;
    const absent = data.filter(r => r.status === 'absent').length;
    const late = data.filter(r => r.status === 'late').length;
    
    // Calculate total hours using the compute function
    const totalHours = data.reduce((sum, record) => {
      return sum + computeRecordHours(record);
    }, 0);
    
    setStats({ 
      total, 
      present, 
      absent, 
      late, 
      totalHours: Math.round(totalHours * 100) / 100 
    });
  };

  // ✅ Fetch attendance with filters
  const fetchAttendance = useCallback(async (activeFilters) => {
    setLoading(true);
    try {
      const response = await hrService.getAllAttendance(activeFilters);
      const data = response.data;
      
      // Process data to ensure total_hours is set correctly
      const processedData = data.map(record => ({
        ...record,
        computed_hours: computeRecordHours(record),
        formatted_clock_in: formatTime(record.clock_in_time),
        formatted_clock_out: formatTime(record.clock_out_time),
        formatted_date: formatDate(record.attendance_date)
      }));
      
      setAttendance(processedData);
      calculateStats(processedData);
    } catch (error) {
      console.error('Error fetching attendance:', error);
      toast.error('Failed to fetch attendance records');
    } finally {
      setLoading(false);
    }
  }, []);

  // Load all records on mount
  useEffect(() => {
    const loadAll = async () => {
      setLoading(true);
      try {
        const response = await hrService.getAllAttendance(EMPTY_FILTERS);
        const data = response.data;
        
        const processedData = data.map(record => ({
          ...record,
          computed_hours: computeRecordHours(record),
          formatted_clock_in: formatTime(record.clock_in_time),
          formatted_clock_out: formatTime(record.clock_out_time),
          formatted_date: formatDate(record.attendance_date)
        }));
        
        setAllAttendance(processedData);
        setAttendance(processedData);
        calculateStats(processedData);
      } catch (error) {
        toast.error('Failed to fetch attendance records');
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    loadAll();
  }, []);

  // Apply filters
  const handleFilter = () => {
    fetchAttendance(filters);
  };

  // Reset filters
  const resetFilters = () => {
    const empty = EMPTY_FILTERS;
    setFilters(empty);
    fetchAttendance(empty);
  };

  // Format hours for display
  const formatHours = (hours) => {
    if (!hours || hours <= 0) return '0 hrs';
    
    const hrs = Math.floor(hours);
    const mins = Math.round((hours - hrs) * 60);
    
    if (hrs === 0) return `${mins} min${mins > 1 ? 's' : ''}`;
    if (mins === 0) return `${hrs} hr${hrs > 1 ? 's' : ''}`;
    return `${hrs} hr${hrs > 1 ? 's' : ''} ${mins} min${mins > 1 ? 's' : ''}`;
  };

  // Format hours for display (decimal)
  const formatHoursDecimal = (hours) => {
    if (!hours || hours <= 0) return '0.00';
    return hours.toFixed(2);
  };

  // Export to CSV
  const exportToCSV = () => {
    setExporting(true);
    try {
      const headers = ['Employee', 'Department', 'Date', 'Clock In', 'Clock Out', 'Total Hours', 'Status', 'Location'];
      const csvData = attendance.map(record => {
        const hours = computeRecordHours(record);
        return [
          record.full_name,
          record.department || '-',
          formatDate(record.attendance_date),
          formatTime(record.clock_in_time),
          formatTime(record.clock_out_time),
          hours > 0 ? hours.toFixed(2) : '0',
          record.status,
          record.clock_in_location || '-'
        ];
      });
      
      const csvContent = [headers, ...csvData].map(row => row.join(',')).join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `attendance_report_${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success('Report exported successfully');
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export report');
    } finally {
      setExporting(false);
    }
  };

  // Get status badge
  const getStatusBadge = (status) => {
    const badges = {
      present:  { class: 'status-present',  icon: <FiCheckCircle />, text: 'Present' },
      absent:   { class: 'status-absent',   icon: <FiXCircle />,     text: 'Absent' },
      late:     { class: 'status-late',     icon: <FiClock />,       text: 'Late' },
      half_day: { class: 'status-half-day', icon: <FiClock />,       text: 'Half Day' }
    };
    const badge = badges[status] || badges.present;
    return (
      <span className={`status-badge ${badge.class}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
        {badge.icon} {badge.text}
      </span>
    );
  };

  // Get departments from all attendance (unfiltered)
  const departments = [...new Set(allAttendance.map(a => a.department).filter(Boolean))];

  return (
    <div>
      {/* Statistics Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <FiCalendar size={32} color="#667eea" />
          <div className="stat-value">{stats.total}</div>
          <div>Total Records</div>
        </div>
        
        <div className="stat-card">
          <FiCheckCircle size={32} color="#28a745" />
          <div className="stat-value" style={{ color: '#28a745' }}>{stats.present}</div>
          <div>Present</div>
        </div>
        
        <div className="stat-card">
          <FiXCircle size={32} color="#dc3545" />
          <div className="stat-value" style={{ color: '#dc3545' }}>{stats.absent}</div>
          <div>Absent</div>
        </div>
        
        <div className="stat-card">
          <FiClock size={32} color="#ffc107" />
          <div className="stat-value" style={{ color: '#ffc107' }}>{stats.late}</div>
          <div>Late Arrivals</div>
        </div>
        
        <div className="stat-card">
          <FiTrendingUp size={32} color="#17a2b8" />
          <div className="stat-value" style={{ color: '#17a2b8', fontSize: '24px' }}>
            {formatHoursDecimal(stats.totalHours)}
          </div>
          <div>Total Hours</div>
        </div>
      </div>

      {/* Main Card */}
      <div className="card">
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '15px' }}>
          <h3 className="card-title" style={{ marginBottom: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
            <FiCalendar />
            Attendance Records
            <span style={{ fontSize: '14px', color: '#666', fontWeight: 'normal' }}>
              ({attendance.length} records)
            </span>
          </h3>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button className="btn-primary" onClick={() => setShowFilters(!showFilters)}
              style={{ background: '#6c757d', display: 'flex', alignItems: 'center', gap: '5px' }}>
              <FiFilter /> {showFilters ? 'Hide Filters' : 'Show Filters'}
            </button>
            <button className="btn-primary" onClick={exportToCSV}
              disabled={exporting || attendance.length === 0}
              style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <FiDownload /> {exporting ? 'Exporting...' : 'Export CSV'}
            </button>
          </div>
        </div>

        {/* Filters */}
        {showFilters && (
          <div style={{ marginBottom: '25px', padding: '20px', background: '#f8f9fa', borderRadius: '10px', border: '1px solid #e0e0e0' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px', marginBottom: '15px' }}>
              
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label style={{ fontSize: '12px', color: '#666', marginBottom: '5px', display: 'block' }}>
                  <FiCalendar /> Start Date
                </label>
                <input type="date" value={filters.start_date}
                  onChange={(e) => setFilters(prev => ({ ...prev, start_date: e.target.value }))}
                  style={{ width: '100%', padding: '8px' }} />
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label style={{ fontSize: '12px', color: '#666', marginBottom: '5px', display: 'block' }}>
                  <FiCalendar /> End Date
                </label>
                <input type="date" value={filters.end_date}
                  onChange={(e) => setFilters(prev => ({ ...prev, end_date: e.target.value }))}
                  style={{ width: '100%', padding: '8px' }} />
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label style={{ fontSize: '12px', color: '#666', marginBottom: '5px', display: 'block' }}>
                  <FiBriefcase /> Department
                </label>
                <select value={filters.department}
                  onChange={(e) => setFilters(prev => ({ ...prev, department: e.target.value }))}
                  style={{ width: '100%', padding: '8px' }}>
                  <option value="">All Departments</option>
                  {departments.map(dept => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </select>
              </div>

              {/* <div className="form-group" style={{ marginBottom: 0 }}>
                <label style={{ fontSize: '12px', color: '#666', marginBottom: '5px', display: 'block' }}>
                  <FiCheckCircle /> Status
                </label>
                <select value={filters.status}
                  onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                  style={{ width: '100%', padding: '8px' }}>
                  <option value="">All Status</option>
                  <option value="present">Present</option>
                  <option value="absent">Absent</option>
                  <option value="late">Late</option>
                  <option value="half_day">Half Day</option>
                </select>
              </div> */}
            </div>

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button className="btn-primary" onClick={handleFilter}
                style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <FiSearch /> Apply Filters
              </button>
              <button onClick={resetFilters}
                style={{ padding: '8px 16px', background: '#6c757d', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' }}>
                <FiRefreshCw /> Reset
              </button>
            </div>
          </div>
        )}

        {/* Table */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <div className="spinner"></div>
            <p style={{ marginTop: '15px', color: '#666' }}>Loading attendance records...</p>
          </div>
        ) : attendance.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px' }}>
            <FiCalendar size={64} color="#ccc" />
            <h3 style={{ color: '#999', marginTop: '15px' }}>No attendance records found</h3>
            <p style={{ color: '#aaa' }}>Try adjusting your filters or check back later</p>
          </div>
        ) : (
          <div className="table-container" style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', minWidth: '800px' }}>
              <thead>
                <tr style={{ background: '#f8f9fa' }}>
                  <th style={{ padding: '12px' }}>Employee</th>
                  <th style={{ padding: '12px' }}>Department</th>
                  <th style={{ padding: '12px' }}>Date</th>
                  <th style={{ padding: '12px' }}>Clock In</th>
                  <th style={{ padding: '12px' }}>Clock Out</th>
                  <th style={{ padding: '12px' }}>Total Hours</th>
                  <th style={{ padding: '12px' }}>Status</th>
                  <th style={{ padding: '12px' }}>Location</th>
                </tr>
              </thead>
              <tbody>
                {attendance.map((record) => {
                  const hours = computeRecordHours(record);
                  const clockInTime = formatTime(record.clock_in_time);
                  const clockOutTime = formatTime(record.clock_out_time);
                  const dateStr = formatDate(record.attendance_date);
                  
                  return (
                    <tr key={record.id} style={{ borderBottom: '1px solid #e0e0e0' }}>
                      <td style={{ padding: '12px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <FiUser style={{ color: '#667eea' }} />
                          <strong>{record.full_name}</strong>
                        </div>
                        <div style={{ fontSize: '11px', color: '#999', marginTop: '4px' }}>
                          {record.department || '-'}
                        </div>
                      </td>
                      <td style={{ padding: '12px' }}>{record.department || '-'}</td>
                      <td style={{ padding: '12px', fontWeight: '500' }}>{dateStr}</td>
                      <td style={{ padding: '12px' }}>
                        {clockInTime !== '-' ? (
                          <span style={{ color: '#28a745', fontWeight: '500' }}>
                            {clockInTime}
                          </span>
                        ) : '-'}
                      </td>
                      <td style={{ padding: '12px' }}>
                        {clockOutTime !== '-' ? (
                          <span style={{ color: '#dc3545', fontWeight: '500' }}>
                            {clockOutTime}
                          </span>
                        ) : '-'}
                      </td>
                      <td style={{ padding: '12px', fontWeight: 'bold', color: '#17a2b8' }}>
                        {hours > 0 ? (
                          <>
                            {formatHours(hours)}
                            <span style={{ fontSize: '11px', color: '#999', marginLeft: '5px' }}>
                              ({hours.toFixed(2)} hrs)
                            </span>
                          </>
                        ) : '-'}
                      </td>
                      <td style={{ padding: '12px' }}>{getStatusBadge(record.status)}</td>
                      <td style={{ padding: '12px', fontSize: '12px', color: '#666' }}>
                        {record.clock_in_location ? (
                          <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                            <FiMapPin size={12} /> {record.clock_in_location}
                          </span>
                        ) : '-'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Footer Summary */}
        {!loading && attendance.length > 0 && (
          <div style={{ marginTop: '20px', padding: '15px', background: '#f8f9fa', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
            <div>
              <span style={{ color: '#666' }}>Showing </span>
              <strong>{attendance.length}</strong>
              <span style={{ color: '#666' }}> records</span>
            </div>
            <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
              <div>
                <span style={{ color: '#28a745' }}>● Present:</span>
                <strong style={{ marginLeft: '5px' }}>{stats.present}</strong>
              </div>
              <div>
                <span style={{ color: '#dc3545' }}>● Absent:</span>
                <strong style={{ marginLeft: '5px' }}>{stats.absent}</strong>
              </div>
              <div>
                <span style={{ color: '#ffc107' }}>● Late:</span>
                <strong style={{ marginLeft: '5px' }}>{stats.late}</strong>
              </div>
              <div>
                <span style={{ color: '#17a2b8' }}>⏱ Total Hours:</span>
                <strong style={{ marginLeft: '5px' }}>
                  {formatHours(stats.totalHours)} ({stats.totalHours.toFixed(2)} hrs)
                </strong>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AttendanceRecords;