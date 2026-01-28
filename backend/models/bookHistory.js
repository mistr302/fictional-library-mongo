const mongoose = require('mongoose');
const { BOOK_STATE } = require('./constants');

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

module.exports = BookHistory;