import React from 'react';
import { View, Text } from 'react-native';

const FloatingTaskCard = ({ task }) => (
  <View style={{ padding: 12, borderRadius: 8, backgroundColor: '#eff6ff', marginVertical: 4 }}>
    <Text>{task?.title || 'Floating Task'}</Text>
  </View>
);

export default FloatingTaskCard;
