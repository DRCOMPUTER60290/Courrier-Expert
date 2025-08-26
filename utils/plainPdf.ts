import * as Print from 'expo-print';
import { Letter } from '@/contexts/LetterContext';

function htmlFromText(text: string, signature?: string): string {
  const imgTag = signature
    ? `<img src="${signature.startsWith('data:') ? signature : 'data:image/png;base64,' + signature}" />`
    : '';
  return `<!DOCTYPE html><html><head><meta charset="utf-8"></head><body><pre style="font-family: Arial, sans-serif; white-space: pre-wrap;">${text}</pre>${imgTag}</body></html>`;
}

export async function generatePdf(letter: Letter, signature?: string): Promise<string> {
  const html = htmlFromText(letter.content, signature);
  const { uri } = await Print.printToFileAsync({ html });
  return uri;
}

export function htmlForPrint(letter: Letter, signature?: string): string {
  return htmlFromText(letter.content, signature);
}
