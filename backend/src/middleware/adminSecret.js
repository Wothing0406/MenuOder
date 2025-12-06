// Middleware: Protect admin routes using a secret key from environment
// Only requests carrying correct X-Admin-Secret will be allowed.

module.exports = (req, res, next) => {
  try {
    const configuredSecret = process.env.ADMIN_SECRET_KEY;

    if (!configuredSecret) {
      return res.status(500).json({
        success: false,
        message: 'ADMIN_SECRET_KEY is not configured on the server'
      });
    }

    const provided = req.headers['x-admin-secret'];

    if (!provided || provided !== configuredSecret) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: invalid admin secret'
      });
    }

    // Optionally tag request as admin
    req.isAdminSecret = true;
    next();
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};