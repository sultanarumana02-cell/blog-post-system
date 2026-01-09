import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
    EditOutlined,
    DeleteOutlined,
    PlusOutlined
} from '@ant-design/icons';
import { postAPI } from '../../services/api';
import PostModal from './PostModal';
import { useNavigate } from 'react-router-dom';
import './PostManagement.css';

const PostManagement = () => {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentPost, setCurrentPost] = useState(null);
    const navigate = useNavigate();

    // Get user and role from auth context
    const { user, isAdmin } = useAuth();

    useEffect(() => {
        if (user) {
            fetchPosts();
        }
    }, [user]);

    const fetchPosts = async () => {
        try {
            setLoading(true);
            const response = await postAPI.getAllPosts(1, 100);

            if (isAdmin()) {
                setPosts(response.data.posts);
            } else {
                // Filter posts for non-admins (show only their own)
                // Checking both user.id and user._id to handle potential API inconsistencies
                const userId = user.id || user._id;
                const userPosts = response.data.posts.filter(
                    post => post.author._id === userId || post.author.id === userId
                );
                setPosts(userPosts);
            }
        } catch (err) {
            setError('Failed to load posts');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (post) => {
        setCurrentPost(post);
        setIsModalOpen(true);
    };

    const handleCreate = () => {
        setCurrentPost(null);
        setIsModalOpen(true);
    };

    const handleDelete = async (postId) => {
        if (window.confirm('Are you sure you want to delete this post?')) {
            try {
                await postAPI.deletePost(postId);
                setPosts(posts.filter(p => p._id !== postId));
            } catch (err) {
                alert('Failed to delete post');
            }
        }
    };

    const handleSavePost = async (postId, data) => {
        try {
            if (postId) {
                // Update
                const response = await postAPI.updatePost(postId, data);
                setPosts(posts.map(p => p._id === postId ? response.data.post : p));
            } else {
                // Create
                const response = await postAPI.createPost(data);
                // Refresh list to be safe, or prepend
                // response.data.post usually contains the new post
                setPosts([response.data.post, ...posts]);
            }
            setIsModalOpen(false);
        } catch (err) {
            console.error('Failed to save post', err);
            // alert('Failed to save post');
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (loading) return <div className="loading">Loading posts...</div>;

    return (
        <div className="post-management-container">
            <div className="management-header">
                <h2>Manage Posts</h2>
                <button className="btn btn-primary" onClick={handleCreate}>
                    <PlusOutlined /> New Post
                </button>
            </div>

            <div className="post-table-container">
                <table className="post-table">
                    <thead>
                        <tr>
                            <th className="col-title">Title</th>
                            <th className="col-content">Content Preview</th>
                            <th className="col-time">Time</th>
                            <th className="col-action">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {posts.map(post => (
                            <tr key={post._id}>
                                <td className="col-title">{post.title}</td>
                                <td className="col-content">
                                    <div className="content-preview">{post.content}</div>
                                </td>
                                <td className="col-time">{formatDate(post.createdAt)}</td>
                                <td className="col-action">
                                    <div className="action-buttons">
                                        <button
                                            className="icon-btn edit-btn"
                                            onClick={() => handleEdit(post)}
                                            title="Edit"
                                        >
                                            <EditOutlined />
                                        </button>
                                        <button
                                            className="icon-btn delete-btn"
                                            onClick={() => handleDelete(post._id)}
                                            title="Delete"
                                        >
                                            <DeleteOutlined />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <PostModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                post={currentPost}
                onSave={handleSavePost}
            />
        </div>
    );
};

export default PostManagement;
