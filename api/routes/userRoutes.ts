import { Router, Request, Response } from 'express';
import User from "../models/Users";
import mongoose from 'mongoose';

const router = Router();

router.post('/users', async (req: Request, res: Response): Promise<void> => {
  try {
    const { firebaseUid, fullName, email } = req.body;

    if (!firebaseUid || !fullName || !email) {
      res.status(400).json({ message: 'Please provide firebaseUid, fullName, and email.' });
      return;
    }

    const existingUser = await User.findOne({ firebaseUid });
    if (existingUser) {
      res.status(400).json({ message: 'User already exists.' });
      return;
    }

    const newUser = new User({ firebaseUid, fullName, email, likedRestaurants: [] });
    await newUser.save();
    res.status(201).json(newUser);
  } catch (error) {
    console.error('Error saving user to database:', error);
    res.status(500).json({ message: 'Error saving user to database.' });
  }
});


router.get('/users/:firebaseUid', async (req: Request, res: Response): Promise<void> => {
    try {
      const { firebaseUid } = req.params;
  
      // Validate firebaseUid format (adjust regex as needed)
      if (!firebaseUid || !/^[a-zA-Z0-9_-]{28}$/.test(firebaseUid)) {
        res.status(400).json({ message: 'Invalid Firebase UID format' });
        return;
      }
  
      const user = await User.findOne({ firebaseUid })
        .select('fullName email') // Only return necessary fields
        .lean(); // Convert to plain JS object
  
      if (!user) {
        res.status(404).json({ message: 'User not found' });
        return;
      }
  
      res.json(user);
    } catch (error) {
      console.error('GET /users error:', error);
    }
  });

// Add Favorite
router.post('/addFavorite', async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId, restaurantId } = req.body;
    if (!userId || !restaurantId) {
      res.status(400).json({ message: 'Missing parameters.' });
      return;
    }

    await User.findOneAndUpdate(
      { firebaseUid: userId },        
      { $addToSet: { likedRestaurants: restaurantId } }
    );
    
    res.status(200).json({ message: 'Added to favorites.' });
  } catch (error) {
    console.error('Error adding favorite:', error);
    res.status(500).json({ message: 'Server error.' });
  }
});

// Remove Favorite
router.post('/removeFavorite', async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId, restaurantId } = req.body;
    if (!userId || !restaurantId) {
      res.status(400).json({ message: 'Missing parameters.' });
      return;
    }

    await User.findOneAndUpdate(
      { firebaseUid: userId },        
      { $pull: { likedRestaurants: restaurantId } }
    );

    res.status(200).json({ message: 'Removed from favorites.' });
  } catch (error) {
    console.error('Error removing favorite:', error);
    res.status(500).json({ message: 'Server error.' });
  }
});

// Get User's Favorites
router.get('/getFavorites/:userId', async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;

    if (!userId) {
      res.status(400).json({ message: 'Missing userId' });
      return;
    }

    const user = await User.findOne({ firebaseUid: userId }).populate('likedRestaurants');
    
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    res.status(200).json(user.likedRestaurants);
  } catch (error) {
    console.error('Error fetching favorites:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;