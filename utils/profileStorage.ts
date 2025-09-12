import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserProfile } from '@/contexts/UserContext';

const KEY = 'pendingProfile';

export async function savePendingProfile(profile: UserProfile) {
  try {
    await AsyncStorage.setItem(KEY, JSON.stringify(profile));
  } catch (err) {
    console.error('Failed to store pending profile', err);
  }
}

export async function getPendingProfile(): Promise<UserProfile | null> {
  try {
    const json = await AsyncStorage.getItem(KEY);
    return json ? (JSON.parse(json) as UserProfile) : null;
  } catch (err) {
    console.error('Failed to load pending profile', err);
    return null;
  }
}

export async function clearPendingProfile() {
  try {
    await AsyncStorage.removeItem(KEY);
  } catch (err) {
    console.error('Failed to clear pending profile', err);
  }
}
