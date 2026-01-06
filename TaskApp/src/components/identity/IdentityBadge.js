import React from 'react';
import { View, Text } from 'react-native';

const IdentityBadge = ({ label }) => (
  <View style={{ paddingHorizontal: 8, paddingVertical: 4, borderRadius: 9999, backgroundColor: '#e5e7eb' }}>
    <Text>{label || 'Identity'}</Text>
  </View>
);

export default IdentityBadge;
