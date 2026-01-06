import React from 'react';
import { TouchableOpacity, Text } from 'react-native';

const TimeSlot = ({ slot, onPress }) => (
  <TouchableOpacity
    style={{ padding: 8, marginVertical: 4, borderRadius: 6, backgroundColor: '#e0f2fe' }}
    onPress={() => onPress?.(slot)}
  >
    <Text>{slot?.label || 'Time Slot'}</Text>
  </TouchableOpacity>
);

export default TimeSlot;
