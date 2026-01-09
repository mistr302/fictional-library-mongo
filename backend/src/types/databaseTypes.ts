import { ObjectId } from 'mongodb';

// Enum for book states
export enum BookState {
  DAMAGED = 0,
  SEVERELY_DAMAGED = 1,
  LOST = 2,
}

// Interface for Administrator collection
export interface Administrator {
  _id?: ObjectId;
  username: string;
  passwordHash: string;   // never store plain text
  name: string;
  email: string;
  createdAt: Date;
  lastLogin?: Date;
}

// Interface for Readers collection
export interface Reader {
  _id?: ObjectId;
  fullName: string;
  libraryCardNumber: string;  // unique identifier
  createdAt: Date;
}

// Interface for Books collection
export interface Book {
  _id?: ObjectId;
  title: string;
  author: string;
  category: string;
  publishedYear: number;
  state: BookState;
  createdAt: Date;
}

// Interface for Borrowing Records collection
export interface Loan {
  _id?: ObjectId;
  readerId: ObjectId;  // reference to Readers
  bookId: ObjectId;    // reference to Books
  borrowedAt: Date;
  dueDate: Date;
  returnedAt: Date | null;  // null if not yet returned
}