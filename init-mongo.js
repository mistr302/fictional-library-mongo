#!/bin/bash
# MongoDB initialization script

echo "Creating library_db database and setting up collections..."

# Wait for MongoDB to be ready
sleep 5

# Create the database and initial collections
mongosh <<EOF
use library_db

# Create indexes if needed
db.books.createIndex({ "title": 1 })
db.readers.createIndex({ "email": 1 }, { unique: true })
db.loans.createIndex({ "bookId": 1, "readerId": 1 })

# Insert sample data
db.books.insertMany([
  {
    "title": "Pán prstenů",
    "author": "J.R.R. Tolkien",
    "year": 1954,
    "genre": "Fantasy",
    "availableCopies": 3,
    "totalCopies": 3,
    "state": "good"
  },
  {
    "title": "1984",
    "author": "George Orwell",
    "year": 1949,
    "genre": "Dystopia",
    "availableCopies": 2,
    "totalCopies": 2,
    "state": "acceptable"
  }
])

db.readers.insertMany([
  {
    "name": "Jan Novák",
    "class": "9.A",
    "email": "jan.novak@example.com"
  },
  {
    "name": "Marie Svobodová",
    "class": "8.B",
    "email": "marie.svobodova@example.com"
  }
])

print("Database initialized successfully!")
EOF