import React, { useState, useRef } from 'react';
import {
  Text,
  View,
  Keyboard,
  Pressable,
  TouchableWithoutFeedback,
  ScrollView,
  Alert,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { TextInput } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { useNavigation } from '@react-navigation/native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

import Loginimg from '../../assets/Login/loginimg.svg';
import Separator from '../../assets/Login/separator.svg';
import Googleicon from '../../assets/Login/google.svg';
import styles from './loginsty';
import { GOOGLE_WEB_CLIENT_ID } from '../../config/env';
import useAuth from '../../hooks/useAuth';

const LoginScreen = () => {
  const navigation = useNavigation();
  const { login, loginWithGoogle } = useAuth();
  const passwordRef = useRef(null);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [checked, setChecked] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    if (!checked) {
      Alert.alert('Please accept the Privacy Policy');
      return;
    }

    if (!email || !password) {
      Alert.alert('Please enter both email and password');
      return;
    }

    setIsLoading(true);

    try {
      const response = await login(email, password);
      if (response?.success) {
        navigation.navigate('IdentitySelector');
      }
    } catch (error) {
      console.error('Login error:', error);
      Alert.alert('Login Failed', error.message || 'Something went wrong');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setIsLoading(true);

      GoogleSignin.configure({
        offlineAccess: true,
        webClientId: GOOGLE_WEB_CLIENT_ID,
      });

      const hasPlayService = await GoogleSignin.hasPlayServices();
      if (!hasPlayService) {
        Alert.alert('Error', 'Google Play Services are not available.');
        return;
      }

      try {
        await GoogleSignin.signOut();
      } catch {}

      const userInfo = await GoogleSignin.signIn();
      const googleEmail = userInfo.data?.user.email || userInfo.user.email;

      if (!googleEmail) throw new Error('No email retrieved from Google.');

      const response = await loginWithGoogle(googleEmail);

      if (response?.success) {
        navigation.navigate('IdentitySelector');
      }
    } catch (e) {
      console.error('Google login error:', e);
      Alert.alert('Error', 'Google login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <SafeAreaView style={styles.container} edges={['bottom', 'left', 'right']}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardAvoidingView}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContainer}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            bounces={false}
          >
            <View style={styles.contentContainer}>
              <View style={styles.headerContainer}>
                <Text style={styles.hi}>Hi!</Text>
                <Text style={styles.sectoptext}>Login to continue</Text>
              </View>

              <View style={styles.imageContainer}>
                <Loginimg height={200} width={220} style={styles.logimg} />
              </View>

              <View style={styles.inputcontainer}>
                <TextInput
                  style={styles.input}
                  label="Email"
                  value={email}
                  onChangeText={setEmail}
                  mode="outlined"
                  activeOutlineColor="#3B82F6"
                  outlineColor="#E2E8F0"
                  textColor="#1E293B"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  returnKeyType="next"
                  onSubmitEditing={() => passwordRef.current?.focus()}
                />
                <View style={styles.passwordContainer}>
                  <TextInput
                    ref={passwordRef}
                    style={styles.input}
                    label="Password"
                    value={password}
                    onChangeText={setPassword}
                    mode="outlined"
                    activeOutlineColor="#3B82F6"
                    outlineColor="#E2E8F0"
                    textColor="#1E293B"
                    secureTextEntry={!showPassword}
                    returnKeyType="done"
                    onSubmitEditing={handleLogin}
                  />
                  <Pressable
                    onPress={() => setShowPassword(!showPassword)}
                    style={styles.eyeIcon}
                  >
                    <MaterialCommunityIcons
                      name={showPassword ? 'eye' : 'eye-off'}
                      size={22}
                      color="#64748B"
                    />
                  </Pressable>
                </View>
              </View>

              <Pressable
                style={styles.checkboxContainer}
                onPress={() => setChecked(!checked)}
              >
                <MaterialCommunityIcons
                  name={checked ? 'checkbox-marked' : 'checkbox-blank-outline'}
                  size={24}
                  color={checked ? '#3B82F6' : '#CBD5E1'}
                />
                <Text style={styles.checkboxText}>
                  I agree with the Privacy Policy
                </Text>
              </Pressable>

              <TouchableOpacity
                style={[styles.pressablebtn, isLoading && { opacity: 0.7 }]}
                onPress={handleLogin}
                disabled={isLoading}
              >
                <View style={styles.btn}>
                  {isLoading ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <Text style={styles.btntext}>LOGIN</Text>
                  )}
                </View>
              </TouchableOpacity>

              <View style={styles.separator}>
                <Separator />
              </View>

              <Text style={styles.googletext}>Login with Google</Text>

              <Pressable
                style={[styles.googleauthcontainer, isLoading && { opacity: 0.7 }]}
                onPress={handleGoogleLogin}
                disabled={isLoading}
              >
                <Googleicon height={20} width={20} style={styles.googleicon} />
                <Text style={styles.googleauthtext}>Continue with Google</Text>
              </Pressable>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </TouchableWithoutFeedback>
  );
};

export default LoginScreen;
