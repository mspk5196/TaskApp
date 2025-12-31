import React, { useEffect } from 'react';
import { GoogleSignin } from '@react-native-google-signin/google-signin';

const GoogleSignInConfig = () => {
  useEffect(() => {
    GoogleSignin.configure({
      webClientId: 'YOUR_WEB_CLIENT_ID.apps.googleusercontent.com', // Replace with your Web Client ID
      offlineAccess: true,
      hostedDomain: '', // Optional: Restrict to specific domain
      forceCodeForRefreshToken: true,
    });
  }, []);

  return null;
};

export default GoogleSignInConfig;
