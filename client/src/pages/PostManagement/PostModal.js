import React, { useState, useEffect } from 'react';
import './PostManagement.css';

const PostModal = ({ isOpen, onClose, post, onSave }) => {
    const [formData, setFormData] = useState({
        title: '',
        content: ''
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (post) {
            setFormData({
                title: post.title || '',
                content: post.content || ''
            });
        } else {
            setFormData({
                title: '',
                content: ''
            });
        }
    }, [post, isOpen]);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        await onSave(post ? post._id : null, formData);
        setLoading(false);
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h3>{post ? 'Edit Post' : 'Create New Post'}</h3>
                    <button className="close-btn" onClick={onClose}>&times;</button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="modal-body">
                        <div className="form-group">
                            <label htmlFor="title">Title</label>
                            <input
                                type="text"
                                id="title"
                                name="title"
                                className="form-input"
                                value={formData.title}
                                onChange={handleChange}
                                required
                                placeholder="Enter post title"
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="content">Content</label>
                            <textarea
                                id="content"
                                name="content"
                                className="form-textarea"
                                value={formData.content}
                                onChange={handleChange}
                                required
                                placeholder="Write your post content..."
                            />
                        </div>
                    </div>

                    <div className="modal-footer">
                        <button type="button" className="btn btn-secondary" onClick={onClose}>
                            Cancel
                        </button>
                        <button type="submit" className="btn btn-primary" disabled={loading}>
                            {loading ? 'Saving...' : (post ? 'Save Changes' : 'Create Post')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default PostModal;
