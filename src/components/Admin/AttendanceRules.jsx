import React, { useState, useEffect } from 'react';
import adminService from '../../services/adminService';
import toast from 'react-hot-toast';

const AttendanceRules = () => {
  const [rules, setRules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingRule, setEditingRule] = useState(null);
  const [formData, setFormData] = useState({
    rule_name: '',
    rule_type: 'work_hours',
    rule_value: { start: "09:00", end: "18:00", min_hours: 8 }
  });

  useEffect(() => {
    fetchRules();
  }, []);

  const fetchRules = async () => {
    try {
      const response = await adminService.getRules();
      // Ensure rule_value is properly parsed
      const rulesData = response.data.map(rule => ({
        ...rule,
        rule_value: typeof rule.rule_value === 'string' 
          ? JSON.parse(rule.rule_value) 
          : rule.rule_value
      }));
      setRules(rulesData);
    } catch (error) {
      console.error('Error fetching rules:', error);
      toast.error('Failed to fetch rules');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Convert rule_value to string for API
      const submitData = {
        ...formData,
        rule_value: JSON.stringify(formData.rule_value)
      };
      await adminService.createRule(submitData);
      toast.success('Rule created successfully');
      setShowModal(false);
      fetchRules();
      resetForm();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create rule');
    }
  };

  const handleEdit = (rule) => {
    setEditingRule(rule);
    setFormData({
      rule_name: rule.rule_name,
      rule_type: rule.rule_type,
      rule_value: typeof rule.rule_value === 'string' 
        ? JSON.parse(rule.rule_value) 
        : rule.rule_value
    });
    setShowEditModal(true);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const updateData = {
        rule_name: formData.rule_name,
        rule_value: JSON.stringify(formData.rule_value)
      };
      await adminService.updateRule(editingRule.id, updateData);
      toast.success('Rule updated successfully');
      setShowEditModal(false);
      setEditingRule(null);
      fetchRules();
      resetForm();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update rule');
    }
  };

  const handleDelete = async (ruleId, ruleName) => {
    if (window.confirm(`Are you sure you want to delete rule "${ruleName}"?`)) {
      try {
        await adminService.deleteRule(ruleId);
        toast.success('Rule deleted successfully');
        fetchRules();
      } catch (error) {
        toast.error(error.response?.data?.message || 'Failed to delete rule');
      }
    }
  };

  const handleToggleStatus = async (ruleId, currentStatus) => {
    try {
      await adminService.updateRule(ruleId, { is_active: !currentStatus });
      toast.success(`Rule ${!currentStatus ? 'activated' : 'deactivated'} successfully`);
      fetchRules();
    } catch (error) {
      toast.error('Failed to update rule status');
    }
  };

  const resetForm = () => {
    setFormData({
      rule_name: '',
      rule_type: 'work_hours',
      rule_value: { start: "09:00", end: "18:00", min_hours: 8 }
    });
  };

  const getRuleTypeLabel = (type) => {
    const types = {
      work_hours: 'Work Hours',
      late_threshold: 'Late Threshold',
      overtime: 'Overtime'
    };
    return types[type] || type;
  };

  const getRuleValueDisplay = (rule) => {
    try {
      const value = typeof rule.rule_value === 'string' 
        ? JSON.parse(rule.rule_value) 
        : rule.rule_value;
      
      switch (rule.rule_type) {
        case 'work_hours':
          return `${value.start} - ${value.end} (Min: ${value.min_hours} hrs)`;
        case 'late_threshold':
          return `${value.minutes} minutes (Grace: ${value.grace_period} min)`;
        case 'overtime':
          return `${value.multiplier}x multiplier (Min: ${value.min_overtime} min)`;
        default:
          return JSON.stringify(value);
      }
    } catch (error) {
      return 'Invalid format';
    }
  };

  const handleRuleTypeChange = (type) => {
    let defaultValue;
    switch (type) {
      case 'work_hours':
        defaultValue = { start: "09:00", end: "18:00", min_hours: 8 };
        break;
      case 'late_threshold':
        defaultValue = { minutes: 15, grace_period: 5 };
        break;
      case 'overtime':
        defaultValue = { multiplier: 1.5, min_overtime: 30 };
        break;
      default:
        defaultValue = {};
    }
    setFormData({ ...formData, rule_type: type, rule_value: defaultValue });
  };

  const updateWorkHoursValue = (field, value) => {
    setFormData({
      ...formData,
      rule_value: { ...formData.rule_value, [field]: value }
    });
  };

  return (
    <div>
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h3 className="card-title" style={{ marginBottom: 0 }}>Attendance Rules</h3>
          <button className="btn-primary" onClick={() => setShowModal(true)}>
            + Add New Rule
          </button>
        </div>
        
        {loading ? (
          <div className="spinner"></div>
        ) : (
          <div className="table-container">
            <table style={{ width: '100%' }}>
              <thead>
                <tr>
                  <th>Rule Name</th>
                  <th>Rule Type</th>
                  <th>Rule Value</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {rules.length === 0 ? (
                  <tr>
                    <td colSpan="5" style={{ textAlign: 'center' }}>No rules found</td>
                  </tr>
                ) : (
                  rules.map((rule) => (
                    <tr key={rule.id}>
                      <td>{rule.rule_name}</td>
                      <td>{getRuleTypeLabel(rule.rule_type)}</td>
                      <td>{getRuleValueDisplay(rule)}</td>
                      <td>
                        <button
                          onClick={() => handleToggleStatus(rule.id, rule.is_active)}
                          style={{
                            padding: '4px 12px',
                            borderRadius: '20px',
                            border: 'none',
                            cursor: 'pointer',
                            background: rule.is_active ? '#28a745' : '#dc3545',
                            color: 'white',
                            fontSize: '12px'
                          }}
                        >
                          {rule.is_active ? 'Active' : 'Inactive'}
                        </button>
                      </td>
                      <td>
                        <button
                          className="btn-warning"
                          onClick={() => handleEdit(rule)}
                          style={{ marginRight: '5px', padding: '5px 12px' }}
                        >
                          ✏️ Edit
                        </button>
                        <button
                          className="btn-danger"
                          onClick={() => handleDelete(rule.id, rule.rule_name)}
                          style={{ padding: '5px 12px' }}
                        >
                          🗑️ Delete
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
      
      {/* Add Rule Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Add New Rule</h3>
              <button className="close-btn" onClick={() => setShowModal(false)}>&times;</button>
            </div>
            
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Rule Name *</label>
                <input
                  type="text"
                  value={formData.rule_name}
                  onChange={(e) => setFormData({ ...formData, rule_name: e.target.value })}
                  required
                  placeholder="e.g., Standard Work Hours"
                />
              </div>
              
              <div className="form-group">
                <label>Rule Type *</label>
                <select
                  value={formData.rule_type}
                  onChange={(e) => handleRuleTypeChange(e.target.value)}
                >
                  <option value="work_hours">Work Hours</option>
                  <option value="late_threshold">Late Threshold</option>
                  <option value="overtime">Overtime</option>
                </select>
              </div>
              
              {formData.rule_type === 'work_hours' && (
                <>
                  <div className="form-group">
                    <label>Start Time</label>
                    <input
                      type="time"
                      value={formData.rule_value.start || "09:00"}
                      onChange={(e) => updateWorkHoursValue('start', e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label>End Time</label>
                    <input
                      type="time"
                      value={formData.rule_value.end || "18:00"}
                      onChange={(e) => updateWorkHoursValue('end', e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label>Minimum Hours</label>
                    <input
                      type="number"
                      step="0.5"
                      value={formData.rule_value.min_hours || 8}
                      onChange={(e) => updateWorkHoursValue('min_hours', parseFloat(e.target.value))}
                    />
                  </div>
                </>
              )}
              
              {formData.rule_type === 'late_threshold' && (
                <>
                  <div className="form-group">
                    <label>Late Minutes Threshold</label>
                    <input
                      type="number"
                      value={formData.rule_value.minutes || 15}
                      onChange={(e) => updateWorkHoursValue('minutes', parseInt(e.target.value))}
                    />
                    <small>Minutes after which employee is marked late</small>
                  </div>
                  <div className="form-group">
                    <label>Grace Period (minutes)</label>
                    <input
                      type="number"
                      value={formData.rule_value.grace_period || 5}
                      onChange={(e) => updateWorkHoursValue('grace_period', parseInt(e.target.value))}
                    />
                    <small>Minutes allowed before marking late</small>
                  </div>
                </>
              )}
              
              {formData.rule_type === 'overtime' && (
                <>
                  <div className="form-group">
                    <label>Overtime Multiplier</label>
                    <input
                      type="number"
                      step="0.1"
                      value={formData.rule_value.multiplier || 1.5}
                      onChange={(e) => updateWorkHoursValue('multiplier', parseFloat(e.target.value))}
                    />
                  </div>
                  <div className="form-group">
                    <label>Minimum Overtime (minutes)</label>
                    <input
                      type="number"
                      value={formData.rule_value.min_overtime || 30}
                      onChange={(e) => updateWorkHoursValue('min_overtime', parseInt(e.target.value))}
                    />
                    <small>Minimum minutes to count as overtime</small>
                  </div>
                </>
              )}
              
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '20px' }}>
                <button type="button" className="btn-danger" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Create Rule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Rule Modal */}
      {showEditModal && editingRule && (
        <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Edit Rule: {editingRule.rule_name}</h3>
              <button className="close-btn" onClick={() => setShowEditModal(false)}>&times;</button>
            </div>
            
            <form onSubmit={handleUpdate}>
              <div className="form-group">
                <label>Rule Name *</label>
                <input
                  type="text"
                  value={formData.rule_name}
                  onChange={(e) => setFormData({ ...formData, rule_name: e.target.value })}
                  required
                />
              </div>
              
              {formData.rule_type === 'work_hours' && (
                <>
                  <div className="form-group">
                    <label>Start Time</label>
                    <input
                      type="time"
                      value={formData.rule_value.start || "09:00"}
                      onChange={(e) => updateWorkHoursValue('start', e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label>End Time</label>
                    <input
                      type="time"
                      value={formData.rule_value.end || "18:00"}
                      onChange={(e) => updateWorkHoursValue('end', e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label>Minimum Hours</label>
                    <input
                      type="number"
                      step="0.5"
                      value={formData.rule_value.min_hours || 8}
                      onChange={(e) => updateWorkHoursValue('min_hours', parseFloat(e.target.value))}
                    />
                  </div>
                </>
              )}
              
              {formData.rule_type === 'late_threshold' && (
                <>
                  <div className="form-group">
                    <label>Late Minutes Threshold</label>
                    <input
                      type="number"
                      value={formData.rule_value.minutes || 15}
                      onChange={(e) => updateWorkHoursValue('minutes', parseInt(e.target.value))}
                    />
                  </div>
                  <div className="form-group">
                    <label>Grace Period (minutes)</label>
                    <input
                      type="number"
                      value={formData.rule_value.grace_period || 5}
                      onChange={(e) => updateWorkHoursValue('grace_period', parseInt(e.target.value))}
                    />
                  </div>
                </>
              )}
              
              {formData.rule_type === 'overtime' && (
                <>
                  <div className="form-group">
                    <label>Overtime Multiplier</label>
                    <input
                      type="number"
                      step="0.1"
                      value={formData.rule_value.multiplier || 1.5}
                      onChange={(e) => updateWorkHoursValue('multiplier', parseFloat(e.target.value))}
                    />
                  </div>
                  <div className="form-group">
                    <label>Minimum Overtime (minutes)</label>
                    <input
                      type="number"
                      value={formData.rule_value.min_overtime || 30}
                      onChange={(e) => updateWorkHoursValue('min_overtime', parseInt(e.target.value))}
                    />
                  </div>
                </>
              )}
              
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '20px' }}>
                <button type="button" className="btn-danger" onClick={() => setShowEditModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Update Rule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AttendanceRules;