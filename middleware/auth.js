import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import User from "../models/user.js";

dotenv.config();

const adminAuth = async (req, res, next) => {
    try {
        const token = req.cookies.token;
        if (!token) {
            return res.status(401).json({ message: "Please login" });
        }
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        // exclude sensitive fields and use lean for performance
        const user = await User.findById(decoded.id).select('-password').lean();
        if (!user) {
            return res.status(401).json({ message: "User not found" });
        }
        req.user = user;
        next();
    } catch (error) {
        return res.status(401).json({ message: "Invalid token" });
    }
}

export default adminAuth;
