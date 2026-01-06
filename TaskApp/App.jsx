import React from 'react';
import { AuthProvider } from './src/context/AuthContext';
import GoogleSignInConfig from './src/config/GoogleSignInConfig';
import RootNavigator from './src/navigation/RootNavigator';

const App = () => {
  return (
    <AuthProvider>
      <GoogleSignInConfig />
      <RootNavigator />
    </AuthProvider>
  );
};

export default App;
