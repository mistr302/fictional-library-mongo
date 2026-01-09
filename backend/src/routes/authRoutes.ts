import express from 'express';

const router = express.Router();

/**
 * POST /api/login
 * Sets auth-token cookie
 */
router.post('/login', (req, res) => {
    // TODO: Implement login logic
    res.status(501).json({ message: 'Not Implemented' });
});

export { router as authRouter };
