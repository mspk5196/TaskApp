import React from 'react';
import { View, Text, Button } from 'react-native';

const RejectTaskModal = ({ onClose }) => (
  <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
    <Text>Reject Task (TODO)</Text>
    <Button title="Close" onPress={onClose} />
  </View>
);

export default RejectTaskModal;
