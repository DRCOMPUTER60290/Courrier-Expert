import AsyncStorage from '@react-native-async-storage/async-storage';
import { Letter } from '@/contexts/LetterContext';

const STORAGE_KEY = 'letters';

export async function saveLetters(letters: Letter[]) {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(letters));
  } catch (err) {
    console.error('Failed to save letters', err);
  }
}

export async function loadLetters(): Promise<Letter[]> {
  try {
    const json = await AsyncStorage.getItem(STORAGE_KEY);
    if (json) {
      const parsed = JSON.parse(json) as Letter[];
      return parsed.map(letter => ({
        ...letter,
        createdAt: new Date(letter.createdAt),
      }));
    }
  } catch (err) {
    console.error('Failed to load letters', err);
  }
  return [];
}

const PENDING_KEY = 'pendingLetters';

export async function queueLetter(letter: Letter) {
  try {
    const existing = await AsyncStorage.getItem(PENDING_KEY);
    const arr: Letter[] = existing ? JSON.parse(existing) : [];
    arr.push(letter);
    await AsyncStorage.setItem(PENDING_KEY, JSON.stringify(arr));
  } catch (err) {
    console.error('Failed to queue letter', err);
  }
}

export async function getPendingLetters(): Promise<Letter[]> {
  try {
    const json = await AsyncStorage.getItem(PENDING_KEY);
    return json ? (JSON.parse(json) as Letter[]) : [];
  } catch (err) {
    console.error('Failed to get pending letters', err);
    return [];
  }
}

export async function clearPendingLetters() {
  try {
    await AsyncStorage.removeItem(PENDING_KEY);
  } catch (err) {
    console.error('Failed to clear pending letters', err);
  }
}
