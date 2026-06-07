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
  FiBriefcase
} from 'react-icons/fi';
import toast from 'react-hot-toast';

const EMPTY_FILTERS = { start_date: '', end_date: '', department: '', status: '' };

const AttendanceRecords = () => {
  const [attendance, setAttendance] = useState([]);
  const [allAttendance, setAllAttendance] = useState([]); // master copy for dept list
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ total: 0, present: 0, absent: 0, late: 0, totalHours: 0 });
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [showFilters, setShowFilters] = useState(true);
  const [exporting, setExporting] = useState(false);

  // ✅ Compute hours directly from timestamps — never trust DB total_hours
  const computeHours = (record) => {
    if (!record.clock_in_time || !record.clock_out_time) return 0;
    const diffMs = new Date(record.clock_out_time) - new Date(record.clock_in_time);
    return diffMs > 0 ? diffMs / (1000 * 60 * 60) : 0;
  };

  const calculateStats = (data) => {
    const total = data.length;
    const present = data.filter(r => r.status === 'present').length;
    const absent  = data.filter(r => r.status === 'absent').length;
    const late    = data.filter(r => r.status === 'late').length;
    const totalHours = data.reduce((sum, r) => sum + computeHours(r), 0);
    setStats({ total, present, absent, late, totalHours });
  };

  // ✅ FIX: Accept filters as a parameter so the function always uses
  //    the latest values — avoids stale closure bugs entirely.
  const fetchAttendance = useCallback(async (activeFilters) => {
    setLoading(true);
    try {
      const response = await hrService.getAllAttendance(activeFilters);
      setAttendance(response.data);
      calculateStats(response.data);
    } catch (error) {
      console.error('Error fetching attendance:', error);
      toast.error('Failed to fetch attendance records');
    } finally {
      setLoading(false);
    }
  }, []);

  // Load all records on mount (also populates dept dropdown)
  useEffect(() => {
    const loadAll = async () => {
      setLoading(true);
      try {
        const response = await hrService.getAllAttendance(EMPTY_FILTERS);
        setAllAttendance(response.data);
        setAttendance(response.data);
        calculateStats(response.data);
      } catch (error) {
        toast.error('Failed to fetch attendance records');
      } finally {
        setLoading(false);
      }
    };
    loadAll();
  }, []);

  // ✅ FIX: Apply — pass current filters directly, no closure issue
  const handleFilter = () => {
    fetchAttendance(filters);
  };

  // ✅ FIX: Reset — pass empty filters directly, no setTimeout hack needed
  const resetFilters = () => {
    const empty = EMPTY_FILTERS;
    setFilters(empty);
    fetchAttendance(empty);
  };

  const formatHours = (hours) => {
    if (!hours || hours <= 0) return '-';
    const hrs = Math.floor(hours);
    const mins = Math.round((hours - hrs) * 60);
    if (hrs === 0) return `${mins} min`;
    if (mins === 0) return `${hrs} hr${hrs > 1 ? 's' : ''}`;
    return `${hrs} hr ${mins} min`;
  };

  const exportToCSV = () => {
    setExporting(true);
    try {
      const headers = ['Employee', 'Department', 'Date', 'Clock In', 'Clock Out', 'Total Hours', 'Status', 'Location'];
      const csvData = attendance.map(record => {
        const hours = computeHours(record);
        return [
          record.full_name,
          record.department || '-',
          new Date(record.attendance_date).toLocaleDateString(),
          record.clock_in_time ? new Date(record.clock_in_time).toLocaleTimeString() : '-',
          record.clock_out_time ? new Date(record.clock_out_time).toLocaleTimeString() : '-',
          hours > 0 ? formatHours(hours) : '0',
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
    } catch {
      toast.error('Failed to export report');
    } finally {
      setExporting(false);
    }
  };

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

  // ✅ Use allAttendance (unfiltered) for dept list so it never empties after filtering
  const departments = [...new Set(allAttendance.map(a => a.department).filter(Boolean))];

  return (
    <div>
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

              <div className="form-group" style={{ marginBottom: 0 }}>
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
              </div>
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
                  const computedHours = computeHours(record);
                  return (
                    <tr key={record.id} style={{ borderBottom: '1px solid #e0e0e0' }}>
                      <td style={{ padding: '12px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <FiUser style={{ color: '#667eea' }} />
                          <strong>{record.full_name}</strong>
                        </div>
                      </td>
                      <td style={{ padding: '12px' }}>{record.department || '-'}</td>
                      <td style={{ padding: '12px' }}>
                        {new Date(record.attendance_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </td>
                      <td style={{ padding: '12px' }}>
                        {record.clock_in_time
                          ? <span style={{ color: '#28a745' }}>{new Date(record.clock_in_time).toLocaleTimeString()}</span>
                          : '-'}
                      </td>
                      <td style={{ padding: '12px' }}>
                        {record.clock_out_time
                          ? <span style={{ color: '#dc3545' }}>{new Date(record.clock_out_time).toLocaleTimeString()}</span>
                          : '-'}
                      </td>
                      <td style={{ padding: '12px', fontWeight: 'bold' }}>
                        {formatHours(computedHours)}
                      </td>
                      <td style={{ padding: '12px' }}>{getStatusBadge(record.status)}</td>
                      <td style={{ padding: '12px', fontSize: '12px', color: '#666' }}>
                        {record.clock_in_location || '-'}
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
            <div style={{ display: 'flex', gap: '20px' }}>
              <div><span style={{ color: '#28a745' }}>● Present:</span><strong style={{ marginLeft: '5px' }}>{stats.present}</strong></div>
              <div><span style={{ color: '#dc3545' }}>● Absent:</span><strong style={{ marginLeft: '5px' }}>{stats.absent}</strong></div>
              <div><span style={{ color: '#ffc107' }}>● Late:</span><strong style={{ marginLeft: '5px' }}>{stats.late}</strong></div>
              <div><span style={{ color: '#17a2b8' }}>⏱ Total Hours:</span><strong style={{ marginLeft: '5px' }}>{formatHours(stats.totalHours)}</strong></div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AttendanceRecords;