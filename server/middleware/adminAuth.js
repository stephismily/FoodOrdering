import jwt from "jsonwebtoken";

export function adminAuth(req, res, next) {
  const token = req.cookies?.adminToken;
  if (!token) return res.status(401).json({ message: "Please log in as admin." });
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    if (payload.role !== "admin") return res.status(403).json({ message: "Admin access required." });
    req.admin = payload;
    next();
  } catch {
    return res.status(401).json({ message: "Session expired. Please log in again." });
  }
}
