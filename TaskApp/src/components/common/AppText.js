import React from 'react';
import { Text } from 'react-native';

const AppText = ({ children, style, ...rest }) => (
  <Text style={[{ color: '#0f172a' }, style]} {...rest}>
    {children}
  </Text>
);

export default AppText;
