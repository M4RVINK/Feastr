import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import userRoutes from './routes/userRoutes'; 

dotenv.config();

const app = express();
export const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;
export const IP = process.env.IP;

if (!MONGO_URI) {
  console.error('MONGO_URI not found in environment variables');
  process.exit(1);
}

// CORS setup for testing now, fix it later when deploying
app.use(cors({
  origin: '*', 
  credentials: false,
}));

app.use(express.json());

app.use('/api', userRoutes); 

app.get('/test', (req, res) => {
  res.send('Server is connected correctly!');
});

const startServer = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log(' Connected to MongoDB');

    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://${IP}:${PORT}`);
    });
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

startServer();
