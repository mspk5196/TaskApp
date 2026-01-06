import React from 'react';
import { View, Text, Button } from 'react-native';

const RequestChangeModal = ({ onClose }) => (
  <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
    <Text>Request Change (TODO)</Text>
    <Button title="Close" onPress={onClose} />
  </View>
);

export default RequestChangeModal;
