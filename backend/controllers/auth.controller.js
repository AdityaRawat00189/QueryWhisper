import bcrypt from "bcryptjs";

import { signupSchema, loginSchema } from "../validators/auth.validator.js";
import User from "../schemas/user.schema.js";


export const signup = async (req, res) => {
    // Optional: validate with Zod
    console.log("Request body:", req.body);
    const result = signupSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ message: result.error?.issues?.[0]?.message || "Validation failed" });
    }

    const { username, password, email } = req.body;

    if (!username || !password || !email) {
        return res.status(400).json({ message: "Incomplete Credentials" });
    }

    try {
        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
        return res.status(409).json({ message: "Email already registered" });
        }

        // Hash password before saving
        const hashedPassword = await bcrypt.hash(password, 10);

        // Save user with hashed password
        const newUser = await User.create({
        username,
        email,
        password: hashedPassword,
        });

        req.session.userId = newUser._id;
        req.session.role = 'user';

        return res.status(201).json({
        message: "User Created",
        user: {
            id: newUser._id,
            username: newUser.username,
            email: newUser.email,
        },
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Database Error", error: error.message });
    }
}

export const login = async (req, res) => {
    const result = loginSchema.safeParse(req.body);
    console.log("Login Route ....")
    if (!result.success) {
        return res.status(400).json({ message: result.error?.issues?.[0]?.message || "Validation failed" });
    }

    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) {
        return res.status(404).json({ message: "User Not Found" });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
        return res.status(400).json({ message: "Invalid Credentials" });
        }

        req.session.userId = user._id;
        req.session.role = 'user';

        return res.status(200).json({
        message: "Login successful",
        user: {
            id: user._id,
            username: user.username,
            email: user.email,
        },
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Database Error", error: error.message });
    }
}

export const logout = (req, res) => {
    req.session.destroy((err) => {
        if (err) return res.status(500).json({ error: "Logout failed" });
        
        res.clearCookie('connect.sid'); // Clear the default cookie name
        res.status(200).json({ message: "Logged out" });
    });
}