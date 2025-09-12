import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { saveProfileRemote } from '@/services/letterApi';
import { fetchProfile } from '@/services/authApi';
import { useAuth } from '@/contexts/AuthContext';
import { savePendingProfile, getPendingProfile, clearPendingProfile } from '@/utils/profileStorage';

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
  const { token } = useAuth();

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

  const sync = async () => {
    if (!token) return;
    const pending = await getPendingProfile();
    if (pending) {
      try {
        await saveProfileRemote(pending, token);
        await clearPendingProfile();
      } catch (err) {
        console.error('Failed to sync profile', err);
      }
    }
    try {
      const remote = await fetchProfile(token);
      setProfileState(remote);
      await AsyncStorage.setItem('userProfile', JSON.stringify(remote));
    } catch (err) {
      console.error('Failed to fetch profile', err);
    }
  };

  useEffect(() => {
    sync();
  }, [token]);

  const persistProfile = async (value: UserProfile) => {
    try {
      await AsyncStorage.setItem('userProfile', JSON.stringify(value));
    } catch (error) {
      console.error('Failed to save user profile', error);
    }
    if (token) {
      try {
        await saveProfileRemote(value, token);
        await clearPendingProfile();
      } catch (err) {
        console.error('Failed to save profile remote', err);
        await savePendingProfile(value);
      }
    } else {
      await savePendingProfile(value);
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
