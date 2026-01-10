"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authRouter = void 0;
const express_1 = __importDefault(require("express"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const db_1 = require("../database/db");
const router = express_1.default.Router();
exports.authRouter = router;
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({
                message: 'Email and password are required'
            });
        }
        const adminCollection = (0, db_1.getAdministrators)();
        const admin = await adminCollection.findOne({ email });
        if (!admin) {
            return res.status(401).json({
                message: 'Invalid credentials'
            });
        }
        const isPasswordValid = await bcrypt_1.default.compare(password, admin.passwordHash);
        if (!isPasswordValid) {
            return res.status(401).json({
                message: 'Invalid credentials'
            });
        }
        if (!process.env.JWT_SECRET) {
            throw new Error('JWT_SECRET is not defined in environment variables');
        }
        const token = jsonwebtoken_1.default.sign({
            admin_id: admin._id.toString(),
            exp: Math.floor(Date.now() / 1000) + (60 * 60 * 24)
        }, process.env.JWT_SECRET);
        await adminCollection.updateOne({ _id: admin._id }, { $set: { lastLogin: new Date() } });
        return res.status(200).json({
            message: 'Login successful',
            token: token
        });
    }
    catch (error) {
        console.error('Login error:', error);
        return res.status(500).json({
            message: 'Internal server error'
        });
    }
});
//# sourceMappingURL=authRoutes.js.map