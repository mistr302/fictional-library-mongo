import express from 'express';

const router = express.Router();

/**
 * GET /api/books
 * Retrieves all books
 */
router.get('/books', (req, res) => {
    // TODO: Implement get all books logic
    res.status(501).json({ message: 'Not Implemented' });
});

/**
 * POST /api/books
 * Creates a new book
 */
router.post('/books', (req, res) => {
    // TODO: Implement create book logic
    res.status(501).json({ message: 'Not Implemented' });
});

/**
 * PUT /api/books/:id
 * Updates a book by ID
 */
router.put('/books/:id', (req, res) => {
    // TODO: Implement update book logic
    res.status(501).json({ message: 'Not Implemented' });
});

/**
 * DELETE /api/books/:id
 * Deletes a book by ID
 */
router.delete('/books/:id', (req, res) => {
    // TODO: Implement delete book logic
    res.status(501).json({ message: 'Not Implemented' });
});

export { router as bookRouter };
