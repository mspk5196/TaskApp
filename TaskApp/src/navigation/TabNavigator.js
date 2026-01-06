import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import DashboardScreen from '../screens/dashboard/DashboardScreen';
import CalendarScreen from '../screens/calendar/CalendarScreen';
import InboxScreen from '../screens/inbox/InboxScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

const Tab = createBottomTabNavigator();

const TabNavigator = () => (
  <Tab.Navigator
    screenOptions={({ route }) => ({
      headerShown: false,
      tabBarIcon: ({ focused, color, size }) => {
        let iconName;

        switch (route.name) {
          case 'Dashboard':
            iconName = focused ? 'view-dashboard' : 'view-dashboard-outline';
            break;
          case 'Calendar':
            iconName = focused ? 'calendar-month' : 'calendar-month-outline';
            break;
          case 'Inbox':
            iconName = focused ? 'email' : 'email-outline';
            break;
          case 'Profile':
            iconName = focused ? 'account-circle' : 'account-circle-outline';
            break;
          default:
            iconName = 'circle';
        }

        return (
          <MaterialCommunityIcons name={iconName} size={size} color={color} />
        );
      },
      tabBarActiveTintColor: '#2842C4',
      tabBarInactiveTintColor: '#9CA3AF',
    })}
  >
    <Tab.Screen name="Dashboard" component={DashboardScreen} />
    <Tab.Screen name="Calendar" component={CalendarScreen} />
    <Tab.Screen name="Inbox" component={InboxScreen} />
    <Tab.Screen name="Profile" component={ProfileScreen} />
  </Tab.Navigator>
);

export default TabNavigator;
