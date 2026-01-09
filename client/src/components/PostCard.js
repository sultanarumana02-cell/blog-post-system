import React from 'react';
import { Link } from 'react-router-dom';
import './PostCard.css';

const PostCard = ({ post }) => {
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const truncateContent = (content, maxLength = 150) => {
    if (content.length <= maxLength) return content;
    return content.substr(0, maxLength) + '...';
  };

  return (
    <div className="post-card">
      <h3 className="post-card-title">
        <Link to={`/posts/${post._id}`}>{post.title}</Link>
      </h3>
      <div className="post-card-meta">
        <span className="post-author">By {post.author?.username || 'Unknown'}</span>
        <span className="post-date">{formatDate(post.createdAt)}</span>
      </div>
      <p className="post-card-content">{truncateContent(post.content)}</p>
      <Link to={`/posts/${post._id}`} className="post-card-link">
        Read More →
      </Link>
    </div>
  );
};

export default PostCard;

