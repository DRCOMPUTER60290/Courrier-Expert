import { generateContentByType } from '@/utils/letterPdf';

export async function generateLetterOnline(type: string, recipient: any, data: Record<string, any>): Promise<string> {
  const response = await fetch('https://assistant-backend-yrbx.onrender.com/api/generate-letter', {
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

export function generateLetterOffline(type: string, recipient: any, data: Record<string, any>): string {
  return generateContentByType(type, data, recipient);
}

export async function generateLetter(type: string, recipient: any, data: Record<string, any>): Promise<string> {
  try {
    return await generateLetterOnline(type, recipient, data);
  } catch (error) {
    console.warn('Online generation failed, using offline fallback', error);
    return generateLetterOffline(type, recipient, data);
  }
}
