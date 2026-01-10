import express from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { getAdministrators } from '../database/db';
import { Administrator } from '../types/databaseTypes';

const router = express.Router();

/**
 * POST /api/auth/login
 * Sets auth-token cookie
 */
router.post('/login', async (req, res) => {
    try {
        // Extract email and password from request body
        const { email, password } = req.body;

        // Validate input
        if (!email || !password) {
            return res.status(400).json({
                message: 'Email and password are required'
            });
        }

        // Fetch admin from collection by email
        const adminCollection = getAdministrators();
        const admin = await adminCollection.findOne({ email });

        // Check if admin exists
        if (!admin) {
            return res.status(401).json({
                message: 'Invalid credentials'
            });
        }

        // Compare password hash with provided password
        const isPasswordValid = await bcrypt.compare(password, admin.passwordHash);

        if (!isPasswordValid) {
            return res.status(401).json({
                message: 'Invalid credentials'
            });
        }

        // Check if JWT_SECRET exists in environment
        if (!process.env.JWT_SECRET) {
            throw new Error('JWT_SECRET is not defined in environment variables');
        }

        // Generate JWT with exp and admin_id
        const token = jwt.sign(
            {
                admin_id: admin._id!.toString(),
                exp: Math.floor(Date.now() / 1000) + (60 * 60 * 24) // Token expires in 24 hours
            },
            process.env.JWT_SECRET
        );

        // Update last login timestamp
        await adminCollection.updateOne(
            { _id: admin._id },
            { $set: { lastLogin: new Date() } }
        );

        // Send token back to client
        return res.status(200).json({
            message: 'Login successful',
            token: token
        });
    } catch (error) {
        console.error('Login error:', error);
        return res.status(500).json({
            message: 'Internal server error'
        });
    }
});

export { router as authRouter };
