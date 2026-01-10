"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getLoans = exports.getBooks = exports.getReaders = exports.getAdministrators = exports.getDB = exports.closeDB = exports.connectDB = void 0;
const mongodb_1 = require("mongodb");
let client = null;
let db = null;
let administrators = null;
let readers = null;
let books = null;
let loans = null;
const connectDB = async () => {
    if (client)
        return;
    const MONGO_URL = process.env.MONGO_URL || 'mongodb://localhost:27017';
    const DATABASE_NAME = process.env.DATABASE_NAME || 'library_db';
    try {
        client = new mongodb_1.MongoClient(MONGO_URL);
        await client.connect();
        db = client.db(DATABASE_NAME);
        administrators = db.collection('administrators');
        readers = db.collection('readers');
        books = db.collection('books');
        loans = db.collection('loans');
        console.log(`Connected to MongoDB database: ${DATABASE_NAME}`);
        await setupIndexes();
    }
    catch (error) {
        console.error('Error connecting to MongoDB:', error);
        throw error;
    }
};
exports.connectDB = connectDB;
const setupIndexes = async () => {
    if (!readers || !books || !loans)
        return;
    await readers.createIndex({ libraryCardNumber: 1 }, { unique: true });
    await books.createIndex({ title: 1 });
    await books.createIndex({ author: 1 });
    await loans.createIndex({ readerId: 1 });
    await loans.createIndex({ bookId: 1 });
    await loans.createIndex({ borrowedAt: 1 });
    await loans.createIndex({ dueDate: 1 });
    await loans.createIndex({ returnedAt: 1 });
};
const closeDB = async () => {
    if (client) {
        await client.close();
        client = null;
        db = null;
        console.log('MongoDB connection closed');
    }
};
exports.closeDB = closeDB;
const getDB = () => {
    if (!db)
        throw new Error('Database not connected. Call connectDB first.');
    return db;
};
exports.getDB = getDB;
const getAdministrators = () => {
    if (!administrators)
        throw new Error('Collections not initialized. Call connectDB first.');
    return administrators;
};
exports.getAdministrators = getAdministrators;
const getReaders = () => {
    if (!readers)
        throw new Error('Collections not initialized. Call connectDB first.');
    return readers;
};
exports.getReaders = getReaders;
const getBooks = () => {
    if (!books)
        throw new Error('Collections not initialized. Call connectDB first.');
    return books;
};
exports.getBooks = getBooks;
const getLoans = () => {
    if (!loans)
        throw new Error('Collections not initialized. Call connectDB first.');
    return loans;
};
exports.getLoans = getLoans;
//# sourceMappingURL=db.js.map