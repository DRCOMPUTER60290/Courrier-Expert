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

const PENDING_KEY = 'pendingRecipients';

export async function queueRecipient(recipient: Recipient) {
  try {
    const existing = await AsyncStorage.getItem(PENDING_KEY);
    const arr: Recipient[] = existing ? JSON.parse(existing) : [];
    arr.push(recipient);
    await AsyncStorage.setItem(PENDING_KEY, JSON.stringify(arr));
  } catch (err) {
    console.error('Failed to queue recipient', err);
  }
}

export async function getPendingRecipients(): Promise<Recipient[]> {
  try {
    const json = await AsyncStorage.getItem(PENDING_KEY);
    return json ? (JSON.parse(json) as Recipient[]) : [];
  } catch (err) {
    console.error('Failed to get pending recipients', err);
    return [];
  }
}

export async function clearPendingRecipients() {
  try {
    await AsyncStorage.removeItem(PENDING_KEY);
  } catch (err) {
    console.error('Failed to clear pending recipients', err);
  }
}
