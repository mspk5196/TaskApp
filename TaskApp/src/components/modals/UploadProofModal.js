import React from 'react';
import { View, Text, Button } from 'react-native';

const UploadProofModal = ({ onClose }) => (
  <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
    <Text>Upload Proof (TODO)</Text>
    <Button title="Close" onPress={onClose} />
  </View>
);

export default UploadProofModal;
