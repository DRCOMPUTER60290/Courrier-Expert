import * as Print from 'expo-print';
import { Letter } from '@/contexts/LetterContext';

function htmlFromText(text: string): string {
  return `<!DOCTYPE html><html><head><meta charset="utf-8"></head><body><pre style="font-family: Arial, sans-serif; white-space: pre-wrap;">${text}</pre></body></html>`;
}

export async function generatePdf(letter: Letter): Promise<string> {
  const html = htmlFromText(letter.content);
  const { uri } = await Print.printToFileAsync({ html });
  return uri;
}

export function htmlForPrint(letter: Letter): string {
  return htmlFromText(letter.content);
}
