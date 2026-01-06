import { create } from 'zustand';

const useSubscriptionStore = create((set) => ({
  subscriptions: [],
  setSubscriptions: (subscriptions) => set({ subscriptions }),
}));

export default useSubscriptionStore;
