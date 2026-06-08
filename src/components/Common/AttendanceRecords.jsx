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

/* ─── Responsive styles injected once ─── */
const responsiveCSS = `
  .ar-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    flex-wrap: wrap;
    gap: 12px;
  }

  .ar-header-actions {
    display: flex;
    gap: 10px;
    flex-wrap: wrap;
  }

  .ar-filters-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
    gap: 15px;
    margin-bottom: 15px;
  }

  .ar-filter-actions {
    display: flex;
    gap: 10px;
    justify-content: flex-end;
    flex-wrap: wrap;
  }

  .ar-table-wrapper {
    width: 100%;
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
  }

  .ar-table {
    width: 100%;
    min-width: 700px;
    border-collapse: collapse;
  }

  .ar-table th,
  .ar-table td {
    padding: 12px 10px;
    text-align: left;
    white-space: nowrap;
  }

  .ar-table thead tr {
    background: #f8f9fa;
  }

  .ar-table tbody tr {
    border-bottom: 1px solid #e0e0e0;
  }

  .ar-footer {
    margin-top: 20px;
    padding: 15px;
    background: #f8f9fa;
    border-radius: 8px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: 10px;
  }

  .ar-footer-stats {
    display: flex;
    gap: 16px;
    flex-wrap: wrap;
  }

  /* Card-style rows on very small screens */
  @media (max-width: 600px) {
    .ar-header-title {
      font-size: 15px !important;
    }

    .ar-btn {
      font-size: 13px;
      padding: 7px 12px !important;
    }

    .ar-filters-grid {
      grid-template-columns: 1fr;
    }

    .ar-filter-actions {
      justify-content: stretch;
    }

    .ar-filter-actions button {
      flex: 1;
      justify-content: center;
    }

    /* Stack employee name + department col on mobile */
    .ar-dept-col {
      display: none;
    }

    .ar-footer {
      flex-direction: column;
      align-items: flex-start;
    }

    .ar-footer-stats {
      gap: 10px;
    }
  }

  @media (max-width: 400px) {
    .ar-table th,
    .ar-table td {
      padding: 10px 8px;
      font-size: 12px;
    }

    .ar-location-col {
      display: none;
    }
  }
`;

