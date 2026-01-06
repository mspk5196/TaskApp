import React from 'react';
import { View, Text } from 'react-native';

const ConflictWarning = ({ message = 'This slot conflicts with another task.' }) => (
  <View style={{ padding: 8, borderRadius: 6, backgroundColor: '#fee2e2' }}>
    <Text style={{ color: '#b91c1c' }}>{message}</Text>
  </View>
);

export default ConflictWarning;
