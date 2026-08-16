import dotenv from 'dotenv';
import mongoose from 'mongoose';
import fs from 'fs';

dotenv.config();

function log(msg) {
  console.log(msg);
  fs.appendFileSync('test-result.txt', msg + '\n');
}

fs.writeFileSync('test-result.txt', 'Starting test...\n');
log('Testing connection to URI: ' + process.env.MONGODB_URI);

try {
  const conn = await mongoose.connect(process.env.MONGODB_URI, {
    serverSelectionTimeoutMS: 15000
  });
  log('SUCCESS! Connected to MongoDB host: ' + conn.connection.host);
  process.exit(0);
} catch (err) {
  log('FAILED to connect to MongoDB Atlas: ' + err.message);
  process.exit(1);
}
