module.exports = (...roles) => {
  return (req, res, next) => {
    console.log("RBAC CHECK:", req.user); // 👈 ADD THIS

    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: "Access denied" });
    }
    next();
  };
};
