import React, { useState, useEffect } from 'react';
import adminService from '../../services/adminService';
import toast from 'react-hot-toast';

/* ─── Inject responsive styles once ─── */
const CSS = `
  .um-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    flex-wrap: wrap;
    gap: 10px;
  }

  .um-table-wrap {
    width: 100%;
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
  }

  .um-table {
    width: 100%;
    min-width: 900px;
    border-collapse: collapse;
  }

  .um-table th,
  .um-table td {
    padding: 12px 10px;
    text-align: left;
    vertical-align: middle;
    white-space: nowrap;
  }

  .um-table thead tr {
    background: #f8f9fa;
  }

  .um-table tbody tr {
    border-bottom: 1px solid #e0e0e0;
  }

  /* Role select inside table */
  .um-role-select {
    padding: 5px;
    border-radius: 5px;
    cursor: pointer;
    max-width: 110px;
    width: 100%;
  }

  /* Action button wrapper — always single row */
  .um-action-btns {
    display: flex;
    gap: 6px;
    align-items: center;
    flex-wrap: nowrap;
  }

  /* Text label inside action buttons — hidden on small screens */
  .um-btn-label {
    display: inline;
  }

  /* Modal footer */
  .um-modal-footer {
    display: flex;
    gap: 10px;
    justify-content: flex-end;
    margin-top: 20px;
    flex-wrap: wrap;
  }

  .um-modal-footer button {
    flex: 1 1 auto;
    min-width: 100px;
  }

  /* ── ≤ 768px: hide less-critical columns, icon-only buttons ── */
  @media (max-width: 768px) {
    .um-table {
      min-width: 620px;
    }

    /* Hide ID, Employee Code columns */
    .um-table th.col-id,
    .um-table td.col-id,
    .um-table th.col-empcode,
    .um-table td.col-empcode {
      display: none;
    }
  }

  /* ── ≤ 600px: icon-only action buttons ── */
  @media (max-width: 600px) {
    .um-table {
      min-width: 480px;
    }

    .um-btn-label {
      display: none;
    }

    .um-action-btns button {
      padding: 6px 8px !important;
      font-size: 16px;
      margin-right: 0 !important;
    }

    /* Also hide Department column */
    .um-table th.col-dept,
    .um-table td.col-dept {
      display: none;
    }
  }

  /* ── ≤ 420px: further reduce ── */
  @media (max-width: 420px) {
    .um-table {
      min-width: 360px;
    }

    /* Hide Full Name column */
    .um-table th.col-fullname,
    .um-table td.col-fullname {
      display: none;
    }
  }
`;

