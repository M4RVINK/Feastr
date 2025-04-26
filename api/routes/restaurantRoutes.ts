import { Router, Request, Response } from 'express';
import Restaurant from '../models/Restaurants';
import { Types } from 'mongoose';

const router = Router();

router.post('/addRestaurant', async (req: Request, res: Response): Promise<void> => {
  try {
    // Destructure the necessary fields from the request body
    const {
      name,
      description,
      tags,
      cuisine,
      view,
      seating_capacity,
      opening_times,
      location,
      address,
      contact_info,
      menu,
      ratings,
      popularity_score,
      visit_count,
      images,
      keywords
    } = req.body;

    // Basic validation
    if (!name || !location || !address || !contact_info || !menu || !ratings) {
      res.status(400).json({ message: 'Missing required fields.' });
      return;
    }

    // Create a new restaurant document
    const newRestaurant = new Restaurant({
      name,
      description,
      tags,
      cuisine,
      view,
      seating_capacity,
      opening_times,
      location,
      address,
      contact_info,
      menu,
      ratings,
      popularity_score,
      visit_count,
      images,
      keywords
    });

    // Save the restaurant to the database
    await newRestaurant.save();

    // Send a success response
    res.status(201).json({ message: 'Restaurant added successfully', data: newRestaurant });
  } catch (error: unknown) {
    // Handle errors
    if (error instanceof Error) {
      console.error('Error adding restaurant:', error.message);
      res.status(500).json({ message: 'Error adding restaurant', error: error.message });
    } else {
      console.error('Unknown error:', error);
      res.status(500).json({ message: 'Unknown error occurred while adding restaurant' });
    }
  }
});

router.get('/getRestaurant', async (req: Request, res: Response) => {
  try {
    // 1. Parse the fields query parameter
    const fields = req.query.fields as string | undefined;
    const requiredFields = ['name', 'cuisine', 'images', 'ratings', 'location', 'menu'];

    // 2. Create projection object
    const projection: Record<string, 1> = { 
      _id: 1 // Always include _id
    };

    // 3. If fields specified, use them; otherwise use default fields
    const fieldsToInclude = fields 
      ? fields.split(',').map(f => f.trim()) 
      : requiredFields;

    // 4. Build projection dynamically
    fieldsToInclude.forEach(field => {
      if (field.includes('.')) {
        const [parent, child] = field.split('.');
        projection[`${parent}.${child}`] = 1;
      } else {
        projection[field] = 1;
      }
    });    

    // 5. Execute query with projection
    const restaurants = await Restaurant.find({}, projection).lean().exec();

    // 6. Transform data - simplified version
    const transformedRestaurants = restaurants.map(restaurant => ({
      ...restaurant,
      _id: (restaurant._id as Types.ObjectId).toString() // Type assertion
    }));

    res.status(200).json(transformedRestaurants);

  } catch (error: unknown) {
    console.error('Failed to fetch restaurants:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to fetch restaurants',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;