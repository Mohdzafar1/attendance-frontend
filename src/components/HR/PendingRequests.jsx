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
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [remarks, setRemarks] = useState('');

  useEffect(() => {
    fetchRequests();
  }, []);

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

  const closeModal = () => {
    setSelectedRequest(null);
    setRemarks('');
  };

  const getRequestTypeLabel = (type) => {
    const types = {
      missed_in_time: 'Missed Clock In',
      missed_out_time: 'Missed Clock Out',
      wrong_in_time: 'Wrong Clock In',
      wrong_out_time: 'Wrong Clock Out'
    };
    return types[type] || type;
  };

  const getRequestTypeIcon = (type) => {
    const icons = {
      missed_in_time: '⏰',
      missed_out_time: '⏰',
      wrong_in_time: '✏️',
      wrong_out_time: '✏️'
    };
    return icons[type] || '📋';
  };

  const getStatusColor = (type) => {
    const colors = {
      missed_in_time: '#ffc107',
      missed_out_time: '#ffc107',
      wrong_in_time: '#17a2b8',
      wrong_out_time: '#17a2b8'
    };
    return colors[type] || '#667eea';
  };

  return (
    <div className="card">
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: '20px',
        flexWrap: 'wrap',
        gap: '15px'
      }}>
        <div>
          <h3 className="card-title" style={{ 
            marginBottom: '5px', 
            display: 'flex', 
            alignItems: 'center', 
            gap: '10px' 
          }}>
            <FiClock size={20} color="#ffc107" />
            Pending Correction Requests
          </h3>
          <p style={{ fontSize: '13px', color: '#666', margin: 0 }}>
            {requests.length} request{requests.length !== 1 ? 's' : ''} waiting for review
          </p>
        </div>
        <div style={{
          padding: '8px 16px',
          background: '#fff3cd',
          borderRadius: '20px',
          fontSize: '12px',
          color: '#856404',
          display: 'flex',
          alignItems: 'center',
          gap: '5px'
        }}>
          <FiAlertCircle size={14} />
          Needs attention
        </div>
      </div>
      
      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <div className="spinner"></div>
          <p style={{ marginTop: '15px', color: '#666' }}>Loading requests...</p>
        </div>
      ) : requests.length === 0 ? (
        <div style={{ 
          textAlign: 'center', 
          padding: '60px 20px',
          background: '#f8f9fa',
          borderRadius: '10px'
        }}>
          <FiCheckCircle size={64} color="#28a745" />
          <h3 style={{ color: '#999', marginTop: '15px' }}>No Pending Requests</h3>
          <p style={{ color: '#aaa' }}>All correction requests have been reviewed</p>
        </div>
      ) : (
        <div className="table-container" style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', minWidth: '900px' }}>
            <thead>
              <tr style={{ background: '#f8f9fa' }}>
                <th style={{ padding: '12px' }}>Employee</th>
                <th style={{ padding: '12px' }}>Department</th>
                <th style={{ padding: '12px' }}>Date</th>
                <th style={{ padding: '12px' }}>Type</th>
                <th style={{ padding: '12px' }}>Requested Time</th>
                <th style={{ padding: '12px' }}>Reason</th>
                <th style={{ padding: '12px' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {requests.map((request) => (
                <tr key={request.id} style={{ borderBottom: '1px solid #e0e0e0', transition: 'background 0.3s' }}>
                  <td style={{ padding: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <FiUser style={{ color: '#667eea' }} />
                      <strong>{request.employee_name}</strong>
                    </div>
                   </td>
                  <td style={{ padding: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <FiBriefcase size={14} color="#999" />
                      {request.department || 'N/A'}
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
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '5px',
                      padding: '4px 10px',
                      background: `${getStatusColor(request.request_type)}20`,
                      color: getStatusColor(request.request_type),
                      borderRadius: '20px',
                      fontSize: '12px',
                      fontWeight: '500'
                    }}>
                      <span>{getRequestTypeIcon(request.request_type)}</span>
                      {getRequestTypeLabel(request.request_type)}
                    </span>
                   </td>
                  <td style={{ padding: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <FiClock size={14} color="#28a745" />
                      <span style={{ fontWeight: '500', color: '#28a745' }}>
                        {request.corrected_time ? new Date(request.corrected_time).toLocaleString() : '-'}
                      </span>
                    </div>
                   </td>
                  <td style={{ padding: '12px', maxWidth: '250px' }}>
                    <div style={{
                      whiteSpace: 'normal',
                      wordBreak: 'break-word',
                      fontSize: '13px',
                      color: '#555',
                      background: '#f8f9fa',
                      padding: '6px 10px',
                      borderRadius: '6px'
                    }}>
                      {request.reason}
                    </div>
                   </td>
                  <td style={{ padding: '12px' }}>
                    <button
                      className="btn-primary"
                      onClick={() => setSelectedRequest(request)}
                      style={{
                        padding: '8px 16px',
                        fontSize: '13px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        background: 'linear-gradient(135deg, #667eea, #764ba2)'
                      }}
                    >
                      <FiEye size={14} />
                      Review
                    </button>
                   </td>
                 </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* FIXED MODAL - Click outside closes, click inside doesn't */}
      {selectedRequest && (
        <div 
          className="modal-overlay" 
          onClick={closeModal}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            animation: 'fadeIn 0.3s ease'
          }}
        >
          <div 
            className="modal-content" 
            onClick={(e) => e.stopPropagation()}
            style={{ 
              maxWidth: '650px',
              width: '90%',
              maxHeight: '85vh',
              overflowY: 'auto',
              background: 'white',
              borderRadius: '16px',
              animation: 'slideUp 0.3s ease'
            }}
          >
            <div className="modal-header" style={{
              borderBottom: '2px solid #f0f0f0',
              paddingBottom: '16px',
              marginBottom: '20px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '20px 20px 0 20px'
            }}>
              <div>
                <h3 style={{ 
                  margin: 0, 
                  color: '#333',
                  fontSize: '22px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px'
                }}>
                  <span style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '36px',
                    height: '36px',
                    background: 'linear-gradient(135deg, #667eea, #764ba2)',
                    borderRadius: '10px',
                    color: 'white',
                    fontSize: '18px'
                  }}>📋</span>
                  Review Correction Request
                </h3>
                <p style={{ margin: '5px 0 0 46px', fontSize: '13px', color: '#888' }}>
                  Review and process employee attendance correction request
                </p>
              </div>
              <button 
                onClick={closeModal}
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '20px',
                  background: '#f5f5f5',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'all 0.3s'
                }}
                onMouseEnter={(e) => e.target.style.background = '#e0e0e0'}
                onMouseLeave={(e) => e.target.style.background = '#f5f5f5'}
              >
                &times;
              </button>
            </div>
            
            <div style={{ padding: '0 20px' }}>
              {/* Request Information Section */}
              <div style={{ 
                marginBottom: '25px',
                background: 'linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%)',
                borderRadius: '12px',
                padding: '20px',
                border: '1px solid #e0e0e0'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  marginBottom: '15px',
                  paddingBottom: '10px',
                  borderBottom: '2px solid #e0e0e0'
                }}>
                  <FiFileText size={18} color="#667eea" />
                  <h4 style={{ margin: 0, color: '#333', fontSize: '16px' }}>Request Information</h4>
                </div>
                
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(2, 1fr)',
                  gap: '15px'
                }}>
                  <div>
                    <label style={{ fontSize: '11px', color: '#999', textTransform: 'uppercase', display: 'block', marginBottom: '5px' }}>
                      👤 Employee
                    </label>
                    <div style={{ padding: '10px 12px', background: 'white', borderRadius: '8px', border: '1px solid #e0e0e0', fontWeight: '500', color: '#333', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <FiUser size={14} color="#667eea" />
                      {selectedRequest.employee_name}
                    </div>
                  </div>
                  
                  <div>
                    <label style={{ fontSize: '11px', color: '#999', textTransform: 'uppercase', display: 'block', marginBottom: '5px' }}>
                      🏢 Department
                    </label>
                    <div style={{ padding: '10px 12px', background: 'white', borderRadius: '8px', border: '1px solid #e0e0e0', color: '#555', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <FiBriefcase size={14} color="#999" />
                      {selectedRequest.department || 'N/A'}
                    </div>
                  </div>
                  
                  <div>
                    <label style={{ fontSize: '11px', color: '#999', textTransform: 'uppercase', display: 'block', marginBottom: '5px' }}>
                      📅 Request Date
                    </label>
                    <div style={{ padding: '10px 12px', background: 'white', borderRadius: '8px', border: '1px solid #e0e0e0', color: '#555', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <FiCalendar size={14} color="#999" />
                      {new Date(selectedRequest.request_date).toLocaleDateString()}
                    </div>
                  </div>
                  
                  <div>
                    <label style={{ fontSize: '11px', color: '#999', textTransform: 'uppercase', display: 'block', marginBottom: '5px' }}>
                      📋 Request Type
                    </label>
                    <div style={{ padding: '10px 12px', background: 'white', borderRadius: '8px', border: `2px solid ${getStatusColor(selectedRequest.request_type)}20`, color: getStatusColor(selectedRequest.request_type), fontWeight: '500', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '18px' }}>{getRequestTypeIcon(selectedRequest.request_type)}</span>
                      {getRequestTypeLabel(selectedRequest.request_type)}
                    </div>
                  </div>
                  
                  <div style={{ gridColumn: 'span 2' }}>
                    <label style={{ fontSize: '11px', color: '#999', textTransform: 'uppercase', display: 'block', marginBottom: '5px' }}>
                      🕐 Requested Corrected Time
                    </label>
                    <div style={{ padding: '10px 12px', background: '#e8f5e9', borderRadius: '8px', border: '1px solid #c8e6c9', color: '#2e7d32', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <FiClock size={14} />
                      {new Date(selectedRequest.corrected_time).toLocaleString()}
                    </div>
                  </div>
                  
                  <div style={{ gridColumn: 'span 2' }}>
                    <label style={{ fontSize: '11px', color: '#999', textTransform: 'uppercase', display: 'block', marginBottom: '5px' }}>
                      💬 Reason for Request
                    </label>
                    <div style={{ padding: '12px', background: '#fff3cd', borderRadius: '8px', borderLeft: '4px solid #ffc107', color: '#856404', fontSize: '13px', lineHeight: '1.5' }}>
                      {selectedRequest.reason}
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Remarks Section */}
              <div className="form-group" style={{ marginBottom: '25px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px', fontWeight: '600', color: '#333', fontSize: '14px' }}>
                  <FiMessageCircle size={16} color="#667eea" />
                  Review Remarks
                  <span style={{ marginLeft: 'auto', fontSize: '11px', color: '#999', fontWeight: 'normal' }}>
                    {remarks.length}/500 characters
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
                    width: '100%',
                    padding: '14px 16px',
                    border: '2px solid #e0e0e0',
                    borderRadius: '12px',
                    fontSize: '14px',
                    fontFamily: 'inherit',
                    resize: 'vertical',
                    transition: 'all 0.3s ease',
                    backgroundColor: '#fff',
                    lineHeight: '1.5'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#667eea';
                    e.target.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#e0e0e0';
                    e.target.style.boxShadow = 'none';
                  }}
                />
              </div>
            </div>
            
            {/* Action Buttons */}
            <div style={{ 
              display: 'flex', 
              gap: '12px', 
              justifyContent: 'flex-end',
              marginTop: '10px',
              padding: '15px 20px 20px 20px',
              borderTop: '2px solid #f0f0f0',
              background: '#fafafa',
              borderRadius: '0 0 16px 16px'
            }}>
              <button
                onClick={() => handleReview(selectedRequest.id, 'rejected')}
                style={{
                  padding: '12px 28px',
                  borderRadius: '10px',
                  fontSize: '14px',
                  fontWeight: '600',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  background: '#dc3545',
                  color: 'white',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = '#c82333';
                  e.target.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = '#dc3545';
                  e.target.style.transform = 'translateY(0)';
                }}
              >
                <FiXCircle size={16} />
                Reject Request
              </button>
              
              <button
                onClick={() => handleReview(selectedRequest.id, 'approved')}
                style={{
                  padding: '12px 28px',
                  borderRadius: '10px',
                  fontSize: '14px',
                  fontWeight: '600',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  background: 'linear-gradient(135deg, #28a745, #20c997)',
                  color: 'white',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = '0 4px 12px rgba(40, 167, 69, 0.3)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = 'none';
                }}
              >
                <FiCheckCircle size={16} />
                Approve Request
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PendingRequests;