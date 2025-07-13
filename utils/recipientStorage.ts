import AsyncStorage from '@react-native-async-storage/async-storage';
import { Recipient } from '@/contexts/LetterContext';

const STORAGE_KEY = 'lastRecipient';

export async function saveLastRecipient(recipient: Recipient) {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(recipient));
  } catch (err) {
    console.error('Failed to save recipient', err);
  }
}

export async function loadLastRecipient(): Promise<Recipient | null> {
  try {
    const json = await AsyncStorage.getItem(STORAGE_KEY);
    if (json) {
      return JSON.parse(json) as Recipient;
    }
  } catch (err) {
    console.error('Failed to load recipient', err);
  }
  return null;
}
