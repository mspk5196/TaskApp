import React from 'react';
import { View, Text } from 'react-native';

const CriteriaRenderer = ({ criteria }) => (
  <View>
    <Text>{criteria || 'Criteria (TODO)'}</Text>
  </View>
);

export default CriteriaRenderer;
