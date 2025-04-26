export interface Location {
    lat: number;
    lng: number;
  }
  
  export interface Address {
    street: string;
    city: string;
    zip: string;
  }
  
  export interface ContactInfo {
    phone_number: string;
    website_url: string;
  }
  
  export interface MenuItem {
    name: string;
    description: string;
    price: number;
    tags: string[];
    rating: number;
  }
  
  export interface MenuSection {
    menu_pdf_link: string;
    items: MenuItem[];
  }
  
  export interface RatingDetails {
    food: number;
    service: number;
    ambiance: number;
    value: number;
  }
  
  export interface Ratings {
    average_rating: number;
    total_reviews: number;
    detailed: RatingDetails;
  }
  
  export interface Restaurant {
    _id: string;
    name: string;
    description: string;
    tags: string[];
    cuisine: string;
    view: string[];
    seating_capacity: number;
    opening_times: any[];
    location: Location;
    address: Address;
    contact_info: ContactInfo;
    menu: MenuSection[];
    ratings: Ratings;
    popularity_score: number;
    visit_count: number;
    images: string[];
    keywords: string[];
  }
  
  export interface RestaurantWithDistance extends Restaurant {
    distance: string;
    duration: string;
    price: string;
    //id?: string;
  }