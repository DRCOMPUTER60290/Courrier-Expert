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
