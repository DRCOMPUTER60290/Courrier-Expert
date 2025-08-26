import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'favoriteLetterTypes';

export async function loadFavoriteTypes(): Promise<string[]> {
  try {
    const json = await AsyncStorage.getItem(STORAGE_KEY);
    return json ? JSON.parse(json) as string[] : [];
  } catch (err) {
    console.error('Failed to load favorite letter types', err);
    return [];
  }
}

export async function saveFavoriteTypes(favorites: string[]) {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(favorites));
  } catch (err) {
    console.error('Failed to save favorite letter types', err);
  }
}

