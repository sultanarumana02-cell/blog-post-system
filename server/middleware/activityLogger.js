const activityLogger = (req, res, next) => {
    // Only log authenticated requests that modify state or are significant
    if (req.user) {
        const { method, originalUrl } = req;
        const userId = req.user.userId;
        const timestamp = new Date().toISOString();

        // Log login/logout/register
        if (originalUrl.includes('/auth/')) {
            console.log(`[ACTIVITY][${timestamp}] User ${userId} accessed Auth Route: ${method} ${originalUrl}`);
        }

        // Log post creations/deletions/updates
        if (originalUrl.includes('/posts') && method !== 'GET') {
            console.log(`[ACTIVITY][${timestamp}] User ${userId} modified Post: ${method} ${originalUrl}`);
        }

        // Log comment actions
        if (originalUrl.includes('/comments') && method !== 'GET') {
            console.log(`[ACTIVITY][${timestamp}] User ${userId} modified Comment: ${method} ${originalUrl}`);
        }

        // Log admin actions
        if (originalUrl.includes('/admin')) {
            console.log(`[ACTIVITY][${timestamp}] User ${userId} (Role: ${req.user.role}) performed Admin Action: ${method} ${originalUrl}`);
        }
    }
    next();
};

module.exports = activityLogger;
