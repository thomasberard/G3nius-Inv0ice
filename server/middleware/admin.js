const User = require('../models/User');

module.exports = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.userId);
    if (user.role !== 'administrateur') {
      return res.status(403).json({ message: 'Accès refusé' });
    }
    next();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};