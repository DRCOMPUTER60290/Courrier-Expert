// services/postalApi.ts

import AsyncStorage from '@react-native-async-storage/async-storage';

// Cache in memory for faster repeated lookups
const cityCache: Map<string, string[]> = new Map();
const CACHE_KEY_PREFIX = 'postalCache_';

export async function fetchCitiesByPostalCode(postalCode: string): Promise<string[]> {
  if (!postalCode || postalCode.length < 2) {
    return [];
  }

  // 1. In-memory cache
  if (cityCache.has(postalCode)) {
    return cityCache.get(postalCode)!;
  }

  // 2. AsyncStorage cache (optional offline support)
  try {
    const stored = await AsyncStorage.getItem(`${CACHE_KEY_PREFIX}${postalCode}`);
    if (stored) {
      const parsed: string[] = JSON.parse(stored);
      cityCache.set(postalCode, parsed);
      return parsed;
    }
  } catch (err) {
    console.error('Failed to read postal cache from storage:', err);
  }

  // 3. Network request if not cached
  try {
    const response = await fetch(
      `https://geo.api.gouv.fr/communes?codePostal=${encodeURIComponent(postalCode)}&fields=nom&format=json`
    );

    if (!response.ok) {
      console.error('Postal code API error:', response.status, response.statusText);
      return [];
    }

    const data = await response.json();
    if (Array.isArray(data)) {
      const cities = data.map((item: any) => item.nom as string);
      cityCache.set(postalCode, cities);
      try {
        await AsyncStorage.setItem(
          `${CACHE_KEY_PREFIX}${postalCode}`,
          JSON.stringify(cities)
        );
      } catch (storageErr) {
        console.error('Failed to save postal cache to storage:', storageErr);
      }
      return cities;
    }

    return [];
  } catch (error) {
    console.error('Postal code API request failed:', error);
    return [];
  }
}
