import React from 'react';
import { View, Text, Button } from 'react-native';

const EnterOtpModal = ({ onClose }) => (
  <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
    <Text>Enter OTP (TODO)</Text>
    <Button title="Close" onPress={onClose} />
  </View>
);

export default EnterOtpModal;
