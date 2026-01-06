import React from 'react';
import { View, Text, Button } from 'react-native';

const AcceptTaskModal = ({ onClose }) => (
  <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
    <Text>Accept Task (TODO)</Text>
    <Button title="Close" onPress={onClose} />
  </View>
);

export default AcceptTaskModal;
