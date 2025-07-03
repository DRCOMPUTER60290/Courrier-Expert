// services/letterApi.ts


export async function generateLetter(
  type: string,
  recipient: any,
  data: Record<string, any>
): Promise<string> {
  console.log('Envoi des données au serveur:', { type, recipient, data });

  const response = await fetch(
    'https://assistant-backend-yrbx.onrender.com/api/generate-letter',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type, recipient, data }),
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