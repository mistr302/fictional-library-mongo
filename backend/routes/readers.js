const express = require('express');
const router = express.Router();
const Reader = require('../models/reader');

// GET all readers
router.get('/', async (req, res) => {
  try {
    const readers = await Reader.find();
    res.json(readers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET a specific reader by ID
router.get('/:id', async (req, res) => {
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

// POST a new reader
router.post('/', async (req, res) => {
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

// PUT update a reader
router.put('/:id', async (req, res) => {
  try {
    const { name, class: className, email } = req.body;

    const reader = await Reader.findById(req.params.id);
    if (!reader) {
      return res.status(404).json({ message: 'Reader not found' });
    }

    // Update the reader
    reader.name = name ?? reader.name;
    reader.class = className ?? reader.class;
    reader.email = email ?? reader.email;

    const updatedReader = await reader.save();
    res.json(updatedReader);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// DELETE a reader
router.delete('/:id', async (req, res) => {
  try {
    const reader = await Reader.findById(req.params.id);
    if (!reader) {
      return res.status(404).json({ message: 'Reader not found' });
    }

    // Check if reader has active loans
    const Loan = require('../models/loan'); // Import here to avoid circular dependencies
    const activeLoans = await Loan.findOne({
      readerId: req.params.id,
      returnDate: null
    });

    if (activeLoans) {
      return res.status(400).json({
        message: 'Cannot delete reader with active loans'
      });
    }

    await Reader.findByIdAndDelete(req.params.id);
    res.json({ message: 'Reader deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;