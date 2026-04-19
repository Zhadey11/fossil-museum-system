const audit = (req, res, next) => {
  console.log(`AUDIT 👉 ${req.method} ${req.originalUrl} - Usuario: ${req.user?.id || 'anon'}`);
  next();
};

module.exports = audit;