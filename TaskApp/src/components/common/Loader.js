import React from 'react';
import { View, ActivityIndicator } from 'react-native';

const Loader = () => (
  <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
    <ActivityIndicator size="large" color="#3B82F6" />
  </View>
);

export default Loader;
