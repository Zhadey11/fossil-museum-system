const audit = (req, res, next) => {
  const start = Date.now();
  res.on("finish", () => {
    const elapsed = Date.now() - start;
    const actor = req.user?.id || "anon";
    console.log(
      `[AUDIT] ${req.method} ${req.originalUrl} user=${actor} status=${res.statusCode} ms=${elapsed}`,
    );
  });
  next();
};

module.exports = audit;
