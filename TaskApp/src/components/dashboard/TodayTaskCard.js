import React from 'react';
import { View, Text } from 'react-native';

const TodayTaskCard = ({ task }) => (
  <View style={{ padding: 12, borderRadius: 8, backgroundColor: 'white', marginVertical: 4 }}>
    <Text>{task?.title || 'Today Task'}</Text>
  </View>
);

export default TodayTaskCard;
