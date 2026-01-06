import useCalendarStore from '../store/calendar.store';

const useCalendar = () => {
  const slots = useCalendarStore((s) => s.slots);
  const setSlots = useCalendarStore((s) => s.setSlots);
  return { slots, setSlots };
};

export default useCalendar;
