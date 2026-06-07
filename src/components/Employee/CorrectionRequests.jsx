import React, { useState, useEffect } from 'react';
import correctionService from '../../services/correctionService';
import toast from 'react-hot-toast';

const CorrectionRequests = () => {
  const [requests, setRequests] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    request_type: 'missed_out_time',
    request_date: '',
    corrected_time: '',
    reason: ''
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const response = await correctionService.getMyRequests();
      setRequests(response.data);
    } catch (error) {
      console.error('Error fetching requests:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await correctionService.createRequest(formData);
      toast.success('Correction request submitted successfully');
      setShowModal(false);
      fetchRequests();
      setFormData({
        request_type: 'missed_out_time',
        request_date: '',
        corrected_time: '',
        reason: ''
      });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to submit request');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      pending: 'status-pending',
      approved: 'status-approved',
      rejected: 'status-rejected'
    };
    return <span className={`status-badge ${statusMap[status]}`}>{status}</span>;
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

  return (
    <div>
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h3 className="card-title" style={{ marginBottom: 0 }}>My Correction Requests</h3>
          <button className="btn-primary" onClick={() => setShowModal(true)}>
            New Request
          </button>
        </div>

        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Type</th>
                <th>Corrected Time</th>
                <th>Reason</th>
                <th>Status</th>
                <th>Remarks</th>
              </tr>
            </thead>
            <tbody>
              {requests.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center' }}>No correction requests found</td>
                </tr>
              ) : (
                requests.map((request) => (
                  <tr key={request.id}>
                    <td>{new Date(request.request_date).toLocaleDateString()}</td>
                    <td>{getRequestTypeLabel(request.request_type)}</td>
                    <td>{request.corrected_time ? new Date(request.corrected_time).toLocaleString() : '-'}</td>
                    <td>{request.reason}</td>
                    <td>{getStatusBadge(request.status)}</td>
                    <td>{request.remarks || '-'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>New Correction Request</h3>
              <button className="close-btn" onClick={() => setShowModal(false)}>&times;</button>
            </div>
            
            <form onSubmit={handleSubmit}>
              <div className="form-group">
  <label style={{ 
    display: 'flex', 
    alignItems: 'center', 
    gap: '8px', 
    marginBottom: '12px',
    fontWeight: '600',
    color: '#555',
    fontSize: '14px'
  }}>
    <span>📋</span> Request Type
  </label>
  <div style={{
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '12px'
  }}>
    {[
      { value: 'missed_in_time', label: 'Missed Clock In', icon: '⏰', color: '#ffc107' },
      { value: 'missed_out_time', label: 'Missed Clock Out', icon: '⏰', color: '#ffc107' },
      { value: 'wrong_in_time', label: 'Wrong Clock In', icon: '✏️', color: '#17a2b8' },
      { value: 'wrong_out_time', label: 'Wrong Clock Out', icon: '✏️', color: '#17a2b8' }
    ].map(option => (
      <label
        key={option.value}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          padding: '12px 16px',
          border: formData.request_type === option.value ? `2px solid ${option.color}` : '2px solid #e0e0e0',
          borderRadius: '10px',
          cursor: 'pointer',
          background: formData.request_type === option.value ? `${option.color}10` : 'white',
          transition: 'all 0.3s ease',
          boxShadow: formData.request_type === option.value ? `0 0 0 3px ${option.color}20` : 'none'
        }}
      >
        <input
          type="radio"
          name="request_type"
          value={option.value}
          checked={formData.request_type === option.value}
          onChange={(e) => setFormData({ ...formData, request_type: e.target.value })}
          style={{
            width: '18px',
            height: '18px',
            margin: 0,
            cursor: 'pointer',
            accentColor: option.color
          }}
        />
        <span style={{ fontSize: '20px' }}>{option.icon}</span>
        <span style={{ 
          fontSize: '13px', 
          fontWeight: formData.request_type === option.value ? '600' : '400',
          color: formData.request_type === option.value ? option.color : '#555'
        }}>
          {option.label}
        </span>
      </label>
    ))}
  </div>
</div>
              
              <div className="form-group">
                <label>Request Date</label>
                <input
                  type="date"
                  value={formData.request_date}
                  onChange={(e) => setFormData({ ...formData, request_date: e.target.value })}
                  required
                />
              </div>
              
              <div className="form-group">
                <label>Corrected Time</label>
                <input
                  type="datetime-local"
                  value={formData.corrected_time}
                  onChange={(e) => setFormData({ ...formData, corrected_time: e.target.value })}
                  required
                />
              </div>
              
              <div className="form-group" style={{ position: 'relative', marginTop: '10px' }}>
  <textarea
    value={formData.reason}
    onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
    rows="4"
    required
    placeholder=" "
    style={{
      width: '100%',
      padding: '20px 16px 8px 16px',
      border: '2px solid #e0e0e0',
      borderRadius: '12px',
      fontSize: '14px',
      fontFamily: 'inherit',
      resize: 'vertical',
      transition: 'all 0.3s ease',
      backgroundColor: 'white',
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
  <label style={{
    position: 'absolute',
    left: '16px',
    top: formData.reason ? '8px' : '50%',
    transform: formData.reason ? 'translateY(0)' : 'translateY(-50%)',
    backgroundColor: 'white',
    padding: '0 4px',
    fontSize: formData.reason ? '11px' : '14px',
    color: formData.reason ? '#667eea' : '#999',
    transition: 'all 0.2s ease',
    pointerEvents: 'none'
  }}>
    💬 Reason for Correction
  </label>
</div>
              
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button type="button" className="btn-danger" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary" disabled={loading}>
                  {loading ? 'Submitting...' : 'Submit Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CorrectionRequests;