import mobileAds from 'react-native-google-mobile-ads';
import { SplashScreen } from 'expo-router';

export const initializeAdMob = () => {
  // Initialize AdMob SDK for native platforms
  mobileAds()
    .initialize()
    .then(statuses => {
      console.log('✅ AdMob initialized', statuses);
      // Hide splash screen when AdMob is ready
      SplashScreen.hideAsync();
    });
};