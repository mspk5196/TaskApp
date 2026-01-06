import React from 'react';
import { View, Text, Button } from 'react-native';

const ReassignTaskModal = ({ onClose }) => (
  <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
    <Text>Reassign Task (TODO)</Text>
    <Button title="Close" onPress={onClose} />
  </View>
);

export default ReassignTaskModal;
