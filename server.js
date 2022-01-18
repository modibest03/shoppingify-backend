import mongoose from 'mongoose';
import dotenv from 'dotenv';

process.on('uncaughtException', (err) => {
  console.log(err.name, err.message);
  console.log('UNCAUGHT Exception! Shutting down....');
  process.exit(1);
});

dotenv.config({ path: './config.env' });
import app from './app.js';

const PORT = process.env.PORT || 5000;

mongoose
  .connect(process.env.DATABASE_PROD, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then((con) => console.log('DB connection successful!'));

const server = app.listen(PORT, () =>
  console.log(`Server running on port: ${PORT}`)
);

process.on('unhandledRejection', (err) => {
  console.log(err.name, err.message);
  console.log('UNHANDLED REJECTION! Shutting down');
  server.close(() => process.exit(1));
});
