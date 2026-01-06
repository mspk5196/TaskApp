import React from 'react';
import { View, Text } from 'react-native';

const ErrorScreen = ({ message = 'Something went wrong' }) => (
  <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
    <Text>{message}</Text>
  </View>
);

export default ErrorScreen;
