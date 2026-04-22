const service = require("./auth.service");

function cookieOptions() {
  const isProd = process.env.NODE_ENV === "production";
  return {
    httpOnly: true,
    sameSite: "lax",
    secure: isProd,
    path: "/",
    maxAge: 8 * 60 * 60 * 1000,
  };
}

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const result = await service.login(email, password);
    const cookieName = process.env.AUTH_COOKIE_NAME || "fossiles_token";
    res.cookie(cookieName, result.token, cookieOptions());

    res.json(result);
  } catch (error) {
    console.error("Login error:", error.message);

    res.status(400).json({
      error: error.message,
    });
  }
};

const register = async (req, res) => {
  try {
    const data = await service.register(req.body || {});
    res.status(201).json({
      mensaje: "Cuenta creada correctamente",
      data,
    });
  } catch (error) {
    console.error("Register error:", error.message);
    res.status(400).json({ error: error.message });
  }
};

const logout = async (req, res) => {
  try {
    const cookieName = process.env.AUTH_COOKIE_NAME || "fossiles_token";
    const token =
      req.token ||
      req.cookies?.[cookieName] ||
      (req.headers.authorization || "").replace(/^Bearer\s+/i, "");
    const result = await service.logout(token);
    res.clearCookie(cookieName, { ...cookieOptions(), maxAge: undefined });
    res.json(result);
  } catch (error) {
    res.status(400).json({ error: error.message || "No se pudo cerrar sesión" });
  }
};

module.exports = { login, register, logout };
