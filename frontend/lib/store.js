import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useStore = create(
  persist(
    (set, get) => ({
      token: null,
      user: null,
      store: null,
      deviceId: null, // Device identifier for session management

      setToken: (token) => {
        set({ token });
        // Sync với localStorage để đảm bảo consistency
        if (typeof window !== 'undefined') {
          if (token) {
            localStorage.setItem('token', token);
          } else {
            localStorage.removeItem('token');
          }
        }
      },
      setUser: (user) => set({ user }),
      setStore: (store) => set({ store }),
      
      // Initialize device ID if not exists
      initDeviceId: () => {
        const { deviceId } = get();
        if (!deviceId && typeof window !== 'undefined') {
          // Generate or retrieve device ID
          let storedDeviceId = localStorage.getItem('deviceId');
          if (!storedDeviceId) {
            storedDeviceId = `device_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            localStorage.setItem('deviceId', storedDeviceId);
          }
          set({ deviceId: storedDeviceId });
          return storedDeviceId;
        }
        return deviceId;
      },

      logout: () => {
        set({ token: null, user: null, store: null });
        // Clear localStorage
        if (typeof window !== 'undefined') {
          localStorage.removeItem('token');
          // Keep deviceId for future logins
        }
      },
    }),
    {
      name: 'auth-store',
      // Only persist these fields
      partialize: (state) => ({
        token: state.token,
        user: state.user,
        store: state.store,
        deviceId: state.deviceId,
      }),
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

    let newItems;
    if (existingItem) {
      newItems = items.map((i) =>
        i.id === existingItem.id 
          ? { ...i, quantity: i.quantity + item.quantity, subtotal: i.basePrice * (i.quantity + item.quantity) }
          : i
      );
    } else {
      newItems = [...items, item];
    }

    const newTotal = newItems.reduce((acc, item) => acc + item.subtotal, 0);
    set({ items: newItems, total: parseFloat(newTotal.toFixed(2)) });
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
