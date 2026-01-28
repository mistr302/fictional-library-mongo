const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Import routes
const booksRouter = require('./routes/books');
const readersRouter = require('./routes/readers');
const loansRouter = require('./routes/loans');
const physicalBooksRouter = require('./routes/physicalBooks');

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

// Mount routes
app.use('/api/books', booksRouter);
app.use('/api/readers', readersRouter);
app.use('/api/loans', loansRouter);
app.use('/api/physical-books', physicalBooksRouter);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});