import { create } from 'zustand';

const useCalendarStore = create((set) => ({
  slots: [],
  setSlots: (slots) => set({ slots }),
}));

export default useCalendarStore;
