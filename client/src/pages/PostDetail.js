import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { postAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import CommentList from '../components/CommentList';
import CommentForm from '../components/CommentForm';
import './PostDetail.css';

const PostDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();
  
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchPost();
  }, [id]);

  const fetchPost = async () => {
    try {
      setLoading(true);
      const response = await postAPI.getPostById(id);
      setPost(response.data.post);
      setComments(response.data.comments);
      setError('');
    } catch (err) {
      setError('Failed to load post');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this post?')) {
      try {
        await postAPI.deletePost(id);
        navigate('/');
      } catch (err) {
        setError('Failed to delete post');
        console.error(err);
      }
    }
  };

  const handleCommentAdded = (newComment) => {
    setComments([newComment, ...comments]);
  };

  const handleCommentDeleted = (commentId) => {
    setComments(comments.filter((c) => c._id !== commentId));
  };

  const formatDate = (dateString) => {
    const options = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  if (loading) {
    return <div className="loading">Loading post...</div>;
  }

  if (error || !post) {
    return <div className="error">{error || 'Post not found'}</div>;
  }

  const canEditDelete = user && (user.id === post.author._id || isAdmin());

  return (
    <div className="post-detail-container">
      <article className="post-detail">
        <header className="post-header">
          <h1>{post.title}</h1>
          <div className="post-meta">
            <span className="post-author">By {post.author.username}</span>
            <span className="post-date">{formatDate(post.createdAt)}</span>
          </div>
          {canEditDelete && (
            <div className="post-actions">
              <Link to={`/posts/edit/${post._id}`} className="btn btn-primary">
                Edit
              </Link>
              <button onClick={handleDelete} className="btn btn-danger">
                Delete
              </button>
            </div>
          )}
        </header>
        <div className="post-content">
          {post.content.split('\n').map((paragraph, index) => (
            <p key={index}>{paragraph}</p>
          ))}
        </div>
      </article>

      <section className="comments-section">
        <h2>Comments ({comments.length})</h2>
        {user ? (
          <CommentForm postId={id} onCommentAdded={handleCommentAdded} />
        ) : (
          <p className="login-prompt">
            Please <Link to="/login">login</Link> to comment.
          </p>
        )}
        <CommentList 
          comments={comments} 
          onCommentDeleted={handleCommentDeleted}
          postAuthorId={post.author._id}
        />
      </section>
    </div>
  );
};

export default PostDetail;

