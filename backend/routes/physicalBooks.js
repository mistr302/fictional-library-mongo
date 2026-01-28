const express = require('express');
const router = express.Router();
const PhysicalBook = require('../models/physicalBook');
const Book = require('../models/book');
const BookHistory = require('../models/bookHistory');
const Loan = require('../models/loan');
const { BOOK_STATE } = require('../models/constants');

// GET all physical books with optional filtering
router.get('/', async (req, res) => {
  try {
    const { bookId } = req.query;
    let filter = {};

    if (bookId) {
      filter.bookId = bookId;
    }

    const physicalBooks = await PhysicalBook.find(filter).populate('bookId');
    res.json(physicalBooks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET a specific physical book by ID
router.get('/:id', async (req, res) => {
  try {
    const physicalBook = await PhysicalBook.findById(req.params.id).populate('bookId');
    
    if (!physicalBook) {
      return res.status(404).json({ message: 'Physical book not found' });
    }
    
    res.json(physicalBook);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// PATCH to update a physical book's state
router.patch('/:id/state', async (req, res) => {
  try {
    const { id } = req.params;
    const { state, note, status } = req.body;

    // Validate the state
    if (!Object.values(BOOK_STATE).includes(state)) {
      return res.status(400).json({ message: 'Invalid book state' });
    }

    const physicalBook = await PhysicalBook.findById(id);
    if (!physicalBook) {
      return res.status(404).json({ message: 'Physical book not found' });
    }

    const previousState = physicalBook.state;
    const previousStatus = physicalBook.status;

    // Update the physical book's state and status
    physicalBook.state = state;
    if (status) {
      physicalBook.status = status;
    }
    const updatedPhysicalBook = await physicalBook.save();

    // Create a history record for the state/status change
    const historyRecord = new BookHistory({
      bookId: physicalBook._id, // We'll track this against the physical book ID
      action: 'state_change',
      previousState: previousState,
      newState: state,
      note: note || `Status changed from ${previousStatus} to ${physicalBook.status}`
    });

    await historyRecord.save();

    res.json({
      message: 'Physical book state updated successfully',
      physicalBook: updatedPhysicalBook
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// GET physical book history
router.get('/:id/history', async (req, res) => {
  try {
    const { id } = req.params;

    const physicalBook = await PhysicalBook.findById(id);
    if (!physicalBook) {
      return res.status(404).json({ message: 'Physical book not found' });
    }

    // Get state change history for this physical book
    const stateHistory = await BookHistory.find({ bookId: id })
                                         .sort({ timestamp: -1 });

    res.json({
      physicalBook: physicalBook,
      stateHistory: stateHistory
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// DELETE a physical book
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const physicalBook = await PhysicalBook.findById(id);
    if (!physicalBook) {
      return res.status(404).json({ message: 'Physical book not found' });
    }

    // Check if the physical book is currently borrowed or damaged/lost
    if (physicalBook.status !== 'available') {
      return res.status(400).json({
        message: `Cannot delete physical book with status '${physicalBook.status}'. Only available books can be deleted.`
      });
    }

    // Check if this physical book has active loans (not yet returned)
    const activeLoans = await Loan.countDocuments({
      physicalBookId: id,
      returnDate: null
    });

    if (activeLoans > 0) {
      return res.status(400).json({
        message: 'Cannot delete physical book with active loans'
      });
    }

    // Delete the physical book
    await PhysicalBook.findByIdAndDelete(id);

    // Update the parent book's totalCopies count to reflect the actual count
    const book = await Book.findById(physicalBook.bookId);
    if (book) {
      const actualCount = await PhysicalBook.countDocuments({ bookId: physicalBook.bookId });
      book.totalCopies = actualCount;
      await book.save();
    }

    res.json({ message: 'Physical book deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;