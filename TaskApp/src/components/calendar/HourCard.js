import React from 'react';
import { View, Text } from 'react-native';

const HourCard = ({ label }) => (
  <View style={{ padding: 8, borderBottomWidth: 1, borderColor: '#e5e7eb' }}>
    <Text>{label}</Text>
  </View>
);

export default HourCard;
