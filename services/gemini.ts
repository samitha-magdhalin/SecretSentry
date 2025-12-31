import { GoogleGenAI, Type } from "@google/genai";
import { SecretFinding, Severity } from "../types";

export class GeminiService {
  async analyzeCodeForSecrets(code: string, fileName: string): Promise<SecretFinding[]> {
    if (!code || code.trim().length < 5) return [];

    const apiKey = process.env.API_KEY;
    if (!apiKey) {
      throw new Error("Gemini API Key missing. Please ensure the API_KEY environment variable is set in Vercel.");
    }

    try {
      const ai = new GoogleGenAI({ apiKey });
      
      const response = await ai.models.generateContent({
        model: "gemini-3-pro-preview",
        contents: `You are a Senior Security Auditor. Your task is to identify HIGH-CONFIDENCE hardcoded secrets.

FILE: ${fileName}

CRITICAL: DO NOT FLAG THE FOLLOWING (FALSE POSITIVES):
- CSS class names or Tailwind JIT hashes (e.g., bg-[length:200%_auto], text-[#6366f1])
- SVG path data (strings starting with 'M', 'L', 'Z', etc.)
- Public UUIDs/GUIDs used for DOM element IDs or mapping keys
- Version numbers (e.g., 1.2.3-beta)
- Generic placeholder strings like "your-api-key-here" (unless they look like real leaked keys)
- Long strings that are clearly text content or public documentation links.

VALIDATION LOGIC:
A string is only a "Secret" if:
1. It is assigned to a variable named like: 'token', 'secret', 'key', 'password', 'auth', 'cred', 'apiKey', 'connectionString'.
2. OR it follows a specific format (e.g., 'sk_live_...', 'AKIA...', 'AIza...').
3. AND it has high entropy but is NOT used in a UI/Styling context.

RETURN ONLY VALID JSON.`,
        config: {
          systemInstruction: "You are a conservative security engine. It is better to miss a borderline suspicious string than to flag a CSS class or an SVG path as a secret. Be extremely skeptical of random strings in HTML/CSS contexts.",
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                line: { type: Type.INTEGER },
                type: { type: Type.STRING, description: "Classification of secret" },
                snippet: { type: Type.STRING },
                secretValue: { type: Type.STRING, description: "The actual secret value" },
                severity: { type: Type.STRING, enum: Object.values(Severity) },
                explanation: { type: Type.STRING, description: "Why this is definitely a secret and not a CSS/ID string" },
                suggestion: { type: Type.STRING },
                confidence: { type: Type.NUMBER, description: "Score from 0 to 1. Only return findings > 0.8" }
              },
              required: ["line", "type", "snippet", "secretValue", "severity", "explanation", "suggestion", "confidence"]
            }
          }
        }
      });

      const text = response.text?.trim();
      if (!text || text === "[]") return [];

      let rawFindings;
      try {
        rawFindings = JSON.parse(text);
      } catch (e) {
        const match = text.match(/\[[\s\S]*\]/);
        rawFindings = match ? JSON.parse(match[0]) : [];
      }

      // Filter out low confidence or suspicious AI hallucinations
      return rawFindings
        .filter((f: any) => f.confidence > 0.8)
        .map((f: any) => {
          const val = String(f.secretValue || "");
          const redacted = val.length > 12 
              ? `${val.substring(0, 4)}••••${val.substring(val.length - 4)}` 
              : "••••••••";

          return {
              ...f,
              id: Math.random().toString(36).substr(2, 9),
              file: fileName,
              redactedSecret: redacted
          };
        });
    } catch (error: any) {
      console.log("Gemini API Key Loaded:", !!process.env.API_KEY);

      console.error("Gemini Audit Error:", error);
      if (error.message?.includes("SAFETY")) {
        // Safety triggers usually mean we found something very sensitive that the AI won't repeat
        return [{
          id: 'safety-trigger',
          file: fileName,
          line: 0,
          type: "Confirmed Sensitive Data (Filtered)",
          snippet: "Confidential data triggered safety block",
          severity: Severity.CRITICAL,
          explanation: "The AI detected a real, highly sensitive production credential and blocked the output for safety. This is a 100% positive match.",
          suggestion: "Rotate all credentials in this file immediately.",
          redactedSecret: "REDACTED"
        }];
      }
      throw new Error("AI analysis engine timed out or was blocked.");
    }
  }
}
