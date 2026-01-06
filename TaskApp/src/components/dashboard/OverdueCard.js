import React from 'react';
import { View, Text } from 'react-native';

const OverdueCard = ({ task }) => (
  <View style={{ padding: 12, borderRadius: 8, backgroundColor: '#fee2e2', marginVertical: 4 }}>
    <Text>{task?.title || 'Overdue Task'}</Text>
  </View>
);

export default OverdueCard;
