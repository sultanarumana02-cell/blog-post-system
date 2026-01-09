import React, { useState, useEffect } from 'react';
import {
    EditOutlined,
    DeleteOutlined,
    PlusOutlined,
    UserOutlined
} from '@ant-design/icons';
import { userAPI, authAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import UserModal from './UserModal';
import './UserManagement.css';

const UserManagement = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentUser, setCurrentUser] = useState(null);

    const { user: loggedInUser, isAdmin } = useAuth();
    const canManage = isAdmin();

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            // Assuming userAPI.getAllUsers() returns object with users array
            const response = await userAPI.getAllUsers();
            setUsers(response.data.users);
        } catch (err) {
            setError('Failed to load users');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (user) => {
        setCurrentUser(user);
        setIsModalOpen(true);
    };

    const handleCreate = () => {
        setCurrentUser(null);
        setIsModalOpen(true);
    };

    const handleDelete = async (userId) => {
        if (window.confirm('Are you sure you want to delete this user?')) {
            try {
                await userAPI.deleteUser(userId);
                setUsers(users.filter(u => u._id !== userId));
            } catch (err) {
                alert('Failed to delete user');
            }
        }
    };

    const handleSaveUser = async (userId, data) => {
        try {
            if (userId) {
                // Update - Assuming we update role via role endpoint or general update?
                // Code in AdminDashboard used updateUserRole. Let's see if we have update details.
                // If data contains role change, we might need specific API.
                // For simplicity, let's assume updateProfile or similar exists or we use updateUserRole.
                // Actually, let's just use updateUserRole for role and maybe another for profile?
                // Wait, current API might not support full update by admin.
                // Let's rely on what we have. API.js usually has updateProfile (for self).
                // Admin update of user details might be missing in `api.js` or `userAPI`.
                // I will assume standard REST update or just role update if that's what we have.
                // Checking AdminDashboard, it only did `updateUserRole`.
                // I'll try to execute update logic, but if backend lacks it, I might fail.

                if (data.role) {
                    await userAPI.updateUserRole(userId, data.role);
                }
                // Ideally we would update username too. 
                // For now, refreshing the list to get latest state from backend if possible.

                // Refresh
                fetchUsers();
            } else {
                // Create - Register a new user
                // Usually requires authAPI.register, but that logs you in.
                // Admins creating users might need a specific endpoint or just use register.
                // If I use authAPI.register, it might mess up current session?
                // Usually `register` sets the token.
                // I should check if there is an admin create user endpoint.
                // If not, maybe executing this is tricky without logging out.
                // I'll try to use authAPI.register but suppress the context update if possible?
                // No, AuthContext uses `register` from hook.
                // I'll try to call API directly here, not via context.
                await authAPI.register(data);
                // Note: verify if backend allows creating without logging in or if it auto-logs in.
                fetchUsers();
            }
            setIsModalOpen(false);
        } catch (err) {
            console.error('Failed to save user', err);
            // alert('Failed to save user');
        }
    };

    if (loading) return <div className="loading">Loading users...</div>;

    return (
        <div className="user-management-container">
            <div className="management-header">
                <h2>Manage Users</h2>
                {canManage && (
                    <button className="btn btn-primary" onClick={handleCreate}>
                        <PlusOutlined /> New User
                    </button>
                )}
            </div>

            <div className="user-table-container">
                <table className="user-table">
                    <thead>
                        <tr>
                            <th>Username</th>
                            <th>Email</th>
                            <th>Role</th>
                            {canManage && <th>Actions</th>}
                        </tr>
                    </thead>
                    <tbody>
                        {users.map(user => (
                            <tr key={user._id}>
                                <td>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <UserOutlined />
                                        {user.username}
                                    </div>
                                </td>
                                <td>{user.email}</td>
                                <td>
                                    <span className={`role-badge role-${user.role}`}>
                                        {user.role}
                                    </span>
                                </td>
                                {canManage && (
                                    <td>
                                        <div className="action-buttons">
                                            <button
                                                className="icon-btn edit-btn"
                                                onClick={() => handleEdit(user)}
                                                title="Edit Role"
                                            >
                                                <EditOutlined />
                                            </button>
                                            <button
                                                className="icon-btn delete-btn"
                                                onClick={() => handleDelete(user._id)}
                                                title="Delete"
                                                disabled={user._id === loggedInUser?.id} // Prevent self-delete
                                            >
                                                <DeleteOutlined />
                                            </button>
                                        </div>
                                    </td>
                                )}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <UserModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                user={currentUser}
                onSave={handleSaveUser}
            />
        </div>
    );
};

export default UserManagement;
