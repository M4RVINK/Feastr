import { create } from 'zustand';
import { RestaurantWithDistance } from '../services/restaurantType';

interface RestaurantStoreState {
  restaurants: RestaurantWithDistance[];
  setRestaurants: (restaurants: RestaurantWithDistance[]) => void;
}

export const useRestaurantStore = create<RestaurantStoreState>((set) => ({
  restaurants: [],
  setRestaurants: (restaurants) => set({ restaurants }),
}));
