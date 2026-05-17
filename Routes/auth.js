import express from "express";
import User from "../models/user.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { authLimiter } from "../middleware/ratelimiter.js";
import adminAuth from "../middleware/auth.js";

const authRouter = express.Router();

authRouter.post("/signup", authLimiter, async (req, res) => {
    try {

        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Email and password are required",
            });
        }
        // check if any user exists in the database
        const exisingUser = await User.findOne({});
        if (exisingUser) {
            return res.status(403).json({
                success: false,
                message: "Registration is closed.",
            });
        }

        // Protect against extremely large payloads
        if ((typeof email === 'string' && email.length > 2000) || (typeof password === 'string' && password.length > 2000)) {
            return res.status(413).json({ success: false, message: 'Payload too large' });
        }
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: "Email already exists",
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const savedUser = await User.create({ email, password: hashedPassword });
        const { password: _, ...userData } = savedUser.toObject();
        const token = savedUser.getJWTToken();
        res.cookie("token", token)
        res.status(201).json({ message: "User registered successfully", data: userData });



    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }

});

authRouter.post("/login", authLimiter, async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Email and password are required",
            });
        }



        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({
                success: false,
                message: "Invalid email or password",
            });
        }
        const isPasswordValid = await user.validatePassword(password);
        if (!isPasswordValid) {
            return res.status(400).json({
                success: false,
                message: "Invalid email or password",
            });
        }
        const token = user.getJWTToken();
        res.cookie("token", token);
        const { password: _, ...userData } = user.toObject();
        res.status(200).json({ message: "Login successful", data: userData });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
});

authRouter.get("/me", adminAuth, async (req, res) => {
    try {
        const user = req.user;
        res.status(200).json({ success: true, data: user });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
});

authRouter.get("/logout", async (req, res) => {
    res.cookie("token", null, {
        expires: new Date(0),
    });
    res.send("Logout Successful!!");
});

export default authRouter;
