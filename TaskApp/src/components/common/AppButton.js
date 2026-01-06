import React from 'react';
import { TouchableOpacity, Text } from 'react-native';

const AppButton = ({ title, onPress, style, textStyle }) => (
  <TouchableOpacity
    style={[{ paddingVertical: 12, paddingHorizontal: 16, borderRadius: 8, backgroundColor: '#3B82F6' }, style]}
    onPress={onPress}
  >
    <Text style={[{ color: 'white', textAlign: 'center', fontWeight: '600' }, textStyle]}>{title}</Text>
  </TouchableOpacity>
);

export default AppButton;
