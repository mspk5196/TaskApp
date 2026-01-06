import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AcceptTaskModal from '../components/modals/AcceptTaskModal';
import RejectTaskModal from '../components/modals/RejectTaskModal';
import RequestChangeModal from '../components/modals/RequestChangeModal';
import ReassignTaskModal from '../components/modals/ReassignTaskModal';
import EnterOtpModal from '../components/modals/EnterOtpModal';
import ScanQrModal from '../components/modals/ScanQrModal';
import UploadProofModal from '../components/modals/UploadProofModal';

const Stack = createNativeStackNavigator();

const ModalNavigator = () => (
  <Stack.Navigator screenOptions={{ presentation: 'modal', headerShown: false }}>
    <Stack.Screen name="AcceptTask" component={AcceptTaskModal} />
    <Stack.Screen name="RejectTask" component={RejectTaskModal} />
    <Stack.Screen name="RequestChange" component={RequestChangeModal} />
    <Stack.Screen name="ReassignTask" component={ReassignTaskModal} />
    <Stack.Screen name="EnterOtp" component={EnterOtpModal} />
    <Stack.Screen name="ScanQr" component={ScanQrModal} />
    <Stack.Screen name="UploadProof" component={UploadProofModal} />
  </Stack.Navigator>
);

export default ModalNavigator;
