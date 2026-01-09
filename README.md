# School Library System

## Description

sdsd

## MongoDB requirements
### MongoDB

- Databáze např. library_db s kolekcemi books, readers, loans.
- Využití referencí (ObjectId) mezi výpůjčkou a knihou/čtenářem nebo vnořených dokumentů (dle zadání vyučujícího).​

## Backend API endpoints

### General Context

#### Authorization

    - handled by JWT tokens which include information { expiration, admin_id } 
    - expiration is in 7 days of generating each token 
    
### Endpoint Context

Each endpoint is protected by authorization cookie.
Each endpoint can return these status codes on failure unless stated otherwise:

- 401(Unauthorized)
- 400(Bad Request)

### Endpoints

- POST /api/login -> 200 Cookie-Set: auth-token

- GET /api/books, CRUD(POST /api/books, PUT /api/books/:id, DELETE /api/books/:id)

- GET /api/readers, POST /api/readers

- POST /api/loans (create a loan), POST /api/loans/:id/return (return loan)

### MongoDB collection definitions

Administrator

```js
{
  "_id": ObjectId(),
  "username": "admin1",
  "passwordHash": "<hashed_password>",   // never store plain text
  "name": "Alice Smith",
  "email": "alice@school.edu",
  "createdAt": ISODate("2026-01-09T10:00:00Z"),
  "lastLogin": ISODate("2026-01-09T15:00:00Z")
}
```

Readers

```js
{
  "_id": ObjectId(),
  "fullName": "John Doe",
  "libraryCardNumber": "RC1001",  // unique identifier
  "createdAt": ISODate("2026-01-09T10:00:00Z")
}
```

Books
(for further context on BookState)

```js
    enum BookState {
       DAMAGED = 0,
       SEVERELY_DAMAGED = 1,
       LOST = 2,
    }
```

```js
{
  "_id": ObjectId(),
  "title": "Harry Potter and the Sorcerer's Stone",
  "author": "J.K. Rowling",
  "category": "Fantasy",
  "publishedYear": 1997,
  "state": BookState,
  "createdAt": ISODate("2026-01-09T10:00:00Z")
}
```

Borrowing Records

```js
{
  "_id": ObjectId(),
  "readerId": ObjectId("..."),  // reference to Readers
  "bookId": ObjectId("..."),    // reference to Books
  "borrowedAt": ISODate("2026-01-09T10:00:00Z"),
  "dueDate": ISODate("2026-02-09T10:00:00Z"),
  "returnedAt": null            // null if not yet returned
}
```

## Frontend

Jednoduché UI určené pro práci na školním PC (přehlednost před designem).

### Endpoints

- GET /login = Login page
- GET /catalogue = „Katalog knih“ s filtrem a vyhledáváním
- GET /active-loans = Stránka „Výpůjčky“ s možností zadat čtenáře a knihu, přehled aktuálních výpůjček.
