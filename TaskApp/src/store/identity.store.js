import { create } from 'zustand';

const useIdentityStore = create((set) => ({
  currentIdentity: null,
  setCurrentIdentity: (identity) => set({ currentIdentity: identity }),
}));

export default useIdentityStore;
