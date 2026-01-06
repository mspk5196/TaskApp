import React, { useEffect } from 'react';
import { GoogleSignin } from '@react-native-google-signin/google-signin';

const GoogleSignInConfig = () => {
  useEffect(() => {
    GoogleSignin.configure({
      webClientId: '1036739290914-vhfitov4kpvlemh8fjd7jli57gnsn0vl.apps.googleusercontent.com',
    });
  }, []);

  return null;
};

export default GoogleSignInConfig;
