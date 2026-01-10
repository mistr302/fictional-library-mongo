import express from 'express';

const router = express.Router();

/**
 * GET /api/readers
 * Retrieves all readers
 */
router.get('/', (req, res) => {
    // TODO: Implement get all readers logic
    res.status(501).json({ message: 'Not Implemented' });
});

/**
 * POST /api/readers
 * Creates a new reader
 */
router.post('/', (req, res) => {
    // TODO: Implement create reader logic
    res.status(501).json({ message: 'Not Implemented' });
});

export { router as readerRouter };
