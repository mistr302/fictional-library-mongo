const mongoose = require('mongoose');

// Define Book Schema
const bookSchema = new mongoose.Schema({
  title: { type: String, required: true },
  author: { type: String, required: true },
  year: { type: Number, required: true },
  genre: { type: String, required: true },
  totalCopies: { type: Number, required: true } // Total physical copies count (for statistics)
});

const Book = mongoose.model('Book', bookSchema);

module.exports = Book;