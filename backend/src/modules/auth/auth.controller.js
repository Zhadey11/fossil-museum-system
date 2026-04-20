const service = require("./auth.service");

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const result = await service.login(email, password);

    res.json(result);
  } catch (error) {
    console.error("Login error:", error.message);

    res.status(400).json({
      error: error.message,
    });
  }
};

const logout = async (req, res) => {
  try {
    const token = req.token || (req.headers.authorization || "").replace(/^Bearer\s+/i, "");
    const result = await service.logout(token);
    res.json(result);
  } catch (error) {
    res.status(400).json({ error: error.message || "No se pudo cerrar sesión" });
  }
};

module.exports = { login, logout };
