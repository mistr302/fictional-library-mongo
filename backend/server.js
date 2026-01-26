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

// Define Schemas and Models
const bookSchema = new mongoose.Schema({
  title: { type: String, required: true },
  author: { type: String, required: true },
  year: { type: Number, required: true },
  genre: { type: String, required: true },
  availableCopies: { type: Number, required: true },
  totalCopies: { type: Number, required: true },
  state: {
    type: String,
    enum: Object.values(BOOK_STATE),
    default: BOOK_STATE.GOOD
  }
});

const readerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  class: { type: String, required: true },
  email: { type: String, required: true }
});

const loanSchema = new mongoose.Schema({
  bookId: { type: mongoose.Schema.Types.ObjectId, ref: 'Book', required: true },
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
    res.json(books);
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
      availableCopies: req.body.availableCopies,
      totalCopies: req.body.totalCopies,
      state: req.body.state || BOOK_STATE.GOOD
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

    book.title = req.body.title;
    book.author = req.body.author;
    book.year = req.body.year;
    book.genre = req.body.genre;
    book.availableCopies = req.body.availableCopies;
    book.totalCopies = req.body.totalCopies;
    book.state = req.body.state;

    const updatedBook = await book.save();
    res.json(updatedBook);
  } catch (error) {
    res.status(400).json({ message: error.message });
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
      bookId: req.params.id,
      returnDate: null
    });

    if (activeLoans > 0) {
      return res.status(400).json({
        message: 'Cannot delete book with active loans'
      });
    }

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
    const { bookId, readerId } = req.body;

    // Check if book exists and has available copies
    const book = await Book.findById(bookId);
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }

    if (book.availableCopies <= 0) {
      return res.status(400).json({ message: 'No available copies of this book' });
    }

    // Check if reader exists
    const reader = await Reader.findById(readerId);
    if (!reader) {
      return res.status(404).json({ message: 'Reader not found' });
    }

    // Create loan
    const loan = new Loan({
      bookId,
      readerId
    });

    const newLoan = await loan.save();

    // Decrease available copies
    book.availableCopies -= 1;
    await book.save();

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

    // Increase available copies of the book
    const book = await Book.findById(loan.bookId);
    if (book) {
      book.availableCopies += 1;
      await book.save();
    }

    res.json(updatedLoan);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Get all active loans (not yet returned)
app.get('/api/loans/active', async (req, res) => {
  try {
    const activeLoans = await Loan.find({ returnDate: null })
                                  .populate('bookId')
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
                                  .populate('bookId')
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
    const bookLoans = await Loan.find({ bookId: req.params.id })
                                .populate('bookId')
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
                               .populate('bookId')
                               .populate('readerId')
                               .sort({ borrowDate: -1 });
    res.json(allLoans);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});