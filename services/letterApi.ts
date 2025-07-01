// services/letterApi.ts
import { generateContentByType } from '@/utils/letterPdf';

export async function generateLetter(
  type: string,
  recipient: any,
  data: Record<string, any>
): Promise<string> {
  // 1. Génère le prompt à partir du type, des données et du destinataire
  const prompt = generateContentByType(type, data, recipient);

  // 2. Envoie ce prompt à l'API distante pour génération
  const response = await fetch(
    'https://assistant-backend-yrbx.onrender.com/api/generate-letter',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt }),
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Erreur du serveur: ${response.status} - ${errorText}`);
  }

  const result = await response.json();
  
  if (!result.content) {
    throw new Error('Réponse invalide du serveur: contenu manquant');
  }

  return result.content as string;
}