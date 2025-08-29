import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const connectDB = async () => {
  try {
    const MONGODB_URI = process.env.MONGO_URI;

    if (!MONGODB_URI) {
      console.error('FATAL ERROR: MONGO_URI is not defined in the environment variables.');
      process.exit(1);
    }

    // Mongoose connection options (optional but recommended)
    const options = {
      // useNewUrlParser: true, // No longer needed in Mongoose 6+
      // useUnifiedTopology: true, // No longer needed in Mongoose 6+
      serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
    };

    await mongoose.connect(MONGODB_URI, options);

    console.log('Successfully connected to MongoDB.');

  } catch (error) {
    console.error('FATAL ERROR: Could not connect to MongoDB.');
    console.error(error);
    process.exit(1); // Exit process with failure
  }
};

export default connectDB;