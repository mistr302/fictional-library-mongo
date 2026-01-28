const express = require('express');
const router = express.Router();
const Loan = require('../models/loan');
const Reader = require('../models/reader');
const PhysicalBook = require('../models/physicalBook');
const Book = require('../models/book');
const BookHistory = require('../models/bookHistory');

// POST to create a new loan
router.post('/', async (req, res) => {
  try {
    const { bookId, physicalBookId, readerId } = req.body;

    let physicalBook;
    // If a specific physical book is requested, use that one
    if (physicalBookId) {
      physicalBook = await PhysicalBook.findById(physicalBookId);
      if (!physicalBook || physicalBook.status !== 'available') {
        return res.status(400).json({ message: 'Selected physical book is not available' });
      }
    } else {
      // Otherwise, find any available physical copy of the book
      physicalBook = await PhysicalBook.findOne({
        bookId: bookId,
        status: 'available'
      });

      if (!physicalBook) {
        return res.status(400).json({ message: 'No available physical copies of this book' });
      }
    }

    // Check if reader exists
    const reader = await Reader.findById(readerId);
    if (!reader) {
      return res.status(404).json({ message: 'Reader not found' });
    }

    // Create loan
    const loan = new Loan({
      physicalBookId: physicalBook._id,
      readerId
    });

    const newLoan = await loan.save();

    // Update the physical book status to borrowed
    physicalBook.status = 'borrowed';
    await physicalBook.save();

    // Create a history record for the loan
    const historyRecord = new BookHistory({
      bookId: physicalBook._id,
      action: 'loan',
      previousState: physicalBook.state,
      newState: physicalBook.state,
      note: `Loaned to ${reader.name}`
    });

    await historyRecord.save();

    res.status(201).json(newLoan);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// POST to return a book (update loan with return date)
router.post('/:id/return', async (req, res) => {
  try {
    const loan = await Loan.findById(req.params.id);
    if (!loan) {
      return res.status(404).json({ message: 'Loan not found' });
    }

    if (loan.returnDate) {
      return res.status(400).json({ message: 'Book already returned' });
    }

    // Update return date
    loan.returnDate = new Date();
    const updatedLoan = await loan.save();

    // Update the physical book status to available
    const physicalBook = await PhysicalBook.findById(loan.physicalBookId);
    if (physicalBook) {
      physicalBook.status = 'available';
      await physicalBook.save();
    }

    // Create a history record for the return
    const reader = await Reader.findById(loan.readerId);
    const historyRecord = new BookHistory({
      bookId: loan.physicalBookId, // Track against the physical book
      action: 'return',
      previousState: physicalBook ? physicalBook.state : null,
      newState: physicalBook ? physicalBook.state : null,
      note: `Returned by ${reader ? reader.name : 'Unknown'}`
    });

    await historyRecord.save();

    res.json(updatedLoan);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// GET all active loans (not yet returned)
router.get('/active', async (req, res) => {
  try {
    const activeLoans = await Loan.find({ returnDate: null })
                                  .populate({
                                    path: 'physicalBookId',
                                    populate: {
                                      path: 'bookId'
                                    }
                                  })
                                  .populate('readerId');
    res.json(activeLoans);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET all loans for a specific reader
router.get('/readers/:id/loans', async (req, res) => {
  try {
    const readerLoans = await Loan.find({ readerId: req.params.id })
                                  .populate({
                                    path: 'physicalBookId',
                                    populate: {
                                      path: 'bookId'
                                    }
                                  })
                                  .populate('readerId')
                                  .sort({ borrowDate: -1 });
    res.json(readerLoans);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET all loans for a specific book (both active and historical)
router.get('/books/:id/loans', async (req, res) => {
  try {
    // Find all physical books for this book
    const physicalBooks = await PhysicalBook.find({ bookId: req.params.id });
    const physicalBookIds = physicalBooks.map(pb => pb._id);

    // Find all loans for those physical books
    const bookLoans = await Loan.find({ physicalBookId: { $in: physicalBookIds } })
                                .populate({
                                  path: 'physicalBookId',
                                  populate: {
                                    path: 'bookId'
                                  }
                                })
                                .populate('readerId')
                                .sort({ borrowDate: -1 });
    res.json(bookLoans);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET all loans (both active and historical) - admin endpoint
router.get('/', async (req, res) => {
  try {
    const allLoans = await Loan.find()
                               .populate({
                                 path: 'physicalBookId',
                                 populate: {
                                   path: 'bookId'
                                 }
                               })
                               .populate('readerId')
                               .sort({ borrowDate: -1 });
    res.json(allLoans);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;