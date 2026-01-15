import { create } from 'zustand';
import { toast } from 'react-hot-toast';

export const useStoreStatus = create((set, get) => ({
  // Store status state
  storeStatus: null, // { storeId, is_open, storeName }
  isLoading: false,
  error: null,

  // Actions
  setStoreStatus: (status) => set({ storeStatus: status }),
  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),

  // Update store status (toggle open/closed)
  updateStoreStatus: async (isOpen) => {
    const { storeStatus } = get();
    if (!storeStatus) return;

    set({ isLoading: true, error: null });

    try {
      const response = await fetch('/api/stores/status', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ is_open: isOpen }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Không thể cập nhật trạng thái quán');
      }

      // Update local state
      set({
        storeStatus: {
          ...storeStatus,
          is_open: isOpen
        },
        isLoading: false
      });

      // Show success toast
      toast.success(data.message);

      return { success: true };
    } catch (error) {
      console.error('Update store status error:', error);
      set({ error: error.message, isLoading: false });
      toast.error(error.message);
      return { success: false, error: error.message };
    }
  },

  // Fetch current store status
  fetchStoreStatus: async () => {
    set({ isLoading: true, error: null });

    try {
      const response = await fetch('/api/stores/my-store', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Không thể tải trạng thái quán');
      }

      const storeData = data.data;
      set({
        storeStatus: {
          storeId: storeData.id,
          is_open: storeData.is_open,
          storeName: storeData.storeName
        },
        isLoading: false
      });

      return { success: true, data: storeData };
    } catch (error) {
      console.error('Fetch store status error:', error);
      set({ error: error.message, isLoading: false });
      return { success: false, error: error.message };
    }
  },

  // Initialize store status for dashboard
  initializeStoreStatus: async () => {
    const { fetchStoreStatus } = get();
    await fetchStoreStatus();
  },

  // Clear store status (on logout)
  clearStoreStatus: () => set({
    storeStatus: null,
    isLoading: false,
    error: null
  })
}));
