export async function generateLetterOnline(type: string, recipient: any, data: Record<string, any>): Promise<string> {
  const response = await fetch('https://assistant-backend-yrbx.onrender.com/generate-letter', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ type, recipient, data })
  });

  if (!response.ok) {
    throw new Error('Failed to generate letter');
  }

  const result = await response.json();
  return result.content as string;
}
