const express = require('express');
const router = express.Router();
const Book = require('../models/book');
const PhysicalBook = require('../models/physicalBook');
const BookHistory = require('../models/bookHistory');
const Loan = require('../models/loan');
const { BOOK_STATE } = require('../models/constants');

// GET all books with optional filters
router.get('/', async (req, res) => {
  try {
    const { genre, search } = req.query;
    let filter = {};

    if (genre) {
      filter.genre = new RegExp(genre, 'i');
    }

    if (search) {
      filter.$or = [
        { title: new RegExp(search, 'i') },
        { author: new RegExp(search, 'i') }
      ];
    }

    const books = await Book.find(filter);

    // Add available copies count for compatibility
    const booksWithAvailability = await Promise.all(books.map(async (book) => {
      const totalPhysicalBooks = await PhysicalBook.countDocuments({ bookId: book._id });
      const borrowedCount = await PhysicalBook.countDocuments({ bookId: book._id, status: 'borrowed' });
      const damagedLostCount = await PhysicalBook.countDocuments({
        bookId: book._id,
        $or: [{ status: 'damaged' }, { status: 'lost' }]
      });

      book._doc.availableCopies = totalPhysicalBooks - borrowedCount - damagedLostCount;
      return book;
    }));

    res.json(booksWithAvailability);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET a specific book by ID
router.get('/:id', async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }

    // Add available copies count for compatibility
    const totalPhysicalBooks = await PhysicalBook.countDocuments({ bookId: book._id });
    const borrowedCount = await PhysicalBook.countDocuments({ bookId: book._id, status: 'borrowed' });
    const damagedLostCount = await PhysicalBook.countDocuments({
      bookId: book._id,
      $or: [{ status: 'damaged' }, { status: 'lost' }]
    });

    book._doc.availableCopies = totalPhysicalBooks - borrowedCount - damagedLostCount;
    res.json(book);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST a new book
router.post('/', async (req, res) => {
  try {
    const book = new Book({
      title: req.body.title,
      author: req.body.author,
      year: req.body.year,
      genre: req.body.genre,
      totalCopies: req.body.totalCopies
    });

    const newBook = await book.save();
    res.status(201).json(newBook);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// PUT update a book
router.put('/:id', async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }

    // Store the original totalCopies to see if it changed
    const originalTotalCopies = book.totalCopies;

    book.title = req.body.title;
    book.author = req.body.author;
    book.year = req.body.year;
    book.genre = req.body.genre;
    book.totalCopies = req.body.totalCopies;

    const updatedBook = await book.save();

    // If totalCopies changed, we should adjust the physical books count to match
    // However, this API endpoint is for metadata updates, so we'll leave physical books management to other endpoints

    res.json(updatedBook);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// PATCH to change book physical state
router.patch('/:id/state', async (req, res) => {
  try {
    const { state, note } = req.body;

    // Validate the state
    if (!Object.values(BOOK_STATE).includes(state)) {
      return res.status(400).json({ message: 'Invalid book state' });
    }

    const book = await Book.findById(req.params.id);
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }

    const previousState = book.state;

    // Update the book's state
    book.state = state;
    const updatedBook = await book.save();

    // Create a history record for the state change
    const historyRecord = new BookHistory({
      bookId: book._id,
      action: 'state_change',
      previousState: previousState,
      newState: state,
      note: note || ''
    });

    await historyRecord.save();

    res.json({
      message: 'Book state updated successfully',
      book: updatedBook
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// GET book history (state changes, loans, etc.)
router.get('/:id/history', async (req, res) => {
  try {
    const bookId = req.params.id;

    // Check if book exists
    const book = await Book.findById(bookId);
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }

    // Get all physical books for this parent book
    const physicalBooks = await PhysicalBook.find({ bookId: bookId });
    const physicalBookIds = physicalBooks.map(pb => pb._id);

    // Get loan history for all physical copies of this book
    const loanHistory = await Loan.find({ physicalBookId: { $in: physicalBookIds } })
                                 .populate({
                                   path: 'physicalBookId',
                                   populate: {
                                     path: 'bookId'
                                   }
                                 })
                                 .populate('readerId')
                                 .sort({ borrowDate: -1 });

    // Get state change history for all physical copies of this book
    const stateHistory = await BookHistory.find({
      bookId: { $in: physicalBookIds }
    })
                                         .sort({ timestamp: -1 });

    res.json({
      book: book,
      physicalBooks: physicalBooks,
      loanHistory: loanHistory,
      stateHistory: stateHistory
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET all physical copies of a book
router.get('/:id/physical', async (req, res) => {
  try {
    const { id } = req.params;

    const book = await Book.findById(id);
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }

    const physicalBooks = await PhysicalBook.find({ bookId: id }).populate('bookId');
    res.json(physicalBooks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST to create a new physical copy of a book
router.post('/:id/physical', async (req, res) => {
  try {
    const { id } = req.params;

    const book = await Book.findById(id);
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }

    // Generate external ID in format "BK{id}-XXX" where XXX is a 3-digit sequential number
    const count = await PhysicalBook.countDocuments({ bookId: id });
    const externalId = `BK${id}-${String(count + 1).padStart(3, '0')}`;

    const physicalBook = new PhysicalBook({
      bookId: id,
      state: req.body.state || BOOK_STATE.GOOD,
      status: 'available',
      externalId: externalId
    });

    const newPhysicalBook = await physicalBook.save();

    // Update total copies in the main book entry to reflect the actual count
    // This ensures the Book.totalCopies always matches the actual number of physical books
    const actualCount = await PhysicalBook.countDocuments({ bookId: id });
    book.totalCopies = actualCount;
    await book.save();

    res.status(201).json(newPhysicalBook);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// DELETE a book
router.delete('/:id', async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }

    // Check if book has active loans
    const activeLoans = await Loan.countDocuments({
      physicalBookId: req.params.id, // Changed from bookId to physicalBookId
      returnDate: null
    });

    if (activeLoans > 0) {
      return res.status(400).json({
        message: 'Cannot delete book with active loans'
      });
    }

    // Delete all associated physical books
    await PhysicalBook.deleteMany({ bookId: req.params.id });

    await Book.findByIdAndDelete(req.params.id);
    res.json({ message: 'Book deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;