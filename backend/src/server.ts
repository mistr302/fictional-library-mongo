import dotenv from 'dotenv';
dotenv.config();

import { run } from './app';

const PORT = process.env.PORT || 3000;
run(PORT);
