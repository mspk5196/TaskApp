import React from 'react';
import { View, Text } from 'react-native';

const TaskHeader = ({ title }) => (
  <View style={{ paddingVertical: 12 }}>
    <Text style={{ fontSize: 18, fontWeight: '700' }}>{title || 'Task'}</Text>
  </View>
);

export default TaskHeader;
