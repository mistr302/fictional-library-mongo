const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB with authentication options
const mongoUri = process.env.MONGODB_URI || 'mongodb://admin:password@mongo:27017/library_db?authSource=admin';

mongoose.connect(mongoUri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 30000, // Timeout after 30s instead of 3000ms
})
.catch(err => {
  console.error('MongoDB connection error:', err);
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
  console.log('Connected to MongoDB');
});

// Define BOOK_STATE enum
const BOOK_STATE = {
  NEW: 'new',
  LIKE_NEW: 'like_new',
  GOOD: 'good',
  ACCEPTABLE: 'acceptable',
  POOR: 'poor',
  DAMAGED: 'damaged'
};

// Define Book History Schema to track book state changes
const bookHistorySchema = new mongoose.Schema({
  bookId: { type: mongoose.Schema.Types.ObjectId, ref: 'Book', required: true },
  action: { type: String, required: true }, // 'state_change', 'loan', 'return', etc.
  previousState: { type: String, enum: Object.values(BOOK_STATE) },
  newState: { type: String, enum: Object.values(BOOK_STATE) },
  timestamp: { type: Date, default: Date.now },
  note: { type: String } // Optional note about the state change
});

const BookHistory = mongoose.model('BookHistory', bookHistorySchema);

// Define PhysicalBook Schema for individual physical copies
const physicalBookSchema = new mongoose.Schema({
  bookId: { type: mongoose.Schema.Types.ObjectId, ref: 'Book', required: true },
  state: {
    type: String,
    enum: Object.values(BOOK_STATE),
    default: BOOK_STATE.GOOD
  },
  status: {
    type: String,
    enum: ['available', 'borrowed', 'damaged', 'lost'],
    default: 'available'
  },
  externalId: { type: String, unique: true, required: true } // Unique identifier like "BK1-001"
});

const PhysicalBook = mongoose.model('PhysicalBook', physicalBookSchema);

// Define Schemas and Models
const bookSchema = new mongoose.Schema({
  title: { type: String, required: true },
  author: { type: String, required: true },
  year: { type: Number, required: true },
  genre: { type: String, required: true },
  totalCopies: { type: Number, required: true } // Total physical copies count (for statistics)
});

const readerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  class: { type: String, required: true },
  email: { type: String, required: true }
});

const loanSchema = new mongoose.Schema({
  physicalBookId: { type: mongoose.Schema.Types.ObjectId, ref: 'PhysicalBook', required: true },
  readerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Reader', required: true },
  borrowDate: { type: Date, default: Date.now },
  returnDate: { type: Date, default: null }
});

const Book = mongoose.model('Book', bookSchema);
const Reader = mongoose.model('Reader', readerSchema);
const Loan = mongoose.model('Loan', loanSchema);

// Books Routes
app.get('/api/books', async (req, res) => {
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

app.get('/api/books/:id', async (req, res) => {
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

app.post('/api/books', async (req, res) => {
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

app.put('/api/books/:id', async (req, res) => {
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

// Endpoint to change book physical state
app.patch('/api/books/:id/state', async (req, res) => {
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

// Endpoint to get book history (state changes, loans, etc.)
app.get('/api/books/:id/history', async (req, res) => {
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

// Endpoint to get all physical copies of a book
app.get('/api/books/:id/physical', async (req, res) => {
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

// Endpoint to create a new physical copy of a book
app.post('/api/books/:id/physical', async (req, res) => {
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

// Endpoint to update a physical book's state
app.patch('/api/physical-books/:id/state', async (req, res) => {
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

// Endpoint to get physical book history
app.get('/api/physical-books/:id/history', async (req, res) => {
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

// Endpoint to delete a physical book
app.delete('/api/physical-books/:id', async (req, res) => {
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

app.delete('/api/books/:id', async (req, res) => {
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

// Readers Routes
app.get('/api/readers', async (req, res) => {
  try {
    const readers = await Reader.find();
    res.json(readers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.get('/api/readers/:id', async (req, res) => {
  try {
    const reader = await Reader.findById(req.params.id);
    if (!reader) {
      return res.status(404).json({ message: 'Reader not found' });
    }
    res.json(reader);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post('/api/readers', async (req, res) => {
  try {
    const reader = new Reader({
      name: req.body.name,
      class: req.body.class,
      email: req.body.email
    });

    const newReader = await reader.save();
    res.status(201).json(newReader);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Loans Routes
app.post('/api/loans', async (req, res) => {
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

app.post('/api/loans/:id/return', async (req, res) => {
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

// Get all active loans (not yet returned)
app.get('/api/loans/active', async (req, res) => {
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

// Get all loans for a specific reader
app.get('/api/readers/:id/loans', async (req, res) => {
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

// Get all loans for a specific book (both active and historical)
app.get('/api/books/:id/loans', async (req, res) => {
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

// Get all loans (both active and historical) - admin endpoint
app.get('/api/loans', async (req, res) => {
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

// Endpoint to get all physical books
app.get('/api/physical-books', async (req, res) => {
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

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});