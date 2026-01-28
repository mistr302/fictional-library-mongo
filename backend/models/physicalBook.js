const mongoose = require('mongoose');
const { BOOK_STATE } = require('./constants');

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

module.exports = PhysicalBook;