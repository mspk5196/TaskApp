import React from 'react';
import { View, Text, Button } from 'react-native';

const ConfirmationDialog = ({ title = 'Confirm', message, onConfirm, onCancel }) => (
  <View style={{ padding: 16 }}>
    <Text style={{ fontWeight: '700', marginBottom: 8 }}>{title}</Text>
    {message ? <Text style={{ marginBottom: 12 }}>{message}</Text> : null}
    <View style={{ flexDirection: 'row', justifyContent: 'flex-end' }}>
      <Button title="Cancel" onPress={onCancel} />
      <View style={{ width: 8 }} />
      <Button title="OK" onPress={onConfirm} />
    </View>
  </View>
);

export default ConfirmationDialog;
