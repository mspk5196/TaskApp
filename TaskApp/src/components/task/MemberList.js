import React from 'react';
import { View, Text } from 'react-native';

const MemberList = ({ members = [] }) => (
  <View>
    {members.map((m) => (
      <Text key={m.id || m.name}>{m.name}</Text>
    ))}
  </View>
);

export default MemberList;
