import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { UserProvider } from '@/contexts/UserContext';
import { LetterProvider } from '@/contexts/LetterContext';
import { RecipientProvider } from '@/contexts/RecipientContext';
import { SubscriptionProvider } from '@/contexts/SubscriptionContext';
import { useFonts } from 'expo-font';
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold
} from '@expo-google-fonts/inter';
import { SplashScreen } from 'expo-router';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  useFrameworkReady();
  
  const [fontsLoaded, fontError] = useFonts({
    'Inter-Regular': Inter_400Regular,
    'Inter-Medium': Inter_500Medium,
    'Inter-SemiBold': Inter_600SemiBold,
    'Inter-Bold': Inter_700Bold,
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <ThemeProvider>
      <SubscriptionProvider>
        <UserProvider>
          <RecipientProvider>
            <LetterProvider>
              <Stack screenOptions={{ headerShown: false }}>
                <Stack.Screen name="(tabs)" />
                <Stack.Screen name="create-letter" />
                <Stack.Screen name="letter-preview" />
                <Stack.Screen name="subscribe" />
                <Stack.Screen name="+not-found" />
              </Stack>
              <StatusBar style="auto" />
            </LetterProvider>
          </RecipientProvider>
        </UserProvider>
      </SubscriptionProvider>
    </ThemeProvider>
  );
}