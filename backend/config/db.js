import mongoose from 'mongoose';

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
    
    if (primaryURI !== fallbackURI) {
      try {
        console.log(`Attempting fallback connection to local MongoDB: ${fallbackURI}...`);
        const conn = await mongoose.connect(fallbackURI, {
          serverSelectionTimeoutMS: 5000
        });
        console.log(`MongoDB Connected (Fallback): ${conn.connection.host}`);
      } catch (fallbackError) {
        console.error(`Fallback Database connection error: ${fallbackError.message}`);
        console.error('Please make sure MongoDB is running locally or check your connection URI.');
        process.exit(1);
      }
    } else {
      console.error('Please make sure MongoDB is running locally or check your connection URI.');
      process.exit(1);
    }
  }
};

export default connectDB;
