import { Tabs, SplashScreen, usePathname, useRouter } from 'expo-router';
import { Chrome as Home, History, User, Settings } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';
import React, { useEffect } from 'react';
import mobileAds from 'react-native-google-mobile-ads';
import { Alert } from 'react-native';
import { useUser } from '@/contexts/UserContext';

export default function TabLayout() {
  const router = useRouter();
  const pathname = usePathname();
  const { profile } = useUser();

  useEffect(() => {
    // 1) Initialise la SDK AdMob dès que l'app démarre
    mobileAds()
      .initialize()
      .then(statuses => {
        console.log('✅ AdMob initialized', statuses);
        // 2) Quand AdMob est prêt, on peut masquer l'écran de splash
        SplashScreen.hideAsync();
      });
  }, []);

  const isProfileComplete =
    profile.firstName.trim() &&
    profile.lastName.trim() &&
    profile.email.trim() &&
    profile.address.trim() &&
    profile.postalCode.trim() &&
    profile.city.trim() &&
    profile.phone.trim();

  useEffect(() => {
    if (!isProfileComplete && pathname !== '/profile') {
      router.navigate('/profile');
    }
  }, [isProfileComplete, pathname]);

  const { colors } = useTheme();

  const preventIfIncomplete = (e: any) => {
    if (!isProfileComplete) {
      e.preventDefault();
      Alert.alert('Profil incomplet', 'Veuillez compléter votre profil avant de continuer.');
      router.navigate('/profile');
    }
  };

  return (

    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          borderTopWidth: 1,
          height: 65,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarLabelStyle: {
          fontFamily: 'Inter-Medium',
          fontSize: 12,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Accueil',
          tabBarIcon: ({ size, color }) => (
            <Home size={size} color={color} />
          ),
        }}
        listeners={{ tabPress: preventIfIncomplete }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: 'Historique',
          tabBarIcon: ({ size, color }) => (
            <History size={size} color={color} />
          ),
        }}
        listeners={{ tabPress: preventIfIncomplete }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profil',
          tabBarIcon: ({ size, color }) => (
            <User size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Paramètres',
          tabBarIcon: ({ size, color }) => (
            <Settings size={size} color={color} />
          ),
        }}
        listeners={{ tabPress: preventIfIncomplete }}
      />
    </Tabs>
	
	   
  );
}