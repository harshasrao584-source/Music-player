import mongoose from 'mongoose';
import { runSeed } from '../utils/seed.js';

let mongod = null;

const connectDB = async () => {
  const primaryURI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/melodyai';
  const fallbackURI = 'mongodb://127.0.0.1:27017/melodyai';

  try {
    console.log(`Connecting to MongoDB: ${primaryURI}...`);
    const conn = await mongoose.connect(primaryURI, {
      serverSelectionTimeoutMS: 5000
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Database connection error: ${error.message}`);
    
    let localConnected = false;
    if (primaryURI !== fallbackURI) {
      try {
        console.log(`Attempting fallback connection to local MongoDB: ${fallbackURI}...`);
        const conn = await mongoose.connect(fallbackURI, {
          serverSelectionTimeoutMS: 5000
        });
        console.log(`MongoDB Connected (Fallback): ${conn.connection.host}`);
        localConnected = true;
      } catch (fallbackError) {
        console.error(`Fallback Database connection error: ${fallbackError.message}`);
      }
    }

    if (!localConnected) {
      if (process.env.NODE_ENV === 'production') {
        console.error('All database connections failed. Exiting production process.');
        process.exit(1);
      }
      try {
        console.log('Starting local in-memory MongoDB database server (with 60s launch timeout)...');
        const { MongoMemoryServer } = await import('mongodb-memory-server');
        mongod = await MongoMemoryServer.create({
          instance: {
            launchTimeout: 60000
          }
        });
        const uri = mongod.getUri();
        console.log(`Connecting to in-memory MongoDB at: ${uri}`);
        const conn = await mongoose.connect(uri);
        console.log(`MongoDB Connected (In-Memory): ${conn.connection.host}`);

        // Seed in-memory database since it starts empty
        console.log('Seeding in-memory database with standard tracks...');
        await runSeed(uri, false);
        console.log('In-memory database seeded successfully!');
      } catch (memError) {
        console.error(`Failed to start in-memory MongoDB: ${memError.message}`);
        console.error('Please make sure MongoDB is running locally or check your connection URI.');
        process.exit(1);
      }
    }
  }
};

export default connectDB;
