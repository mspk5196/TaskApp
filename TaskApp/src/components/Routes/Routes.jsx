import React from 'react';
import { NavigationContainer, useNavigationState } from '@react-navigation/native';
import AuthLoader from './AuthLoader';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Welcome from '../../screens/auth/Welcome/Welcome';
import Login from '../../screens/auth/LoginScreen';
import Redirect from '../Redirect/Redirect';
import AdminRoutes from './AdminRoutes';
import CoordinatorRoutes from './CoordinatorRoutes';
import MentorRoutes from './MentorRoutes';
import ParentRoutes from './ParentRoutes';


const Stack = createNativeStackNavigator();

const Routes = () => {

    return (
        <NavigationContainer>
            <Stack.Navigator initialRouteName="AuthLoader" screenOptions={{ headerShown: false }}>

                <Stack.Screen name="AuthLoader" component={AuthLoader} />
                <Stack.Screen name="Welcome" component={Welcome} />
                
                {/* Auth Screens */}
                <Stack.Screen name="Login" component={Login} />
                <Stack.Screen name="Redirect" component={Redirect}/>

                {/* Role-specific Routes */}

            </Stack.Navigator>
        </NavigationContainer>
    )

}

export default Routes

