import { ObjectId } from 'mongodb';
export declare enum BookState {
    DAMAGED = 0,
    SEVERELY_DAMAGED = 1,
    LOST = 2
}
export interface Administrator {
    _id?: ObjectId;
    username: string;
    passwordHash: string;
    name: string;
    email: string;
    createdAt: Date;
    lastLogin?: Date;
}
export interface Reader {
    _id?: ObjectId;
    fullName: string;
    libraryCardNumber: string;
    createdAt: Date;
}
export interface Book {
    _id?: ObjectId;
    title: string;
    author: string;
    category: string;
    publishedYear: number;
    state: BookState;
    createdAt: Date;
}
export interface Loan {
    _id?: ObjectId;
    readerId: ObjectId;
    bookId: ObjectId;
    borrowedAt: Date;
    dueDate: Date;
    returnedAt: Date | null;
}
//# sourceMappingURL=databaseTypes.d.ts.map