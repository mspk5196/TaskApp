import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from '../screens/auth/LoginScreen';
import IdentitySelectorScreen from '../screens/auth/IdentitySelectorScreen';
import Welcome from '../screens/auth/Welcome/Welcome';

const Stack = createNativeStackNavigator();

const AuthNavigator = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }} initialRouteName="Welcome">
    <Stack.Screen name="Welcome" component={Welcome} />
    <Stack.Screen name="Login" component={LoginScreen} />
    <Stack.Screen name="IdentitySelector" component={IdentitySelectorScreen} />
  </Stack.Navigator>
);

export default AuthNavigator;
