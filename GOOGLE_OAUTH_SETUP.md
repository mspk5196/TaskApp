# Google OAuth Setup Guide

## Backend Setup

1. **Environment Variable**
   Add to `Backend/.env`:
   ```
   GOOGLE_CLIENT_ID=your_google_client_id_here.apps.googleusercontent.com
   ```

2. **Get Google Client ID**
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select existing
   - Enable Google+ API
   - Go to Credentials → Create Credentials → OAuth 2.0 Client ID
   - Create **Web application** client ID (for backend verification)
   - Copy the Client ID

## Android Setup

1. **Install Package**
   ```bash
   cd TaskApp
   npm install @react-native-google-signin/google-signin
   ```

2. **Get SHA-1 Certificate**
   ```bash
   cd android
   ./gradlew signingReport
   ```
   Copy the SHA-1 from the debug variant

3. **Create Android OAuth Client**
   - In Google Cloud Console → Credentials
   - Create OAuth 2.0 Client ID → Android
   - Package name: `com.taskapp` (or your package name)
   - Paste SHA-1 certificate
   - Create

4. **Download google-services.json**
   - Go to Firebase Console or Google Cloud Console
   - Download `google-services.json`
   - Place in `TaskApp/android/app/`

5. **Update android/build.gradle**
   ```gradle
   buildscript {
       dependencies {
           classpath 'com.google.gms:google-services:4.3.15'
       }
   }
   ```

6. **Update android/app/build.gradle**
   Add at the bottom:
   ```gradle
   apply plugin: 'com.google.gms.google-services'
   ```

7. **Update LoginScreen.js**
   Replace `YOUR_WEB_CLIENT_ID` with your actual Web Client ID

## Testing

1. Restart Metro bundler
2. Rebuild Android app: `npx react-native run-android`
3. Click "Continue with Google" button
4. Select Google account
5. Should redirect back to app with user logged in

## Troubleshooting

- **"Developer Error"**: Wrong SHA-1 or package name
- **"Sign-in failed"**: Check google-services.json is in correct location
- **"Play Services not available"**: Test on real device or emulator with Google Play
