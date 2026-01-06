import React from 'react';
import { View, Text, Button } from 'react-native';

const ScanQrModal = ({ onClose }) => (
  <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
    <Text>Scan QR (TODO)</Text>
    <Button title="Close" onPress={onClose} />
  </View>
);

export default ScanQrModal;
