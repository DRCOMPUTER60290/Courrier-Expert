// services/letterApi.ts
import { generateContentByType } from '@/utils/letterPdf';

export async function generateLetter(
  type: string,
  recipient: any,
  data: Record<string, any>
): Promise<string> {
  console.log('Envoi des données au serveur:', { type, recipient, data });

  // TEMPORAIRE : Construire le prompt côté client pour compatibilité serveur
  const basePrompt = generateContentByType(type, data, recipient);
  const enhancedPrompt = `Tu es un assistant expert en rédaction de courriers professionnels français. 
  
Génère un courrier professionnel et personnalisé basé sur ces informations :

Type de courrier : ${type}
Destinataire : ${recipient.firstName} ${recipient.lastName}
${recipient.status ? `Statut : ${recipient.status}` : ''}
${recipient.company ? `Entreprise : ${recipient.company}` : ''}

Données du formulaire : ${JSON.stringify(data, null, 2)}

Le courrier doit être :
- Professionnel et formel
- Personnalisé selon les données fournies
- Structuré avec une introduction, un développement et une conclusion
- Adapté au contexte français
- Sans en-tête ni signature (juste le corps du courrier)

Voici un exemple de base à améliorer et personnaliser : ${basePrompt}

Génère un courrier plus élaboré, professionnel et personnalisé.`;

  console.log('Prompt envoyé au serveur:', enhancedPrompt);

  const response = await fetch(
    'https://assistant-backend-yrbx.onrender.com/api/generate-letter',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        prompt: enhancedPrompt  // Format attendu par votre serveur actuel
      }),
    }
  );

  console.log('Réponse du serveur:', response.status, response.statusText);

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