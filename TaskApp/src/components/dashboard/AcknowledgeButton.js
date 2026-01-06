import React from 'react';
import { TouchableOpacity, Text } from 'react-native';

const AcknowledgeButton = ({ onPress }) => (
  <TouchableOpacity
    style={{ paddingVertical: 8, paddingHorizontal: 16, borderRadius: 9999, backgroundColor: '#22c55e' }}
    onPress={onPress}
  >
    <Text style={{ color: 'white', fontWeight: '600' }}>Acknowledge</Text>
  </TouchableOpacity>
);

export default AcknowledgeButton;
