import express from 'express';
import { expressjwt } from 'express-jwt';
import { getAdministrators } from './database/db';
import { bookRouter } from './routes/bookRoutes';
import { readerRouter } from './routes/readerRoutes';
import { loanRouter } from './routes/loanRoutes';
import { authRouter } from './routes/authRoutes';
import { connectDB } from './database/db';

// Middleware to check if user is a valid administrator
const adminAuthMiddleware = async (req: any, res: express.Response, next: express.NextFunction) => {
    try {
        // TODO: this may be bit dangerous for example /api/readers?hack=/api/auth
        if (req.originalUrl.includes('/api/auth')) {
            return next();
        }
        // Check if req.auth exists and has admin_id
        if (!req.auth || !req.auth.admin_id) {
            return res.status(403).json({ message: 'Access denied: Admin token required' });
        }

        const adminId = req.auth.admin_id;
        const adminsCollection = getAdministrators();

        // Check if the admin exists in the database
        const admin = await adminsCollection.findOne({ _id: adminId });
        if (!admin) {
            return res.status(403).json({ message: 'Access denied: Invalid admin account' });
        }

        // Admin is valid, proceed to next middleware/route handler
        return next();
    } catch (error) {
        console.error('Admin validation error:', error);
        return res.status(500).json({ message: 'Internal server error during auth validation' });
    }
};

async function run(port: number | string) {
    console.log("Attempting to connect to MongoDB..\nIf Mongo isnt running on your instance its possible that the application will get stuck here");
    await connectDB();

    const app = express();

    // Parse JSON bodies
    app.use(express.json());
    const jwt_secret = process.env.JWT_SECRET;
    if (!jwt_secret) throw Error('JWT_SECRET is missing');

    // JWT authentication middleware for all /api routes except /api/auth
    // We'll create a custom middleware to conditionally apply JWT
    app.use('/api', (req, res, next) => {
        // Skip JWT authentication for auth routes (login, register, etc.)
        // TODO: this may be bit dangerous for example /api/readers?hack=/api/auth
        if (req.originalUrl.includes('/api/auth')) {
            return next();
        }

        // For all other routes, apply JWT authentication
        const jwtMiddleware = expressjwt({
            secret: jwt_secret,
            algorithms: ['HS256'],
        });

        // Call the JWT middleware and handle completion
        return jwtMiddleware(req, res, (err) => {
            if (err) {
                return res.status(401).json({ message: 'Invalid or expired token' });
            }
            return next();
        });
    });

    // Apply admin validation middleware to all protected routes
    app.use('/api', adminAuthMiddleware);

    // Routes
    // Auth POST /api/auth remains an unprotected route
    app.use('/api/auth', authRouter);

    app.use('/api/books', bookRouter);
    app.use('/api/readers', readerRouter);
    app.use('/api/loans', loanRouter);
    app.listen(port, () => {
        console.log(`Server is running on port ${port}`);
    });
}
export { run };
