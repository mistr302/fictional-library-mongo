const mongoose = require('mongoose');

// Define Loan Schema
const loanSchema = new mongoose.Schema({
  physicalBookId: { type: mongoose.Schema.Types.ObjectId, ref: 'PhysicalBook', required: true },
  readerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Reader', required: true },
  borrowDate: { type: Date, default: Date.now },
  returnDate: { type: Date, default: null }
});

const Loan = mongoose.model('Loan', loanSchema);

module.exports = Loan;