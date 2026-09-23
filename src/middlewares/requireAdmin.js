const authService = require('../services/auth.service');

/**
 * Middleware ensuring request has a valid X-Admin-Token header.
 */
function requireAdmin(req, res, next) {
  const token = req.headers['x-admin-token'] || req.query.admin_token;

  if (!token || !authService.verifyAdminToken(token)) {
    return res.status(401).json({
      error: 'Unauthorized. Please login with admin password.',
    });
  }

  next();
}

module.exports = requireAdmin;
