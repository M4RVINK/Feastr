import mongoose, { Document, Schema } from 'mongoose';

// Defining the interface for the User document
export interface IUser extends Document {
  firebaseUid: string;  // Firebase UID for unique identification
  email: string;        // User's email
  fullName: string;     // User's full name
  likedRestaurants: mongoose.Schema.Types.ObjectId[];  // List of restaurant IDs the user likes (to be populated later)
}

// Define the user schema
const userSchema: Schema<IUser> = new Schema(
  {
    firebaseUid: { type: String, required: true, unique: true },  // Unique ID from Firebase
    email: { type: String, required: true, unique: true },
    fullName: { type: String, required: true },
    likedRestaurants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant' }],  // References to Restaurant model (future implementation)
  },
  { timestamps: true }
);

// Create the User model
const User = mongoose.models.User || mongoose.model<IUser>('User', userSchema);

export default User;
