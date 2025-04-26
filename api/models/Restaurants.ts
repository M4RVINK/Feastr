import mongoose, { Document, Schema } from 'mongoose';

// Interface for Restaurant document
export interface IRestaurant extends Document {
  name: string;
  description: string;
  tags: string[];
  cuisine: string;
  view: string[];
  seating_capacity: number;
  opening_times: any[];
  location: {
    lat: number,
    lng: number
  };
  address: {
    street: string;
    city: string;
    zip: string;
  };
  contact_info: {
    phone_number: string;
    website_url: string;
  };
  menu: [
    {
      menu_pdf_link: string;
      items: [
        {
          name: string;
          description: string;
          price: number;
          tags: string[];
          rating: number;
        }
      ];
    }
  ];
  ratings: {
    average_rating: number;
    total_reviews: number;
    detailed: {
      food: number;
      service: number;
      ambiance: number;
      value: number;
    };
  };
  popularity_score: number;
  visit_count: number;
  images: string[];
  keywords: string[];
}

// Define the Restaurant schema
const restaurantSchema: Schema<IRestaurant> = new Schema(
  {
    name: { type: String, required: true },
    description: { type: String, required: true },
    tags: [{ type: String }],
    cuisine: { type: String, required: true },
    view: [{ type: String }],
    seating_capacity: { type: Number, required: true },
    opening_times: [{ type: Schema.Types.Mixed }], 
    location: {
      lat: { type: Number, required: true }, // Latitude
      lng: { type: Number, required: true }, // Longitude
    },
    address: {
      street: { type: String, required: true },
      city: { type: String, required: true },
      zip: { type: String, required: true },
    },
    contact_info: {
      phone_number: { type: String, required: true },
      website_url: { type: String, required: true },
    },
    menu: [
      {
        menu_pdf_link: { type: String },
        items: [
          {
            name: { type: String, required: true },
            description: { type: String, required: true },
            price: { type: Number, required: true },
            tags: [{ type: String }],
            rating: { type: Number, required: true },
          },
        ],
      },
    ],
    ratings: {
      average_rating: { type: Number, required: true },
      total_reviews: { type: Number, required: true },
      detailed: {
        food: { type: Number },
        service: { type: Number },
        ambiance: { type: Number },
        value: { type: Number },
      },
    },
    popularity_score: { type: Number, required: true },
    visit_count: { type: Number, required: true },
    images: [{ type: String }],
    keywords: [{ type: String }],
  },
  { timestamps: true }
);

// Create the Restaurant model
const Restaurant = mongoose.models.Restaurant || mongoose.model<IRestaurant>('Restaurant', restaurantSchema);

export default Restaurant;
