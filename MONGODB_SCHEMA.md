# MongoDB Schema Design

## Collections

### 1. Books Collection
```javascript
{
  _id: ObjectId,
  title: String,           // Název knihy
  author: String,          // Autor knihy
  year: Number,            // Rok vydání
  genre: String,           // Žánr knihy
  availableCopies: Number, // Počet dostupných kusů
  totalCopies: Number,     // Celkový počet kusů
  state: String            // Stav knihy (new, like_new, good, acceptable, poor, damaged)
}
```

### 2. Readers Collection
```javascript
{
  _id: ObjectId,
  name: String,            // Jméno čtenáře
  class: String,           // Třída čtenáře
  email: String            // E-mail čtenáře
}
```

### 3. Loans Collection
```javascript
{
  _id: ObjectId,
  bookId: ObjectId,        // Reference na knihu
  readerId: ObjectId,      // Reference na čtenáře
  borrowDate: Date,        // Datum vypůjčení
  returnDate: Date         // Datum vrácení (null, pokud nevráceno)
}
```

## Relationships

- Loans collection references Books and Readers using ObjectIds
- Each loan connects one book with one reader
- Available copies in Books collection decrease/increase when books are borrowed/returned