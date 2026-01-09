import { MongoClient, Db, Collection } from 'mongodb';
import { Administrator, Reader, Book, Loan } from '../types/databaseTypes';


let client: MongoClient | null = null;
let db: Db | null = null;

let administrators: Collection<Administrator> | null = null;
let readers: Collection<Reader> | null = null;
let books: Collection<Book> | null = null;
let loans: Collection<Loan> | null = null;
/**
 * Connect to MongoDB and initialize collections
 */
export const connectDB = async (): Promise<void> => {
    if (client) return; // Already connected

    // Get MongoDB URL and database name from environment variables
    const MONGO_URL = process.env.MONGO_URL || 'mongodb://localhost:27017';
    const DATABASE_NAME = process.env.DATABASE_NAME || 'library_db';
    try {
        client = new MongoClient(MONGO_URL);
        await client.connect();

        db = client.db(DATABASE_NAME);

        // Initialize collections with type enforcement
        administrators = db.collection<Administrator>('administrators');
        readers = db.collection<Reader>('readers');
        books = db.collection<Book>('books');
        loans = db.collection<Loan>('loans');

        console.log(`Connected to MongoDB database: ${DATABASE_NAME}`);

        // Create indexes for better performance
        await setupIndexes();
    } catch (error) {
        console.error('Error connecting to MongoDB:', error);
        throw error;
    }
};

/**
 * Setup indexes for collections
 */
const setupIndexes = async (): Promise<void> => {
    if (!readers || !books || !loans) return;
    // Create unique index for library card numbers
    await readers.createIndex({ libraryCardNumber: 1 }, { unique: true });

    // Create index for book titles and authors for faster search
    await books.createIndex({ title: 1 });
    await books.createIndex({ author: 1 });

    // Create indexes for loan queries
    await loans.createIndex({ readerId: 1 });
    await loans.createIndex({ bookId: 1 });
    await loans.createIndex({ borrowedAt: 1 });
    await loans.createIndex({ dueDate: 1 });
    await loans.createIndex({ returnedAt: 1 });

};

/**
 * Close the MongoDB connection
 */
export const closeDB = async (): Promise<void> => {
    if (client) {
        await client.close();
        client = null;
        db = null;
        console.log('MongoDB connection closed');
    }
};

// **Safe getters** for top-level use
export const getDB = (): Db => {
    if (!db) throw new Error('Database not connected. Call connectDB first.');
    return db;
};

export const getAdministrators = (): Collection<Administrator> => {
    if (!administrators) throw new Error('Collections not initialized. Call connectDB first.');
    return administrators;
};

export const getReaders = (): Collection<Reader> => {
    if (!readers) throw new Error('Collections not initialized. Call connectDB first.');
    return readers;
};

export const getBooks = (): Collection<Book> => {
    if (!books) throw new Error('Collections not initialized. Call connectDB first.');
    return books;
};

export const getLoans = (): Collection<Loan> => {
    if (!loans) throw new Error('Collections not initialized. Call connectDB first.');
    return loans;
};
