const service = require('./auth.service');

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const result = await service.login(email, password);

    res.json(result);
  } catch (error) {
    console.error('🔥 ERROR REAL:', error.message);

    res.status(400).json({
      error: error.message // 👈 IMPORTANTE
    });
  }
};

module.exports = { login }; 