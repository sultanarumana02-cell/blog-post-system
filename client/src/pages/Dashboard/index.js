import React, { useState, useEffect } from 'react';
import { adminAPI } from '../../services/api';
import './Dashboard.css';

const AdminDashboard = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            setLoading(true);
            const response = await adminAPI.getStats();
            setStats(response.data);
            setError('');
        } catch (err) {
            setError('Failed to load dashboard stats');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <div className="loading">Loading dashboard...</div>;
    }

    return (
        <div className="admin-container">
            <main className="admin-main">
                <div className="admin-content">
                    {error && <div className="error">{error}</div>}

                    <div className="dashboard-view">
                        <h2>Dashboard Overview</h2>
                        {stats && (
                            <div className="stats-grid">
                                <div className="stat-card">
                                    <div className="stat-value">{stats.users.toLocaleString()}</div>
                                    <div className="stat-label">Total Users</div>
                                </div>
                                <div className="stat-card">
                                    <div className="stat-value">{stats.posts.toLocaleString()}</div>
                                    <div className="stat-label">Total Posts</div>
                                </div>
                                <div className="stat-card">
                                    <div className="stat-value">{stats.comments.toLocaleString()}</div>
                                    <div className="stat-label">Total Comments</div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default AdminDashboard;
