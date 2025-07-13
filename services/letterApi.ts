// services/letterApi.ts

import { UserProfile } from '@/contexts/UserContext';
import { Alert } from 'react-native';

const API_URL = 'https://assistant-backend-yrbx.onrender.com/api/generate-letter';

function wait(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function buildPrompt(
  type: string,
  recipient: any,
  profile: UserProfile,
  data: Record<string, any>
): string {
  const recipientInfo = `${recipient.status ? recipient.status + ' ' : ''}${recipient.firstName} ${recipient.lastName}`.trim();
  const senderInfo = `${profile.firstName} ${profile.lastName}${profile.company ? `, ${profile.company}` : ''}`.trim();
  const details = Object.entries(data)
    .map(([key, value]) => `${key}: ${value}`)
    .join(', ');
  return `Rédige une lettre professionnelle de type "${type}". Expéditeur: ${senderInfo}. Destinataire: ${recipientInfo}. Informations supplémentaires: ${details}.`;
}

export async function generateLetter(
  type: string,
  recipient: any,
  profile: UserProfile,
  data: Record<string, any>
): Promise<string> {
  const prompt = buildPrompt(type, recipient, profile, data);
  console.log('Envoi des données au serveur:', { type, recipient, profile, data, prompt });

  const maxRetries = 3;
  let attempt = 0;
  let delay = 1000;
  let response: Response | null = null;

  while (attempt <= maxRetries) {
    response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type, recipient, profile, data, prompt }),
    });

    console.log('Réponse du serveur:', response.status, response.statusText);

    if (response.status !== 503) {
      break;
    }

    if (attempt < maxRetries) {
      await wait(delay);
      attempt += 1;
      delay *= 2;
    } else {
      Alert.alert(
        'Serveur indisponible',
        'Le serveur semble occupé ou en cours de redémarrage. Merci de réessayer dans quelques instants.'
      );
      break;
    }
  }

  if (!response) {
    throw new Error('Aucune réponse du serveur');
  }

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Erreur serveur:', errorText);
    throw new Error(`Erreur du serveur: ${response.status} - ${errorText}`);
  }

  const result = await response.json();
  console.log('Contenu reçu du serveur:', result);

  if (!result.content) {
    throw new Error('Réponse invalide du serveur: contenu manquant');
  }

  return result.content as string;
}