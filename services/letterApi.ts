// services/letterApi.ts

function buildPrompt(type: string, recipient: any, data: Record<string, any>): string {
  return `Rédige la lettre de type "${type}" en HTML complet (balises <p>, <br>…), incluant l'adresse de l'expéditeur, celle du destinataire, l'objet et la signature.`;
}

export async function generateLetter(
  type: string,
  recipient: any,
  data: Record<string, any>
): Promise<string> {
  const prompt = buildPrompt(type, recipient, data);
  console.log('Envoi des données au serveur:', { type, recipient, data, prompt });

  const response = await fetch(
    'https://assistant-backend-yrbx.onrender.com/api/generate-letter',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type, recipient, data, prompt, format: 'html' }),
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