/* Inject CSS once */
if (typeof document !== 'undefined' && !document.getElementById('ar-responsive-css')) {
  const style = document.createElement('style');
  style.id = 'ar-responsive-css';
  style.textContent = responsiveCSS;
  document.head.appendChild(style);
}

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
    return Math.round(diffHours * 100) / 100;
  };

  // ✅ Compute hours for a single record
  const computeRecordHours = (record) => {
    if (record.total_hours && record.total_hours > 0) {
      return parseFloat(record.total_hours);
    }
    return calculateHours(record.clock_in_time, record.clock_out_time);
  };

  // ✅ Calculate statistics from data
  const calculateStats = (data) => {
    const total = data.length;
    const present = data.filter(r => r.status === 'present').length;
    const absent = data.filter(r => r.status === 'absent').length;
    const late = data.filter(r => r.status === 'late').length;
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
      {/* Main Card */}
      <div className="card">

        {/* ── Header ── */}
        <div className="ar-header">
          <h3
            className="card-title ar-header-title"
            style={{ marginBottom: 0, display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}
          >
            <FiCalendar />
            Attendance Records
            <span style={{ fontSize: '14px', color: '#666', fontWeight: 'normal' }}>
              ({attendance.length} records)
            </span>
          </h3>

          <div className="ar-header-actions">
            <button
              className="btn-primary ar-btn"
              onClick={() => setShowFilters(!showFilters)}
              style={{ background: '#6c757d', display: 'flex', alignItems: 'center', gap: '5px' }}
            >
              <FiFilter /> {showFilters ? 'Hide Filters' : 'Show Filters'}
            </button>
            <button
              className="btn-primary ar-btn"
              onClick={exportToCSV}
              disabled={exporting || attendance.length === 0}
              style={{ display: 'flex', alignItems: 'center', gap: '5px' }}
            >
              <FiDownload /> {exporting ? 'Exporting...' : 'Export CSV'}
            </button>
          </div>
        </div>

        {/* ── Filters ── */}
        {showFilters && (
          <div style={{ marginBottom: '25px', padding: '20px', background: '#f8f9fa', borderRadius: '10px', border: '1px solid #e0e0e0' }}>
            <div className="ar-filters-grid">

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label style={{ fontSize: '12px', color: '#666', marginBottom: '5px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <FiCalendar /> Start Date
                </label>
                <input
                  type="date"
                  value={filters.start_date}
                  onChange={(e) => setFilters(prev => ({ ...prev, start_date: e.target.value }))}
                  style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
                />
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label style={{ fontSize: '12px', color: '#666', marginBottom: '5px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <FiCalendar /> End Date
                </label>
                <input
                  type="date"
                  value={filters.end_date}
                  onChange={(e) => setFilters(prev => ({ ...prev, end_date: e.target.value }))}
                  style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
                />
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label style={{ fontSize: '12px', color: '#666', marginBottom: '5px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <FiBriefcase /> Department
                </label>
                <select
                  value={filters.department}
                  onChange={(e) => setFilters(prev => ({ ...prev, department: e.target.value }))}
                  style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
                >
                  <option value="">All Departments</option>
                  {departments.map(dept => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="ar-filter-actions">
              <button
                className="btn-primary"
                onClick={handleFilter}
                style={{ display: 'flex', alignItems: 'center', gap: '5px' }}
              >
                <FiSearch /> Apply Filters
              </button>
              <button
                onClick={resetFilters}
                style={{ padding: '8px 16px', background: '#6c757d', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' }}
              >
                <FiRefreshCw /> Reset
              </button>
            </div>
          </div>
        )}

        {/* ── Table ── */}
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
          <div className="ar-table-wrapper">
            <table className="ar-table">
              <thead>
                <tr>
                  <th>Employee</th>
                  <th className="ar-dept-col">Department</th>
                  <th>Date</th>
                  <th>Clock In</th>
                  <th>Clock Out</th>
                  <th>Total Hours</th>
                  <th>Status</th>
                  <th className="ar-location-col">Location</th>
                </tr>
              </thead>
              <tbody>
                {attendance.map((record) => {
                  const hours = computeRecordHours(record);
                  const clockInTime = formatTime(record.clock_in_time);
                  const clockOutTime = formatTime(record.clock_out_time);
                  const dateStr = formatDate(record.attendance_date);

                  return (
                    <tr key={record.id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <FiUser style={{ color: '#667eea', flexShrink: 0 }} />
                          <strong style={{ whiteSpace: 'nowrap' }}>{record.full_name}</strong>
                        </div>
                        {/* Show dept under name on mobile (since dept col is hidden) */}
                        <div style={{ fontSize: '11px', color: '#999', marginTop: '4px' }}>
                          {record.department || '-'}
                        </div>
                      </td>
                      <td className="ar-dept-col">{record.department || '-'}</td>
                      <td style={{ fontWeight: '500' }}>{dateStr}</td>
                      <td>
                        {clockInTime !== '-' ? (
                          <span style={{ color: '#28a745', fontWeight: '500' }}>{clockInTime}</span>
                        ) : '-'}
                      </td>
                      <td>
                        {clockOutTime !== '-' ? (
                          <span style={{ color: '#dc3545', fontWeight: '500' }}>{clockOutTime}</span>
                        ) : '-'}
                      </td>
                      <td style={{ fontWeight: 'bold', color: '#17a2b8' }}>
                        {hours > 0 ? formatHours(hours) : '-'}
                      </td>
                      <td>{getStatusBadge(record.status)}</td>
                      <td className="ar-location-col" style={{ fontSize: '12px', color: '#666' }}>
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

        {/* ── Footer Summary ── */}
        {!loading && attendance.length > 0 && (
          <div className="ar-footer">
            <div>
              <span style={{ color: '#666' }}>Showing </span>
              <strong>{attendance.length}</strong>
              <span style={{ color: '#666' }}> records</span>
            </div>
            <div className="ar-footer-stats">
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
                <strong style={{ marginLeft: '5px' }}>{stats.totalHours.toFixed(2)} hrs</strong>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AttendanceRecords;