import { useMemo } from 'react';
import { GoogleGenAI } from '@google/genai';

const LS_APIKEY = "odaba_gemini_key";

export function useGeminiClient(apiKey?: string) {
  const keyFromEnv = (import.meta as any)?.env?.VITE_GEMINI_API_KEY as string | undefined;
  const finalKey = apiKey || keyFromEnv || localStorage.getItem(LS_APIKEY) || "";
  
  const client = useMemo(() => (finalKey ? new GoogleGenAI({ apiKey: finalKey }) : null), [finalKey]);
  
  return { client, apiKey: finalKey };
}

// Convert local messages to Gemini contents
export function toGeminiContents(messages: any[], userMessage: string) {
  const parts: any[] = [];
  for (const m of messages) {
    if (!m.content) continue;
    const role = m.role === "assistant" ? "model" : "user";
    parts.push({ role, parts: [{ text: m.content }] });
  }
  parts.push({ role: "user", parts: [{ text: userMessage }] });
  return parts;
}
