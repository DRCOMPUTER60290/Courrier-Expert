import React, { createContext, useContext, useState } from 'react';

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
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [profile, setProfile] = useState<UserProfile>(defaultProfile);

  const updateProfile = (updates: Partial<UserProfile>) => {
    setProfile(prev => ({ ...prev, ...updates }));
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