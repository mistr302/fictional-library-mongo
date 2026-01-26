# Školní knihovna

Full-stack webová aplikace pro evidenci knih a výpůjček ve školní knihovně.

## Funkce

### Katalog knih
- Správa knih (název, autor, rok vydání, žánr, počet dostupných kusů)
- Zobrazení seznamu knih, filtrování podle žánru
- Vyhledávání podle názvu nebo autora
- Přidání, úprava a mazání knih (admin část)

### Čtenáři a výpůjčky
- Registrace čtenářů (jméno, třída, e-mail)
- Evidence výpůjček a vrácení knih
- Možnost "Vypůjčit knihu" a "Vrátit knihu"
- Kontrola dostupnosti knih

### Přehledy
- Seznam aktuálně vypůjčených knih
- Historie výpůjček konkrétního čtenáře

## Technologie

- Backend: Node.js s Express
- Databáze: MongoDB
- Frontend: HTML/CSS/JavaScript
- Deployment: Docker (docker-compose)

## Spuštění

```bash
docker-compose up --build
```

Aplikace bude dostupná na http://localhost:3000