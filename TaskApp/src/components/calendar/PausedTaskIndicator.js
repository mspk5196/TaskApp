import React from 'react';
import { View, Text } from 'react-native';

const PausedTaskIndicator = () => (
  <View style={{ padding: 4, borderRadius: 9999, backgroundColor: '#facc15' }}>
    <Text style={{ fontSize: 10 }}>Paused</Text>
  </View>
);

export default PausedTaskIndicator;
