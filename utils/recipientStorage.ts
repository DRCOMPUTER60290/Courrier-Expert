import AsyncStorage from '@react-native-async-storage/async-storage';
import { Recipient } from '@/contexts/RecipientContext';

const STORAGE_KEY = 'recipients';

export async function saveRecipients(recipients: Recipient[]) {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(recipients));
  } catch (err) {
    console.error('Failed to save recipients', err);
  }
}

export async function loadRecipients(): Promise<Recipient[]> {
  try {
    const json = await AsyncStorage.getItem(STORAGE_KEY);
    if (json) {
      return JSON.parse(json) as Recipient[];
    }
  } catch (err) {
    console.error('Failed to load recipients', err);
  }
  return [];
}
