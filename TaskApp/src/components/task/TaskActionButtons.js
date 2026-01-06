import React from 'react';
import { View, Button } from 'react-native';

const TaskActionButtons = ({ onAccept, onReject }) => (
  <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 12 }}>
    <Button title="Accept" onPress={onAccept} />
    <Button title="Reject" onPress={onReject} />
  </View>
);

export default TaskActionButtons;
