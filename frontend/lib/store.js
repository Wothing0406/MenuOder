import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useStore = create(
  persist(
    (set) => ({
      token: null,
      user: null,
      store: null,

      setToken: (token) => set({ token }),
      setUser: (user) => set({ user }),
      setStore: (store) => set({ store }),

      logout: () => set({ token: null, user: null, store: null }),
    }),
    {
      name: 'auth-store',
    }
  )
);

export const useCart = create((set, get) => ({
  items: [],
  total: 0,

  addItem: (item) => {
    const { items } = get();
    // Check if item with same id, options, and accompaniments already exists
    const existingItem = items.find((i) => 
      i.itemId === item.itemId &&
      JSON.stringify(i.selectedOptions) === JSON.stringify(item.selectedOptions) &&
      JSON.stringify(i.selectedAccompaniments) === JSON.stringify(item.selectedAccompaniments)
    );

    if (existingItem) {
      const updatedItems = items.map((i) =>
        i.id === existingItem.id 
          ? { ...i, quantity: i.quantity + item.quantity, subtotal: i.basePrice * (i.quantity + item.quantity) }
          : i
      );
      set({ items: updatedItems });
    } else {
      set({ items: [...items, item] });
    }

    const newItems = get().items;
    const newTotal = newItems.reduce((acc, item) => acc + item.subtotal, 0);
    set({ total: parseFloat(newTotal.toFixed(2)) });
  },

  removeItem: (itemId) => {
    const { items } = get();
    const newItems = items.filter((i) => i.id !== itemId);
    set({ items: newItems });

    const newTotal = newItems.reduce((acc, item) => acc + item.subtotal, 0);
    set({ total: parseFloat(newTotal.toFixed(2)) });
  },

  updateItem: (itemId, quantity) => {
    const { items } = get();
    const newItems = items.map((i) =>
      i.id === itemId ? { ...i, quantity: Math.max(1, quantity), subtotal: i.basePrice * Math.max(1, quantity) } : i
    );
    set({ items: newItems });

    const newTotal = newItems.reduce((acc, item) => acc + item.subtotal, 0);
    set({ total: parseFloat(newTotal.toFixed(2)) });
  },

  clearCart: () => set({ items: [], total: 0 }),
}));
