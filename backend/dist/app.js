"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.run = run;
const express_1 = __importDefault(require("express"));
const express_jwt_1 = require("express-jwt");
const db_1 = require("./database/db");
const bookRoutes_1 = require("./routes/bookRoutes");
const readerRoutes_1 = require("./routes/readerRoutes");
const loanRoutes_1 = require("./routes/loanRoutes");
const authRoutes_1 = require("./routes/authRoutes");
const db_2 = require("./database/db");
const adminAuthMiddleware = async (req, res, next) => {
    try {
        if (req.originalUrl.includes('/api/auth')) {
            return next();
        }
        if (!req.auth || !req.auth.admin_id) {
            return res.status(403).json({ message: 'Access denied: Admin token required' });
        }
        const adminId = req.auth.admin_id;
        const adminsCollection = (0, db_1.getAdministrators)();
        const admin = await adminsCollection.findOne({ _id: adminId });
        if (!admin) {
            return res.status(403).json({ message: 'Access denied: Invalid admin account' });
        }
        return next();
    }
    catch (error) {
        console.error('Admin validation error:', error);
        return res.status(500).json({ message: 'Internal server error during auth validation' });
    }
};
async function run(port) {
    console.log("Attempting to connect to MongoDB..\nIf Mongo isnt running on your instance its possible that the application will get stuck here");
    await (0, db_2.connectDB)();
    const app = (0, express_1.default)();
    app.use(express_1.default.json());
    const jwt_secret = process.env.JWT_SECRET;
    if (!jwt_secret)
        throw Error('JWT_SECRET is missing');
    app.use('/api', (req, res, next) => {
        if (req.originalUrl.includes('/api/auth')) {
            return next();
        }
        const jwtMiddleware = (0, express_jwt_1.expressjwt)({
            secret: jwt_secret,
            algorithms: ['HS256'],
        });
        return jwtMiddleware(req, res, (err) => {
            if (err) {
                return res.status(401).json({ message: 'Invalid or expired token' });
            }
            return next();
        });
    });
    app.use('/api', adminAuthMiddleware);
    app.use('/api/auth', authRoutes_1.authRouter);
    app.use('/api/books', bookRoutes_1.bookRouter);
    app.use('/api/readers', readerRoutes_1.readerRouter);
    app.use('/api/loans', loanRoutes_1.loanRouter);
    app.listen(port, () => {
        console.log(`Server is running on port ${port}`);
    });
}
//# sourceMappingURL=app.js.map