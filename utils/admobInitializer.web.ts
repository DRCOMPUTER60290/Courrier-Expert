import { SplashScreen } from 'expo-router';

export const initializeAdMob = () => {
  // Web version - just hide splash screen since AdMob is not supported
  console.log('ℹ️ AdMob not available on web platform');
  SplashScreen.hideAsync();
};