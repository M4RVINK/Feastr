import { create } from 'zustand';
import { Config } from '../config/config';

interface FavoriteStore {
  favoriteIds: string[];
  setFavorites: (ids: string[]) => void;
  toggleFavorite: (id: string, userId: string) => Promise<void>;
  fetchFavorites: (userId: string) => Promise<void>;
}

export const useFavoriteStore = create<FavoriteStore>((set, get) => ({
  favoriteIds: [],
  setFavorites: (ids) => set({ favoriteIds: ids }),

  toggleFavorite: async (id, userId) => {
    const { favoriteIds } = get();
    const isFavorite = favoriteIds.includes(id);

    try {
      const endpoint = isFavorite ? `${Config.API_URL}/api/removeFavorite` : `${Config.API_URL}/api/addFavorite`;
      await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, restaurantId: id }),
      });

      // ✅ After updating, fetch fresh favorites
      await get().fetchFavorites(userId);

    } catch (error) {
      console.error('Failed to update favorites:', error);
    }
  },

  fetchFavorites: async (userId) => {
    try {
      const response = await fetch(`${Config.API_URL}/api/getFavorites/${userId}`);
      const favorites = await response.json();

      const ids = favorites.map((restaurant: any) => restaurant._id);
      set({ favoriteIds: ids });
    } catch (error) {
      console.error('Failed to fetch favorites:', error);
    }
  }
}));
