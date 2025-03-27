const admin = (req, res, next) => {
    try {
        // Check if user exists and is admin
        if (!req.user || !req.user.isAdmin) {
            return res.status(403).json({ message: 'Access denied. Admin privileges required.' });
        }
        next();
    } catch (error) {
        console.error('Admin middleware error:', error);
        res.status(500).json({ message: 'Server error in admin middleware' });
    }
};

module.exports = admin; 