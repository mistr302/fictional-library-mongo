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
  totalCopies: Number      // Celkový počet fyzických kopií (pro statistiky)
}
```

### 2. PhysicalBooks Collection
```javascript
{
  _id: ObjectId,
  bookId: ObjectId,        // Reference na hlavní knihu
  state: String,           // Stav fyzické kopie (new, like_new, good, acceptable, poor, damaged)
  status: String,          // Stav dostupnosti (available, borrowed, damaged, lost)
  externalId: String       // Externí ID pro jednoduchou identifikaci (např. "BK1-001")
}
```

### 3. Readers Collection
```javascript
{
  _id: ObjectId,
  name: String,            // Jméno čtenáře
  class: String,           // Třída čtenáře
  email: String            // E-mail čtenáře
}
```

### 4. BookHistory Collection
```javascript
{
  _id: ObjectId,
  bookId: ObjectId,        // Reference na fyzickou knihu (PhysicalBook), nebo na hlavní knihu
  action: String,          // 'state_change', 'loan', 'return', 'create_physical', 'damage', 'loss'
  previousState: String,   // Předchozí stav (uživatelský)
  newState: String,        // Nový stav (uživatelský)
  timestamp: Date,         // Čas události
  note: String             // Volitelná poznámka
}
```

### 5. Loans Collection
```javascript
{
  _id: ObjectId,
  physicalBookId: ObjectId, // Reference na fyzickou kopii knihy
  readerId: ObjectId,      // Reference na čtenáře
  borrowDate: Date,        // Datum vypůjčení
  returnDate: Date         // Datum vrácení (null, pokud nevráceno)
}
```

## Relationships

- PhysicalBooks collection references Books collection using bookId
- Loans collection references PhysicalBooks and Readers using ObjectIds
- Each loan connects one physical copy of a book with one reader
- BookHistory tracks changes to physical books