import AsyncStorage from '@react-native-async-storage/async-storage';
import { Recipient } from '@/contexts/LetterContext';

const STORAGE_KEY = 'letterDraft';

export interface LetterDraft {
  formData: Record<string, string>;
  recipient: Recipient;
}

export async function saveDraft(formData: Record<string, string>, recipient: Recipient) {
  try {
    const draft: LetterDraft = { formData, recipient };
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(draft));
  } catch (err) {
    console.error('Failed to save draft', err);
  }
}

export async function loadDraft(): Promise<LetterDraft | null> {
  try {
    const json = await AsyncStorage.getItem(STORAGE_KEY);
    if (json) {
      return JSON.parse(json) as LetterDraft;
    }
  } catch (err) {
    console.error('Failed to load draft', err);
  }
  return null;
}

export async function clearDraft() {
  try {
    await AsyncStorage.removeItem(STORAGE_KEY);
  } catch (err) {
    console.error('Failed to clear draft', err);
  }
}
