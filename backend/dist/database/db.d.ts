import { Db, Collection } from 'mongodb';
import { Administrator, Reader, Book, Loan } from '../types/databaseTypes';
export declare const connectDB: () => Promise<void>;
export declare const closeDB: () => Promise<void>;
export declare const getDB: () => Db;
export declare const getAdministrators: () => Collection<Administrator>;
export declare const getReaders: () => Collection<Reader>;
export declare const getBooks: () => Collection<Book>;
export declare const getLoans: () => Collection<Loan>;
//# sourceMappingURL=db.d.ts.map