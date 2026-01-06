import React from 'react';
import { View, Text } from 'react-native';

const EmptyStateScreen = ({ message = 'No data available' }) => (
  <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
    <Text>{message}</Text>
  </View>
);

export default EmptyStateScreen;
