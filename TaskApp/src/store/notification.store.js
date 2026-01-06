import { create } from 'zustand';

const useNotificationStore = create((set) => ({
  notifications: [],
  setNotifications: (notifications) => set({ notifications }),
}));

export default useNotificationStore;
