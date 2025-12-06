const jwt = require('jsonwebtoken');

const generateToken = (user) => {
  const payload = {
    id: user.id
  };

  if (user.role) {
    payload.role = user.role;
  }

  return jwt.sign(
    payload,
    process.env.JWT_SECRET || 'your_super_secret_jwt_key_change_this_in_production',
    { expiresIn: process.env.JWT_EXPIRE || '24h' }
  );
};

const verifyToken = (token) => {
  try {
    return jwt.verify(
      token,
      process.env.JWT_SECRET || 'your_super_secret_jwt_key_change_this_in_production'
    );
  } catch (error) {
    return null;
  }
};

module.exports = {
  generateToken,
  verifyToken
};
