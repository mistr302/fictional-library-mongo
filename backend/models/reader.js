const mongoose = require('mongoose');

// Define Reader Schema
const readerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  class: { type: String, required: true },
  email: { type: String, required: true }
});

const Reader = mongoose.model('Reader', readerSchema);

module.exports = Reader;