if (typeof document !== 'undefined' && !document.getElementById('um-responsive-css')) {
  const style = document.createElement('style');
  style.id = 'um-responsive-css';
  style.textContent = CSS;
  document.head.appendChild(style);
}

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    role_id: 3,
    full_name: '',
    department: '',
    employee_code: ''
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await adminService.getUsers();
      setUsers(response.data);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await adminService.createUser(formData);
      toast.success('User created successfully');
      setShowModal(false);
      fetchUsers();
      setFormData({
        username: '',
        email: '',
        password: '',
        role_id: 3,
        full_name: '',
        department: '',
        employee_code: ''
      });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create user');
    }
  };

  const handleEdit = (user) => {
    setEditingUser(user);
    setFormData({
      username: user.username,
      email: user.email,
      password: '',
      role_id: user.role_id,
      full_name: user.full_name || '',
      department: user.department || '',
      employee_code: user.employee_code || ''
    });
    setShowEditModal(true);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const updateData = {
        full_name: formData.full_name,
        department: formData.department,
        is_active: formData.is_active !== undefined ? formData.is_active : true
      };
      if (formData.password) {
        updateData.password = formData.password;
      }
      await adminService.updateUser(editingUser.id, updateData);
      toast.success('User updated successfully');
      setShowEditModal(false);
      setEditingUser(null);
      fetchUsers();
      setFormData({
        username: '',
        email: '',
        password: '',
        role_id: 3,
        full_name: '',
        department: '',
        employee_code: ''
      });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update user');
    }
  };

  const handleRoleChange = async (userId, roleId) => {
    try {
      await adminService.updateUserRole(userId, roleId);
      toast.success('Role updated successfully');
      fetchUsers();
    } catch (error) {
      toast.error('Failed to update role');
    }
  };

  const handleDelete = async (userId, userName) => {
    if (window.confirm(`Are you sure you want to delete user "${userName}"?`)) {
      try {
        await adminService.deleteUser(userId);
        toast.success('User deleted successfully');
        fetchUsers();
      } catch (error) {
        toast.error(error.response?.data?.message || 'Failed to delete user');
      }
    }
  };

  const handleToggleStatus = async (userId, currentStatus) => {
    try {
      await adminService.updateUser(userId, { is_active: !currentStatus });
      toast.success(`User ${!currentStatus ? 'activated' : 'deactivated'} successfully`);
      fetchUsers();
    } catch (error) {
      toast.error('Failed to update user status');
    }
  };

  return (
    <div>
      <div className="card">

        {/* ── Header ── */}
        <div className="um-header">
          <h3 className="card-title" style={{ marginBottom: 0 }}>User Management</h3>
          <button className="btn-primary" onClick={() => setShowModal(true)}>
            + Add New User
          </button>
        </div>

        {/* ── Table ── */}
        {loading ? (
          <div className="spinner"></div>
        ) : (
          <div className="um-table-wrap">
            <table className="um-table">
              <thead>
                <tr>
                  <th className="col-id">ID</th>
                  <th>Username</th>
                  <th>Email</th>
                  <th className="col-fullname">Full Name</th>
                  <th className="col-dept">Department</th>
                  <th className="col-empcode">Employee Code</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.length === 0 ? (
                  <tr>
                    <td colSpan="9" style={{ textAlign: 'center' }}>No users found</td>
                  </tr>
                ) : (
                  users.map((user) => (
                    <tr key={user.id}>
                      <td className="col-id">{user.id}</td>
                      <td>{user.username}</td>
                      <td>{user.email}</td>
                      <td className="col-fullname">{user.full_name || '-'}</td>
                      <td className="col-dept">{user.department || '-'}</td>
                      <td className="col-empcode">{user.employee_code || '-'}</td>
                      <td>
                        <select
                          className="um-role-select"
                          value={user.role_id}
                          onChange={(e) => handleRoleChange(user.id, parseInt(e.target.value))}
                        >
                          <option value={1}>Admin</option>
                          <option value={2}>HR</option>
                          <option value={3}>Employee</option>
                        </select>
                      </td>
                      <td>
                        <button
                          onClick={() => handleToggleStatus(user.id, user.is_active)}
                          style={{
                            padding: '4px 12px',
                            borderRadius: '20px',
                            border: 'none',
                            cursor: 'pointer',
                            background: user.is_active ? '#28a745' : '#dc3545',
                            color: 'white',
                            fontSize: '12px',
                            whiteSpace: 'nowrap'
                          }}
                        >
                          {user.is_active ? 'Active' : 'Inactive'}
                        </button>
                      </td>
                      <td>
                        {/* Always single row — icon-only on small, icon+label on large */}
                        <div className="um-action-btns">
                          <button
                            className="btn-warning"
                            onClick={() => handleEdit(user)}
                            style={{ padding: '5px 12px' }}
                            title="Edit"
                          >
                            ✏️ <span className="um-btn-label">Edit</span>
                          </button>
                          <button
                            className="btn-danger"
                            onClick={() => handleDelete(user.id, user.username)}
                            style={{ padding: '5px 12px' }}
                            title="Delete"
                          >
                            🗑️ <span className="um-btn-label">Delete</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Add User Modal ── */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Add New User</h3>
              <button className="close-btn" onClick={() => setShowModal(false)}>&times;</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Username *</label>
                <input type="text" value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  required />
              </div>
              <div className="form-group">
                <label>Email *</label>
                <input type="email" value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required />
              </div>
              <div className="form-group">
                <label>Password *</label>
                <input type="password" value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required />
              </div>
              <div className="form-group">
                <label>Full Name</label>
                <input type="text" value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Department</label>
                <input type="text" value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Employee Code</label>
                <input type="text" value={formData.employee_code}
                  onChange={(e) => setFormData({ ...formData, employee_code: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Role</label>
                <select value={formData.role_id}
                  onChange={(e) => setFormData({ ...formData, role_id: parseInt(e.target.value) })}>
                  <option value={3}>Employee</option>
                  <option value={2}>HR</option>
                  <option value={1}>Admin</option>
                </select>
              </div>
              <div className="um-modal-footer">
                <button type="button" className="btn-danger" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Create User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Edit User Modal ── */}
      {showEditModal && editingUser && (
        <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Edit User: {editingUser.username}</h3>
              <button className="close-btn" onClick={() => setShowEditModal(false)}>&times;</button>
            </div>
            <form onSubmit={handleUpdate}>
              <div className="form-group">
                <label>Username</label>
                <input type="text" value={formData.username} disabled
                  style={{ background: '#f0f0f0', cursor: 'not-allowed' }} />
                <small style={{ color: '#666' }}>Username cannot be changed</small>
              </div>
              <div className="form-group">
                <label>Email</label>
                <input type="email" value={formData.email} disabled
                  style={{ background: '#f0f0f0', cursor: 'not-allowed' }} />
                <small style={{ color: '#666' }}>Email cannot be changed</small>
              </div>
              <div className="form-group">
                <label>New Password (leave blank to keep current)</label>
                <input type="password" value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="Enter new password if you want to change" />
              </div>
              <div className="form-group">
                <label>Full Name</label>
                <input type="text" value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Department</label>
                <input type="text" value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Employee Code</label>
                <input type="text" value={formData.employee_code}
                  onChange={(e) => setFormData({ ...formData, employee_code: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Status</label>
                <select
                  value={formData.is_active !== undefined ? formData.is_active : true}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.value === 'true' })}>
                  <option value="true">Active</option>
                  <option value="false">Inactive</option>
                </select>
              </div>
              <div className="um-modal-footer">
                <button type="button" className="btn-danger" onClick={() => setShowEditModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Update User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;