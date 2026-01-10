"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const readline = __importStar(require("readline"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const db_1 = require("./database/db");
const db_2 = require("./database/db");
dotenv_1.default.config();
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});
const question = (query) => {
    return new Promise((resolve) => {
        rl.question(query, (answer) => {
            resolve(answer.trim());
        });
    });
};
async function createAdmin() {
    console.log('Creating a new administrator account...\n');
    try {
        const username = await question('Enter username: ');
        if (!username) {
            console.error('Username is required!');
            process.exit(1);
        }
        const name = await question('Enter full name: ');
        if (!name) {
            console.error('Name is required!');
            process.exit(1);
        }
        const email = await question('Enter email: ');
        if (!email) {
            console.error('Email is required!');
            process.exit(1);
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            console.error('Invalid email format!');
            process.exit(1);
        }
        console.log('(Note: Password will appear in console for security)');
        const password = await question('Enter password: ');
        if (!password) {
            console.error('Password is required!');
            process.exit(1);
        }
        const confirmPassword = await question('Confirm password: ');
        if (password !== confirmPassword) {
            console.error('Passwords do not match!');
            process.exit(1);
        }
        console.log('\nCreating administrator account...');
        await (0, db_1.connectDB)();
        const adminCollection = (0, db_2.getAdministrators)();
        const existingAdmin = await adminCollection.findOne({ email });
        if (existingAdmin) {
            console.error(`An administrator with email "${email}" already exists!`);
            process.exit(1);
        }
        if (!process.env.BCRYPT_SALT_ROUNDS) {
            throw new Error('BCRYPT_SALT_ROUNDS is not defined in environment variables');
        }
        let saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS);
        if (isNaN(saltRounds) || saltRounds <= 0) {
            throw new Error('Invalid BCRYPT_SALT_ROUNDS value in environment variables. Must be a positive integer.');
        }
        const passwordHash = await bcrypt_1.default.hash(password, saltRounds);
        const newAdmin = {
            username,
            passwordHash,
            name,
            email,
            createdAt: new Date(),
            lastLogin: undefined
        };
        const result = await adminCollection.insertOne(newAdmin);
        console.log(`\n✅ Administrator created successfully!`);
        console.log(`ID: ${result.insertedId}`);
        console.log(`Username: ${username}`);
        console.log(`Name: ${name}`);
        console.log(`Email: ${email}`);
    }
    catch (error) {
        console.error('Error creating administrator:', error);
        process.exit(1);
    }
    finally {
        rl.close();
    }
}
createAdmin();
//# sourceMappingURL=createAdmin.js.map