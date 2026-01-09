import express from 'express';
import { bookRouter } from './routes/bookRoutes';
import { readerRouter } from './routes/readerRoutes';
import { loanRouter } from './routes/loanRoutes';
import { authRouter } from './routes/authRoutes';
import { connectDB } from './database/db';
async function run(port: number | string) {
    console.log("Attempting to connect to MongoDB..\nIf Mongo isnt running on your instance its possible that the application will get stuck here");
    await connectDB();

    const app = express();
    // Routes
    app.use('/api', authRouter);
    app.use('/api', bookRouter);
    app.use('/api', readerRouter);
    app.use('/api', loanRouter);
    app.listen(port, () => {
        console.log(`Server is running on port ${port}`);
    });
}
export { run };
