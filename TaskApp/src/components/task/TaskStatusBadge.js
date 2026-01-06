import React from 'react';
import { View, Text } from 'react-native';

const TaskStatusBadge = ({ status = 'PENDING' }) => (
  <View style={{ paddingHorizontal: 8, paddingVertical: 4, borderRadius: 9999, backgroundColor: '#e5e7eb' }}>
    <Text style={{ fontSize: 12 }}>{status}</Text>
  </View>
);

export default TaskStatusBadge;
