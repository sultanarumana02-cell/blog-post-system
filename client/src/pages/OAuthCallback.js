import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const OAuthCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { setUserDirectly } = useAuth();
  const hasProcessed = useRef(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // Prevent multiple executions
    if (hasProcessed.current) return;
    hasProcessed.current = true;

    const handleCallback = async () => {
      const userParam = searchParams.get('user');
      const errorParam = searchParams.get('error');

      if (errorParam) {
        // OAuth authentication failed
        console.error('OAuth error:', errorParam);
        setError('Authentication failed. Redirecting to login...');
        setTimeout(() => {
          navigate('/login?error=oauth_failed', { replace: true });
        }, 2000);
        return;
      }

      if (userParam) {
        try {
          // Parse user data from URL
          const userData = JSON.parse(decodeURIComponent(userParam));
          console.log('OAuth success, user data received:', userData.username);

          // Directly set user in context (skip API call to avoid rate limiting)
          if (setUserDirectly) {
            setUserDirectly(userData);
          }

          // Redirect to home page
          setTimeout(() => {
            navigate('/', { replace: true });
          }, 500);
        } catch (err) {
          console.error('OAuth callback parsing error:', err);
          setError('Failed to process authentication. Redirecting to login...');
          setTimeout(() => {
            navigate('/login?error=oauth_callback_error', { replace: true });
          }, 2000);
        }
      } else {
        // No user data, redirect to login
        console.warn('OAuth callback: No user data in URL');
        setError('No user data received. Redirecting to login...');
        setTimeout(() => {
          navigate('/login?error=no_user_data', { replace: true });
        }, 2000);
      }
    };

    handleCallback();
  }, [searchParams, navigate, setUserDirectly]);

  return (
    <div className="loading" style={{ textAlign: 'center', padding: '40px' }}>
      {error ? (
        <>
          <p style={{ color: '#e74c3c' }}>{error}</p>
        </>
      ) : (
        <>
          <p>Completing authentication...</p>
          <p style={{ fontSize: '0.9rem', color: '#7f8c8d', marginTop: '10px' }}>
            Please wait while we log you in...
          </p>
        </>
      )}
    </div>
  );
};

export default OAuthCallback;
