import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth, AuthProvider } from '../context/AuthContext';
import LoginScreen from '../screens/LoginScreen';
import DashboardScreen from '../screens/DashboardScreen';
import IdentitySelectorScreen from '../screens/IdentitySelectorScreen';
import CreateTaskScreen from '../screens/CreateTaskScreen';
import CalendarScreen from '../screens/CalendarScreen';
import { View, Text, Button } from 'react-native';

const Stack = createNativeStackNavigator();

const AppNavigator = () => {
  const { token, user } = useAuth();

  return (
    <NavigationContainer>
      <Stack.Navigator>
        {token ? (
           // If user is logged in
           <>
             <Stack.Screen name="Dashboard" component={DashboardScreen} />
             <Stack.Screen name="SwitchContext" component={IdentitySelectorScreen} />
             <Stack.Screen name="CreateTask" component={CreateTaskScreen} />
             <Stack.Screen name="Calendar" component={CalendarScreen} />
           </>
        ) : (
          <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
