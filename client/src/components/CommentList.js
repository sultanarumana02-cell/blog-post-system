import React, { useState } from 'react';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { commentAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import './CommentList.css';

const CommentList = ({ comments, onCommentDeleted, postAuthorId }) => {
  const { user, isAdmin } = useAuth();
  const [editingId, setEditingId] = useState(null);
  const [editContent, setEditContent] = useState('');
  const [localComments, setLocalComments] = useState(comments);

  // Update local comments when props change
  React.useEffect(() => {
    setLocalComments(comments);
  }, [comments]);

  const formatDate = (dateString) => {
    const options = {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const handleDelete = async (commentId) => {
    if (window.confirm('Are you sure you want to delete this comment?')) {
      try {
        await commentAPI.deleteComment(commentId);
        onCommentDeleted(commentId);
      } catch (err) {
        alert('Failed to delete comment');
        console.error(err);
      }
    }
  };

  const handleEdit = (comment) => {
    setEditingId(comment._id);
    setEditContent(comment.content);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditContent('');
  };

  const handleSaveEdit = async (commentId) => {
    try {
      const response = await commentAPI.updateComment(commentId, { content: editContent });
      // Update local state
      setLocalComments(localComments.map(c =>
        c._id === commentId ? response.data.comment : c
      ));
      setEditingId(null);
      setEditContent('');
    } catch (err) {
      alert('Failed to update comment');
      console.error(err);
    }
  };

  const canEditComment = (comment) => {
    if (!user) return false;
    // Only comment author can edit their own comment
    return user.id === comment.author._id;
  };

  const canDeleteComment = (comment) => {
    if (!user) return false;

    // Comment author can delete
    if (user.id === comment.author._id) return true;

    // Post author can delete comments on their post
    if (user.id === postAuthorId) return true;

    // Admin can delete any comment
    if (isAdmin()) return true;

    return false;
  };

  if (localComments.length === 0) {
    return <p className="no-comments">No comments yet. Be the first to comment!</p>;
  }

  return (
    <div className="comment-list">
      {localComments.map((comment) => (
        <div key={comment._id} className="comment-item">
          <div className="comment-header">
            <div className="comment-info">
              <span className="comment-author">{comment.author?.username || 'Unknown'}</span>
              <span className="comment-date">{formatDate(comment.createdAt)}</span>
            </div>
            {(canEditComment(comment) || canDeleteComment(comment)) && (
              <div className="comment-actions">
                {canEditComment(comment) && editingId !== comment._id && (
                  <EditOutlined
                    className="action-icon edit-icon"
                    onClick={() => handleEdit(comment)}
                    title="Edit comment"
                  />
                )}
                {canDeleteComment(comment) && (
                  <DeleteOutlined
                    className="action-icon delete-icon"
                    onClick={() => handleDelete(comment._id)}
                    title="Delete comment"
                  />
                )}
              </div>
            )}
          </div>

          {editingId === comment._id ? (
            <div className="comment-edit-form">
              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="edit-textarea"
                rows="3"
              />
              <div className="edit-actions">
                <button
                  onClick={() => handleSaveEdit(comment._id)}
                  className="btn btn-primary btn-small"
                >
                  Save
                </button>
                <button
                  onClick={handleCancelEdit}
                  className="btn btn-secondary btn-small"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <p className="comment-content">{comment.content}</p>
          )}
        </div>
      ))}
    </div>
  );
};

export default CommentList;
