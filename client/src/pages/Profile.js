import React from 'react';
import { useAuth } from '../context/AuthContext';
import './Profile.css';

const Profile = () => {
    const { user } = useAuth();

    if (!user) {
        return <div className="loading">Loading profile...</div>;
    }

    return (
        <div className="profile-container">
            <div className="profile-card">
                <div className="profile-avatar">
                    {user.username.charAt(0).toUpperCase()}
                </div>
                <h2>Profile</h2>
                <div className="profile-info">
                    <div className="profile-item">
                        <label>Username:</label>
                        <span>{user.username}</span>
                    </div>
                    <div className="profile-item">
                        <label>Email:</label>
                        <span>{user.email}</span>
                    </div>
                    <div className="profile-item">
                        <label>Role:</label>
                        <span className={`role-badge ${user.role}`}>
                            {user.role === 'admin' ? '👑 Admin' : '👤 User'}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;
