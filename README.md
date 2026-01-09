# School Library System

## Description

sdsd

## MongoDB requirements

### MongoDB

- Databáze např. library_db s kolekcemi books, readers, loans.
- Využití referencí (ObjectId) mezi výpůjčkou a knihou/čtenářem nebo vnořených dokumentů (dle zadání vyučujícího).​

## Backend API endpoints

### Context

Each endpoint is protected by authentication cookie.
Each endpoint can return these status codes on failure unless stated otherwise:

- 401(Unauthenticated)
- 400(Bad Request)

### Endpoints

- POST /api/login -> 200 Cookie-Set: auth-token

- GET /api/books, CRUD(POST /api/books, PUT /api/books/:id, DELETE /api/books/:id)

- GET /api/readers, POST /api/readers

- POST /api/loans (create a loan), POST /api/loans/:id/return (return loan)

## Frontend

Jednoduché UI určené pro práci na školním PC (přehlednost před designem).​

### Endpoints

- GET /login = Login page
- GET /catalogue = „Katalog knih“ s filtrem a vyhledáváním
- GET /active-loans = Stránka „Výpůjčky“ s možností zadat čtenáře a knihu, přehled aktuálních výpůjček.
