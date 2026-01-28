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

module.exports = router;