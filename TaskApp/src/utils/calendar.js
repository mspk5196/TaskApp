export const isSameDay = (a, b) => {
  const da = a instanceof Date ? a : new Date(a);
  const db = b instanceof Date ? b : new Date(b);
  return da.toDateString() === db.toDateString();
};

export const buildDaySlots = (startHour = 0, endHour = 23) => {
  const slots = [];
  for (let h = startHour; h <= endHour; h += 1) {
    slots.push({ key: h, label: `${h.toString().padStart(2, '0')}:00` });
  }
  return slots;
};
