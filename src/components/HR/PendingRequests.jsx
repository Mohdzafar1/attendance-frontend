import React, { useState, useEffect } from 'react';
import hrService from '../../services/hrService';
import toast from 'react-hot-toast';
import {
  FiClock,
  FiCheckCircle,
  FiXCircle,
  FiUser,
  FiBriefcase,
  FiCalendar,
  FiFileText,
  FiMessageCircle,
  FiAlertCircle,
  FiEye
} from 'react-icons/fi';

const PendingRequests = () => {
  const [requests, setRequests]             = useState([]);
  const [loading, setLoading]               = useState(true);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [remarks, setRemarks]               = useState('');
  const [isMobile, setIsMobile]             = useState(window.innerWidth <= 768);

  // ── responsive listener ──────────────────────────────────────────
  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  useEffect(() => { fetchRequests(); }, []);

  // ── unchanged logic ──────────────────────────────────────────────
  const fetchRequests = async () => {
    try {
      const response = await hrService.getPendingRequests();
      setRequests(response.data);
    } catch (error) {
      console.error('Error fetching requests:', error);
      toast.error('Failed to fetch pending requests');
    } finally {
      setLoading(false);
    }
  };

  const handleReview = async (id, status) => {
    if (status === 'rejected' && !remarks) {
      toast.error('Please provide remarks when rejecting a request');
      return;
    }
    try {
      await hrService.reviewRequest(id, status, remarks);
      toast.success(`Request ${status} successfully`);
      setSelectedRequest(null);
      setRemarks('');
      fetchRequests();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to review request');
    }
  };

  const closeModal = () => { setSelectedRequest(null); setRemarks(''); };

  const getRequestTypeLabel = (type) => ({
    missed_in_time:  'Missed Clock In',
    missed_out_time: 'Missed Clock Out',
    wrong_in_time:   'Wrong Clock In',
    wrong_out_time:  'Wrong Clock Out'
  }[type] || type);

  const getRequestTypeIcon = (type) => ({
    missed_in_time:  '⏰',
    missed_out_time: '⏰',
    wrong_in_time:   '✏️',
    wrong_out_time:  '✏️'
  }[type] || '📋');

  const getStatusColor = (type) => ({
    missed_in_time:  '#ffc107',
    missed_out_time: '#ffc107',
    wrong_in_time:   '#17a2b8',
    wrong_out_time:  '#17a2b8'
  }[type] || '#667eea');

  // ── mobile card view for each request ───────────────────────────
  const MobileCard = ({ request }) => (
    <div style={{
      background: 'white',
      borderRadius: '12px',
      border: '1px solid #ebebeb',
      padding: '14px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
    }}>
      {/* top row: name + type badge */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
          <FiUser size={14} color="#667eea" />
          <strong style={{ fontSize: '14px', color: '#222' }}>{request.employee_name}</strong>
        </div>
        <span style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '4px',
          padding: '3px 9px',
          background: `${getStatusColor(request.request_type)}18`,
          color: getStatusColor(request.request_type),
          borderRadius: '20px',
          fontSize: '11px',
          fontWeight: 600,
          whiteSpace: 'nowrap'
        }}>
          {getRequestTypeIcon(request.request_type)} {getRequestTypeLabel(request.request_type)}
        </span>
      </div>

      {/* meta row */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '10px' }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: '#666' }}>
          <FiBriefcase size={12} color="#aaa" /> {request.department || 'N/A'}
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: '#666' }}>
          <FiCalendar size={12} color="#aaa" /> {new Date(request.request_date).toLocaleDateString()}
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: '#28a745' }}>
          <FiClock size={12} /> {request.corrected_time ? new Date(request.corrected_time).toLocaleString() : '-'}
        </span>
      </div>

      {/* reason */}
      <div style={{
        fontSize: '12px',
        color: '#555',
        background: '#f8f9fa',
        borderRadius: '6px',
        padding: '8px 10px',
        marginBottom: '12px',
        lineHeight: 1.5
      }}>
        {request.reason}
      </div>

      {/* action */}
      <button
        onClick={() => setSelectedRequest(request)}
        style={{
          width: '100%',
          padding: '10px',
          background: 'linear-gradient(135deg, #667eea, #764ba2)',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          fontSize: '13px',
          fontWeight: 600,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '6px'
        }}
      >
        <FiEye size={14} /> Review Request
      </button>
    </div>
  );

  return (
    <div className="card">
      {/* ── Header ───────────────────────────────────────────────── */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '20px',
        flexWrap: 'wrap',
        gap: '12px'
      }}>
        <div>
          <h3 className="card-title" style={{
            marginBottom: '4px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: isMobile ? '15px' : '18px'
          }}>
            <FiClock size={18} color="#ffc107" />
            Pending Correction Requests
          </h3>
          <p style={{ fontSize: '12px', color: '#666', margin: 0 }}>
            {requests.length} request{requests.length !== 1 ? 's' : ''} waiting for review
          </p>
        </div>
        <div style={{
          padding: '6px 14px',
          background: '#fff3cd',
          borderRadius: '20px',
          fontSize: '12px',
          color: '#856404',
          display: 'flex',
          alignItems: 'center',
          gap: '5px',
          flexShrink: 0
        }}>
          <FiAlertCircle size={13} /> Needs attention
        </div>
      </div>

      {/* ── States ───────────────────────────────────────────────── */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <div className="spinner" />
          <p style={{ marginTop: '15px', color: '#666' }}>Loading requests...</p>
        </div>
      ) : requests.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '60px 20px',
          background: '#f8f9fa',
          borderRadius: '10px'
        }}>
          <FiCheckCircle size={56} color="#28a745" />
          <h3 style={{ color: '#999', marginTop: '15px' }}>No Pending Requests</h3>
          <p style={{ color: '#aaa' }}>All correction requests have been reviewed</p>
        </div>
      ) : isMobile ? (
        /* ── Mobile: card list ─────────────────────────────────── */
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {requests.map(request => <MobileCard key={request.id} request={request} />)}
        </div>
      ) : (
        /* ── Desktop: table ────────────────────────────────────── */
        <div className="table-container" style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', minWidth: '900px', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f8f9fa' }}>
                {['Employee','Department','Date','Type','Requested Time','Reason','Actions'].map(h => (
                  <th key={h} style={{ padding: '12px', textAlign: 'left', fontSize: '13px', color: '#555', fontWeight: 600 }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {requests.map((request) => (
                <tr key={request.id} style={{ borderBottom: '1px solid #e0e0e0', transition: 'background 0.2s' }}
                  onMouseEnter={e => e.currentTarget.style.background = '#fafafa'}
                  onMouseLeave={e => e.currentTarget.style.background = 'white'}
                >
                  <td style={{ padding: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <FiUser style={{ color: '#667eea' }} />
                      <strong>{request.employee_name}</strong>
                    </div>
                  </td>
                  <td style={{ padding: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <FiBriefcase size={14} color="#999" /> {request.department || 'N/A'}
                    </div>
                  </td>
                  <td style={{ padding: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <FiCalendar size={14} color="#999" />
                      {new Date(request.request_date).toLocaleDateString()}
                    </div>
                  </td>
                  <td style={{ padding: '12px' }}>
                    <span style={{
                      display: 'inline-flex', alignItems: 'center', gap: '5px',
                      padding: '4px 10px',
                      background: `${getStatusColor(request.request_type)}20`,
                      color: getStatusColor(request.request_type),
                      borderRadius: '20px', fontSize: '12px', fontWeight: 500
                    }}>
                      {getRequestTypeIcon(request.request_type)} {getRequestTypeLabel(request.request_type)}
                    </span>
                  </td>
                  <td style={{ padding: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <FiClock size={14} color="#28a745" />
                      <span style={{ fontWeight: 500, color: '#28a745' }}>
                        {request.corrected_time ? new Date(request.corrected_time).toLocaleString() : '-'}
                      </span>
                    </div>
                  </td>
                  <td style={{ padding: '12px', maxWidth: '250px' }}>
                    <div style={{
                      whiteSpace: 'normal', wordBreak: 'break-word',
                      fontSize: '13px', color: '#555',
                      background: '#f8f9fa', padding: '6px 10px', borderRadius: '6px'
                    }}>
                      {request.reason}
                    </div>
                  </td>
                  <td style={{ padding: '12px' }}>
                    <button
                      className="btn-primary"
                      onClick={() => setSelectedRequest(request)}
                      style={{
                        padding: '8px 16px', fontSize: '13px',
                        display: 'flex', alignItems: 'center', gap: '6px',
                        background: 'linear-gradient(135deg, #667eea, #764ba2)',
                        border: 'none', borderRadius: '8px', color: 'white', cursor: 'pointer'
                      }}
                    >
                      <FiEye size={14} /> Review
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ── Modal ────────────────────────────────────────────────── */}
      {selectedRequest && (
        <div
          onClick={closeModal}
          style={{
            position: 'fixed', inset: 0,
            background: 'rgba(0,0,0,0.5)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 1000, padding: isMobile ? '12px' : '20px',
            animation: 'fadeIn 0.25s ease'
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              width: '100%',
              maxWidth: '650px',
              maxHeight: '90vh',
              overflowY: 'auto',
              background: 'white',
              borderRadius: '16px',
              animation: 'slideUp 0.3s ease'
            }}
          >
            {/* Modal Header */}
            <div style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
              padding: '18px 18px 14px',
              borderBottom: '1px solid #f0f0f0'
            }}>
              <div>
                <h3 style={{
                  margin: 0, color: '#333',
                  fontSize: isMobile ? '16px' : '20px',
                  display: 'flex', alignItems: 'center', gap: '10px'
                }}>
                  <span style={{
                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                    width: '32px', height: '32px',
                    background: 'linear-gradient(135deg, #667eea, #764ba2)',
                    borderRadius: '8px', color: 'white', fontSize: '16px', flexShrink: 0
                  }}>📋</span>
                  Review Correction Request
                </h3>
                <p style={{ margin: '5px 0 0', fontSize: '12px', color: '#888', paddingLeft: isMobile ? 0 : '42px' }}>
                  Review and process employee attendance correction request
                </p>
              </div>
              <button
                onClick={closeModal}
                style={{
                  width: '30px', height: '30px', borderRadius: '50%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '20px', background: '#f5f5f5',
                  border: 'none', cursor: 'pointer', flexShrink: 0, marginLeft: '8px'
                }}
                onMouseEnter={e => e.target.style.background = '#e0e0e0'}
                onMouseLeave={e => e.target.style.background = '#f5f5f5'}
              >&times;</button>
            </div>

            {/* Modal Body */}
            <div style={{ padding: '16px 18px' }}>
              {/* Info grid */}
              <div style={{
                background: 'linear-gradient(135deg, #f8f9fa, #ffffff)',
                borderRadius: '12px', padding: '16px',
                border: '1px solid #e8e8e8', marginBottom: '20px'
              }}>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: '8px',
                  marginBottom: '14px', paddingBottom: '10px', borderBottom: '1px solid #e8e8e8'
                }}>
                  <FiFileText size={16} color="#667eea" />
                  <h4 style={{ margin: 0, color: '#333', fontSize: '14px' }}>Request Information</h4>
                </div>

                <div style={{
                  display: 'grid',
                  gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)',
                  gap: '12px'
                }}>
                  {/* Employee */}
                  <div>
                    <label style={{ fontSize: '10px', color: '#999', textTransform: 'uppercase', display: 'block', marginBottom: '5px' }}>👤 Employee</label>
                    <div style={{ padding: '9px 12px', background: 'white', borderRadius: '8px', border: '1px solid #e8e8e8', fontWeight: 500, color: '#333', display: 'flex', alignItems: 'center', gap: '7px', fontSize: '13px' }}>
                      <FiUser size={13} color="#667eea" /> {selectedRequest.employee_name}
                    </div>
                  </div>

                  {/* Department */}
                  <div>
                    <label style={{ fontSize: '10px', color: '#999', textTransform: 'uppercase', display: 'block', marginBottom: '5px' }}>🏢 Department</label>
                    <div style={{ padding: '9px 12px', background: 'white', borderRadius: '8px', border: '1px solid #e8e8e8', color: '#555', display: 'flex', alignItems: 'center', gap: '7px', fontSize: '13px' }}>
                      <FiBriefcase size={13} color="#aaa" /> {selectedRequest.department || 'N/A'}
                    </div>
                  </div>

                  {/* Date */}
                  <div>
                    <label style={{ fontSize: '10px', color: '#999', textTransform: 'uppercase', display: 'block', marginBottom: '5px' }}>📅 Request Date</label>
                    <div style={{ padding: '9px 12px', background: 'white', borderRadius: '8px', border: '1px solid #e8e8e8', color: '#555', display: 'flex', alignItems: 'center', gap: '7px', fontSize: '13px' }}>
                      <FiCalendar size={13} color="#aaa" /> {new Date(selectedRequest.request_date).toLocaleDateString()}
                    </div>
                  </div>

                  {/* Type */}
                  <div>
                    <label style={{ fontSize: '10px', color: '#999', textTransform: 'uppercase', display: 'block', marginBottom: '5px' }}>📋 Request Type</label>
                    <div style={{ padding: '9px 12px', background: 'white', borderRadius: '8px', border: `2px solid ${getStatusColor(selectedRequest.request_type)}22`, color: getStatusColor(selectedRequest.request_type), fontWeight: 500, display: 'flex', alignItems: 'center', gap: '7px', fontSize: '13px' }}>
                      <span>{getRequestTypeIcon(selectedRequest.request_type)}</span>
                      {getRequestTypeLabel(selectedRequest.request_type)}
                    </div>
                  </div>

                  {/* Corrected time */}
                  <div style={{ gridColumn: isMobile ? '1' : 'span 2' }}>
                    <label style={{ fontSize: '10px', color: '#999', textTransform: 'uppercase', display: 'block', marginBottom: '5px' }}>🕐 Requested Corrected Time</label>
                    <div style={{ padding: '9px 12px', background: '#e8f5e9', borderRadius: '8px', border: '1px solid #c8e6c9', color: '#2e7d32', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '7px', fontSize: '13px' }}>
                      <FiClock size={13} /> {new Date(selectedRequest.corrected_time).toLocaleString()}
                    </div>
                  </div>

                  {/* Reason */}
                  <div style={{ gridColumn: isMobile ? '1' : 'span 2' }}>
                    <label style={{ fontSize: '10px', color: '#999', textTransform: 'uppercase', display: 'block', marginBottom: '5px' }}>💬 Reason for Request</label>
                    <div style={{ padding: '10px 12px', background: '#fff3cd', borderRadius: '8px', borderLeft: '4px solid #ffc107', color: '#856404', fontSize: '13px', lineHeight: 1.5 }}>
                      {selectedRequest.reason}
                    </div>
                  </div>
                </div>
              </div>

              {/* Remarks */}
              <div style={{ marginBottom: '4px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '7px', marginBottom: '8px', fontWeight: 600, color: '#333', fontSize: '13px' }}>
                  <FiMessageCircle size={15} color="#667eea" />
                  Review Remarks
                  <span style={{ marginLeft: 'auto', fontSize: '11px', color: '#999', fontWeight: 'normal' }}>
                    {remarks.length}/500
                  </span>
                </label>
                <textarea
                  value={remarks}
                  onChange={(e) => {
                    if (e.target.value.length <= 500) {
                      setRemarks(e.target.value);
                    } else {
                      toast.error('Remarks cannot exceed 500 characters');
                    }
                  }}
                  rows="3"
                  placeholder="Add your remarks or feedback here (e.g., reason for approval/rejection)..."
                  style={{
                    width: '100%', boxSizing: 'border-box',
                    padding: '12px 14px', border: '2px solid #e0e0e0',
                    borderRadius: '10px', fontSize: '13px',
                    fontFamily: 'inherit', resize: 'vertical',
                    transition: 'all 0.2s', lineHeight: 1.5
                  }}
                  onFocus={e => { e.target.style.borderColor = '#667eea'; e.target.style.boxShadow = '0 0 0 3px rgba(102,126,234,0.1)'; }}
                  onBlur={e => { e.target.style.borderColor = '#e0e0e0'; e.target.style.boxShadow = 'none'; }}
                />
              </div>
            </div>

            {/* Modal Footer */}
            <div style={{
              display: 'flex',
              flexDirection: isMobile ? 'column' : 'row',
              gap: '10px',
              justifyContent: 'flex-end',
              padding: '14px 18px',
              borderTop: '1px solid #f0f0f0',
              background: '#fafafa',
              borderRadius: '0 0 16px 16px'
            }}>
              <button
                onClick={() => handleReview(selectedRequest.id, 'rejected')}
                style={{
                  padding: '11px 24px', borderRadius: '10px',
                  fontSize: '13px', fontWeight: 600,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '7px',
                  background: '#dc3545', color: 'white',
                  border: 'none', cursor: 'pointer',
                  order: isMobile ? 2 : 1,
                  transition: 'all 0.2s'
                }}
                onMouseEnter={e => { e.currentTarget.style.background = '#c82333'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = '#dc3545'; e.currentTarget.style.transform = 'translateY(0)'; }}
              >
                <FiXCircle size={15} /> Reject Request
              </button>

              <button
                onClick={() => handleReview(selectedRequest.id, 'approved')}
                style={{
                  padding: '11px 24px', borderRadius: '10px',
                  fontSize: '13px', fontWeight: 600,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '7px',
                  background: 'linear-gradient(135deg, #28a745, #20c997)', color: 'white',
                  border: 'none', cursor: 'pointer',
                  order: isMobile ? 1 : 2,
                  transition: 'all 0.2s'
                }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(40,167,69,0.3)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
              >
                <FiCheckCircle size={15} /> Approve Request
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PendingRequests;