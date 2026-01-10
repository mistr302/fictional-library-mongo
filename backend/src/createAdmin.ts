import dotenv from 'dotenv';
import * as readline from 'readline';
import bcrypt from 'bcrypt';
import { connectDB } from './database/db';
import { getAdministrators } from './database/db';

dotenv.config();

// Create readline interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Utility function to prompt user for input
const question = (query: string): Promise<string> => {
  return new Promise((resolve) => {
    rl.question(query, (answer) => {
      resolve(answer.trim());
    });
  });
};

// Function to create admin account
async function createAdmin(): Promise<void> {
  console.log('Creating a new administrator account...\n');

  try {
    // Get admin details from user
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

    // Simple email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      console.error('Invalid email format!');
      process.exit(1);
    }

    // Verify password twice (with masked input not supported in basic readline, just warn user)
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

    // Connect to database
    await connectDB();

    // Check if admin with email already exists
    const adminCollection = getAdministrators();
    const existingAdmin = await adminCollection.findOne({ email });

    if (existingAdmin) {
      console.error(`An administrator with email "${email}" already exists!`);
      process.exit(1);
    }

    // Get bcrypt salt rounds from environment, throw error if not provided or invalid
    if (!process.env.BCRYPT_SALT_ROUNDS) {
      throw new Error('BCRYPT_SALT_ROUNDS is not defined in environment variables');
    }

    let saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS);
    if (isNaN(saltRounds) || saltRounds <= 0) {
      throw new Error('Invalid BCRYPT_SALT_ROUNDS value in environment variables. Must be a positive integer.');
    }
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Create the admin object
    const newAdmin = {
      username,
      passwordHash,
      name,
      email,
      createdAt: new Date(),
      lastLogin: undefined
    };

    // Insert the new admin into the collection
    const result = await adminCollection.insertOne(newAdmin);

    console.log(`\n✅ Administrator created successfully!`);
    console.log(`ID: ${result.insertedId}`);
    console.log(`Username: ${username}`);
    console.log(`Name: ${name}`);
    console.log(`Email: ${email}`);

  } catch (error) {
    console.error('Error creating administrator:', error);
    process.exit(1);
  } finally {
    rl.close();
  }
}

// Run the function
createAdmin();