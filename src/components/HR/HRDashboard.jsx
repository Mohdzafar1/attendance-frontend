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
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [isTablet, setIsTablet] = useState(window.innerWidth <= 1024);

  // ── responsive listener ──────────────────────────────────────────
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
      setIsTablet(window.innerWidth <= 1024);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    fetchAttendance();
  }, []);

  // ── unchanged logic ──────────────────────────────────────────────
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
    const absent  = data.filter(r => r.status === 'absent').length;
    const late    = data.filter(r => r.status === 'late').length;
    const totalHours = data.reduce((sum, r) => sum + (parseFloat(r.total_hours) || 0), 0);
    setStats({ total, present, absent, late, totalHours });
  };

  const formatHours = (hours) => {
    if (!hours) return '0 hrs';
    const num  = parseFloat(hours);
    const hrs  = Math.floor(num);
    const mins = Math.round((num - hrs) * 60);
    if (hrs === 0) return `${mins} min`;
    if (mins === 0) return `${hrs} hr${hrs > 1 ? 's' : ''}`;
    return `${hrs} hr ${mins} min`;
  };

  // ── stat card definitions ────────────────────────────────────────
  const statCards = [
    {
      icon: <FiCalendar size={isMobile ? 22 : 26} />,
      color: '#667eea',
      bg: 'rgba(102,126,234,0.10)',
      value: stats.total,
      label: 'Total Records',
      valueStyle: {}
    },
    {
      icon: <FiCheckCircle size={isMobile ? 22 : 26} />,
      color: '#22c55e',
      bg: 'rgba(34,197,94,0.10)',
      value: stats.present,
      label: 'Present',
      valueStyle: { color: '#22c55e' }
    },
    {
      icon: <FiXCircle size={isMobile ? 22 : 26} />,
      color: '#ef4444',
      bg: 'rgba(239,68,68,0.10)',
      value: stats.absent,
      label: 'Absent',
      valueStyle: { color: '#ef4444' }
    },
    {
      icon: <FiClock size={isMobile ? 22 : 26} />,
      color: '#f59e0b',
      bg: 'rgba(245,158,11,0.10)',
      value: stats.late,
      label: 'Late Arrivals',
      valueStyle: { color: '#f59e0b' }
    },
    {
      icon: <FiTrendingUp size={isMobile ? 22 : 26} />,
      color: '#06b6d4',
      bg: 'rgba(6,182,212,0.10)',
      value: stats.totalHours.toFixed(1),
      label: 'Total Hours',
      valueStyle: { color: '#06b6d4', fontSize: isMobile ? '20px' : '26px' }
    }
  ];

  // ── grid columns based on screen ────────────────────────────────
  // mobile: 2 cols  |  tablet: 3 cols  |  desktop: 5 cols
  const gridCols = isMobile ? 2 : isTablet ? 3 : 5;

  return (
    <div style={{ width: '100%', boxSizing: 'border-box' }}>

      {/* ── Page heading ─────────────────────────────────────────── */}
      <div style={{
        marginBottom: isMobile ? '16px' : '24px',
        paddingBottom: isMobile ? '12px' : '16px',
        borderBottom: '1px solid #f0f0f0'
      }}>
        <h2 style={{
          margin: 0,
          fontSize: isMobile ? '18px' : '22px',
          fontWeight: 700,
          color: '#1a1a2e'
        }}>
          HR Dashboard
        </h2>
        <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#888' }}>
          Monitor attendance across all employees
        </p>
      </div>

      {/* ── Stats Grid ───────────────────────────────────────────── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${gridCols}, 1fr)`,
        gap: isMobile ? '10px' : '16px',
        marginBottom: isMobile ? '16px' : '24px'
      }}>
        {statCards.map((card, i) => (
          <div
            key={i}
            style={{
              background: 'white',
              borderRadius: isMobile ? '12px' : '16px',
              padding: isMobile ? '14px 12px' : '20px 16px',
              boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: isMobile ? 'flex-start' : 'center',
              gap: isMobile ? '8px' : '10px',
              border: '1px solid #f5f5f5',
              // Last card spans full width on 2-col mobile so it isn't orphaned
              ...(isMobile && i === statCards.length - 1 && statCards.length % 2 !== 0
                ? { gridColumn: '1 / -1', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }
                : {})
            }}
          >
            {/* Icon bubble */}
            <div style={{
              width: isMobile ? '36px' : '48px',
              height: isMobile ? '36px' : '48px',
              borderRadius: '12px',
              background: card.bg,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: card.color,
              flexShrink: 0
            }}>
              {card.icon}
            </div>

            {/* Text */}
            <div style={{ textAlign: isMobile ? 'left' : 'center' }}>
              <div style={{
                fontSize: isMobile ? '20px' : '28px',
                fontWeight: 800,
                color: '#1a1a2e',
                lineHeight: 1,
                ...card.valueStyle
              }}>
                {card.value}
              </div>
              <div style={{
                fontSize: isMobile ? '11px' : '12px',
                color: '#888',
                marginTop: '4px',
                fontWeight: 500,
                whiteSpace: 'nowrap'
              }}>
                {card.label}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Attendance Records ───────────────────────────────────── */}
      <div style={{
        background: 'white',
        borderRadius: isMobile ? '12px' : '16px',
        boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
        border: '1px solid #f5f5f5',
        overflow: 'hidden'          // keeps table from breaking layout
      }}>
        <AttendanceRecords />
      </div>
    </div>
  );
};

export default HrDashboard;