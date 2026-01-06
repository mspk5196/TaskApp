import React, { useEffect } from 'react';
import { GoogleSignin } from '@react-native-google-signin/google-signin';

const GoogleSignInConfig = () => {
  useEffect(() => {
    GoogleSignin.configure({
      webClientId: '720697957982-i60kch70ehbp3ht0kp3ecb7ulgeaissb.apps.googleusercontent.com',
      offlineAccess: true,
      hostedDomain: '',
      forceCodeForRefreshToken: true,
    });
  }, []);

  return null;
};

export default GoogleSignInConfig;
