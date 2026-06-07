import React, { useState, useEffect } from 'react';
import hrService from '../../services/hrService';
import { 
  FiCalendar, 
  FiDownload, 
  FiSearch, 
  FiRefreshCw, 
  FiUsers, 
  FiClock, 
  FiCheckCircle, 
  FiXCircle,
  FiTrendingUp,
  FiFilter,
  FiUser,
  FiBriefcase
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import AttendanceRecords from '../Common/AttendanceRecords';

const HrDashboard = () => {
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    present: 0,
    absent: 0,
    late: 0,
    totalHours: 0
  });
  const [filters, setFilters] = useState({ 
    start_date: '', 
    end_date: '', 
    department: '',
    status: '' 
  });
  const [showFilters, setShowFilters] = useState(true);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    fetchAttendance();
  }, []);

  const fetchAttendance = async () => {
    setLoading(true);
    try {
      const response = await hrService.getAllAttendance(filters);
      setAttendance(response.data);
      calculateStats(response.data);
    } catch (error) {
      console.error('Error fetching attendance:', error);
      toast.error('Failed to fetch attendance records');
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (data) => {
    const total = data.length;
    const present = data.filter(r => r.status === 'present').length;
    const absent = data.filter(r => r.status === 'absent').length;
    const late = data.filter(r => r.status === 'late').length;
    const totalHours = data.reduce((sum, r) => sum + (parseFloat(r.total_hours) || 0), 0);
    
    setStats({ total, present, absent, late, totalHours });
  };

 
 

  const formatHours = (hours) => {
    if (!hours) return '0 hrs';
    const num = parseFloat(hours);
    const hrs = Math.floor(num);
    const mins = Math.round((num - hrs) * 60);
    if (hrs === 0) return `${mins} min`;
    if (mins === 0) return `${hrs} hr${hrs > 1 ? 's' : ''}`;
    return `${hrs} hr ${mins} min`;
  };


  return (
    <div>
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
        <AttendanceRecords/>
    </div>
  );
};

export default HrDashboard;