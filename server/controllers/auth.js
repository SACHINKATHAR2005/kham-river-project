import admin from "../model/admin.js";
import bcrypt from "bcryptjs";
// import jwt from "jsonwebtoken"; // Uncomment if you want to use JWT

export const Register = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({
                message: "Please provide all fields",
                success: false
            });
        }

        const existingUser = await admin.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                message: "User already exists",
                success: false
            });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = await admin.create({ email, password: hashedPassword });

        // Don't send password in response
        const { password: _, ...userData } = newUser._doc;

        return res.status(201).json({
            message: "User created successfully",
            success: true,
            data: userData
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Internal Server Error",
            success: false
        });
    }
};

export const Login = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({
                message: "Please provide all fields",
                success: false
            });
        }

        const user = await admin.findOne({ email });
        if (!user) {
            return res.status(400).json({
                message: "Invalid email or password",
                success: false
            });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({
                message: "Invalid email or password",
                success: false
            });
        }

        // Optional: Generate token (uncomment to use JWT)
        // const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1d" });

        const { password: _, ...userData } = user._doc;

        return res.status(200).json({
            message: "Login successful",
            success: true,
            // token, // Include this if you use JWT
            data: userData
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Internal Server Error",
            success: false
        });
    }
};
