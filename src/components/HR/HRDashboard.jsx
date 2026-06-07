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
      {/* Main Card */}
        <AttendanceRecords/>
    </div>
  );
};

export default HrDashboard;