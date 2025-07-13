// services/postalApi.ts

export async function fetchCitiesByPostalCode(postalCode: string): Promise<string[]> {
  if (!postalCode || postalCode.length < 2) {
    return [];
  }

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
      return data.map((item: any) => item.nom as string);
    }

    return [];
  } catch (error) {
    console.error('Postal code API request failed:', error);
    return [];
  }
}
