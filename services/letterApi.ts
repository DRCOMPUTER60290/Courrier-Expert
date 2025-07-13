// services/letterApi.ts

import { Alert } from 'react-native';
import { UserProfile } from '@/contexts/UserContext';
import { Recipient } from '@/contexts/LetterContext';
import { BACKEND_URL } from '@/config';

const API_URL = `${BACKEND_URL}/api/generate-letter`;

// Petite fonction utilitaire pour patienter
function wait(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function buildPrompt(
  type: string,
  recipient: Recipient,
  profile: UserProfile,
  subject: string,
  body: string,
  data: Record<string, any>,
  currentDate: string
): string {
  const recipientInfo = `${
    recipient.status ? recipient.status + ' ' : ''
  }${recipient.firstName} ${recipient.lastName}`.trim();

  const senderInfo = `${profile.firstName} ${profile.lastName}`.trim();
  const senderAddress = `${profile.address}\n${profile.postalCode} ${profile.city}`.trim();
  const senderContact = `Téléphone : ${profile.phone}\nEmail : ${profile.email}`;

  const recipientAddress = recipient.address ? 
    `${recipientInfo}\n${recipient.address}\n${recipient.postalCode} ${recipient.city}` :
    recipientInfo;

  const details = Object.entries(data)
    .filter(([_, value]) => value && value.toString().trim())
    .map(([key, value]) => `${key}: ${value}`)
    .join(', ');

  const locationDate = `${profile.city}, le ${currentDate}`;

  return (
    `Tu es un expert en rédaction de courriers administratifs français. Tu dois rédiger une lettre officielle respectant scrupuleusement le format administratif français standard.

STRUCTURE OBLIGATOIRE À RESPECTER :

1. COORDONNÉES DE L'EXPÉDITEUR (en haut à gauche) :
${senderInfo}
${senderAddress}
${senderContact}

2. COORDONNÉES DU DESTINATAIRE (à droite, aligné) :
${recipientAddress}

3. LIEU ET DATE (à droite) :
${locationDate}

4. OBJET (en gras, centré ou aligné à gauche) :
Objet : ${subject || `Courrier de type ${type}`}

5. FORMULE D'APPEL appropriée :
- "${recipient.status || 'Madame, Monsieur'}," (suivi d'une virgule)

6. CORPS DE LA LETTRE :
- Paragraphes justifiés
- Première ligne de chaque paragraphe avec alinéa
- Espacement entre les paragraphes
- Ton professionnel et respectueux
- Contenu adapté au type de courrier : ${type}

7. FORMULE DE POLITESSE (avant la signature) :
- Formule française standard appropriée au contexte
- Reprendre la formule d'appel dans la formule de politesse

8. SIGNATURE :
${senderInfo}

RÈGLES TYPOGRAPHIQUES :
- Utiliser des majuscules appropriées
- Respecter la ponctuation française
- Aérer le texte avec des sauts de ligne
- Pas de formatage HTML ou Markdown

INFORMATIONS À INTÉGRER :
Type de courrier : ${type}
${subject ? `Objet spécifié : ${subject}` : ''}
${body ? `Contenu personnalisé : ${body}` : ''}
${details ? `Données complémentaires : ${details}` : ''}

Rédige maintenant la lettre complète en respectant exactement cette structure et ces règles.`
  );
}

export async function generateLetter(
  type: string,
  recipient: Recipient,
  profile: UserProfile,
  subject: string,
  body: string,
  data: Record<string, any>,
  currentDate: string
): Promise<string> {
  const prompt = buildPrompt(type, recipient, profile, subject, body, data, currentDate);
  console.log('Envoi des données au serveur:', {
    type,
    recipient,
    profile,
    subject,
    body,
    data,
    currentDate,
    prompt,
  });

  const maxRetries = 3;
  let attempt = 0;
  let delay = 1000;  // en millisecondes
  let response: Response | null = null;

  // On retente tant que le serveur renvoie 503 et que l'on n'a pas dépassé maxRetries
  while (attempt <= maxRetries) {
    response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type, recipient, profile, subject, body, data, prompt, currentDate }),
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
