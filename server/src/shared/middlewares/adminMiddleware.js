import jwt from "jsonwebtoken";

export const verifyAdmin = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "Access denied" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("Admin middleware - Token decoded:", decoded);

    // Kiểm tra role_id === 0 (admin)
    if (decoded.role_id !== 0) {
      return res.status(403).json({ message: "Admin access required" });
    }

    req.user = decoded;
    next();
  } catch (error) {
    res.status(403).json({ message: "Invalid or expired token" });
  }
};
