import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface UserProfile {
  firstName: string;
  lastName: string;
  company: string;
  address: string;
  postalCode: string;
  city: string;
  email: string;
  phone: string;
  photo?: string;
  signature?: string;
}

interface UserContextType {
  profile: UserProfile;
  setProfile: (profile: UserProfile) => void;
  updateProfile: (updates: Partial<UserProfile>) => void;
}

const defaultProfile: UserProfile = {
  firstName: '',
  lastName: '',
  company: '',
  address: '',
  postalCode: '',
  city: '',
  email: '',
  phone: '',
  photo: undefined,
  signature: undefined,
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [profile, setProfileState] = useState<UserProfile>(defaultProfile);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const stored = await AsyncStorage.getItem('userProfile');
        if (stored) {
          setProfileState(JSON.parse(stored));
        }
      } catch (error) {
        console.error('Failed to load user profile', error);
      }
    };

    loadProfile();
  }, []);

  const persistProfile = async (value: UserProfile) => {
    try {
      await AsyncStorage.setItem('userProfile', JSON.stringify(value));
    } catch (error) {
      console.error('Failed to save user profile', error);
    }
  };

  const updateProfile = (updates: Partial<UserProfile>) => {
    setProfileState(prev => {
      const updated = { ...prev, ...updates };
      persistProfile(updated);
      return updated;
    });
  };

  const setProfile = (newProfile: UserProfile) => {
    setProfileState(() => {
      persistProfile(newProfile);
      return newProfile;
    });
  };

  return (
    <UserContext.Provider value={{ profile, setProfile, updateProfile }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}
