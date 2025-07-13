// services/letterApi.ts

import { Alert } from 'react-native';
import { UserProfile } from '@/contexts/UserContext';
import { BACKEND_URL } from '@/config';

const API_URL = `${BACKEND_URL}/api/generate-letter`;

// Petite fonction utilitaire pour patienter
function wait(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function buildPrompt(
  type: string,
  recipient: any,
  profile: UserProfile,
  subject: string,
  body: string,
  data: Record<string, any>
): string {
  const recipientInfo = `${
    recipient.status ? recipient.status + ' ' : ''
  }${recipient.firstName} ${recipient.lastName}`.trim();

  const senderInfo = `${profile.firstName} ${profile.lastName}`.trim();

  const address = `${profile.address}, ${profile.postalCode} ${profile.city}`.trim();

  const contact = `Téléphone: ${profile.phone}, Email: ${profile.email}`;

  const details = Object.entries(data)
    .map(([key, value]) => `${key}: ${value}`)
    .join(', ');

  return (
    'Tu es un assistant qui rédige des lettres officielles au format administratif français. ' +
    "Les coordonnées de l'expéditeur doivent être placées en haut du courrier avant celles du destinataire. " +
    `Type: ${type}. Objet: ${subject}. Corps: ${body}. ` +
    `Expéditeur: ${senderInfo}, ${address}. ${contact}. ` +
    `Destinataire: ${recipientInfo}. Informations supplémentaires: ${details}.`
  );
}

export async function generateLetter(
  type: string,
  recipient: any,
  profile: UserProfile,
  subject: string,
  body: string,
  data: Record<string, any>
): Promise<string> {
  const prompt = buildPrompt(type, recipient, profile, subject, body, data);
  console.log('Envoi des données au serveur:', { type, recipient, profile, subject, body, data, prompt });

  const maxRetries = 3;
  let attempt = 0;
  let delay = 1000;  // en millisecondes
  let response: Response | null = null;

  // On retente tant que le serveur renvoie 503 et que l'on n'a pas dépassé maxRetries
  while (attempt <= maxRetries) {
    response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type, recipient, profile, subject, body, data, prompt }),
    });

    console.log('Réponse du serveur:', response.status, response.statusText);

    if (response.status !== 503) {
      // tout autre code HTTP → on sort de la boucle
      break;
    }

    if (attempt < maxRetries) {
      // attente exponentielle avant la prochaine tentative
      await wait(delay);
      attempt += 1;
      delay *= 2;
    } else {
      // on a épuisé les tentatives
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

  const raw = result.content as string;
  const content = raw.replace(/\\n/g, '\n');
  return content;
}
