module.exports = (...allowedRoles) => {
  return (req, res, next) => {
    if (req.user.role === "ADMIN") {
      return next();
    }
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ message: "Forbidden" });
    }
    next();
  };
};
