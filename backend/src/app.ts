import express from 'express';
import { bookRouter } from './routes/bookRoutes';
import { readerRouter } from './routes/readerRoutes';
import { loanRouter } from './routes/loanRoutes';
import { authRouter } from './routes/authRoutes';

const app = express();

// Routes
app.use('/api', authRouter);
app.use('/api', bookRouter);
app.use('/api', readerRouter);
app.use('/api', loanRouter);

export { app };
