import { GoogleGenAI, Type } from "@google/genai";
import { SecretFinding, Severity } from "../types";

export class GeminiService {
  async analyzeCodeForSecrets(code: string, fileName: string): Promise<SecretFinding[]> {
    // Relying on AI context rather than restrictive regex to avoid "False Safe" results
    if (!code || code.trim().length < 5) return [];

    try {
      // Always initialize GoogleGenAI with a fresh instance right before use with the correct apiKey parameter
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      const response = await ai.models.generateContent({
        // Use gemini-3-pro-preview for complex reasoning and coding tasks
        model: "gemini-3-pro-preview",
        contents: `Analyze the provided code from file "${fileName}". 
        Your task is to identify hardcoded secrets, credentials, and sensitive configuration.
        
        LOOK FOR:
        - API Keys (AWS, Stripe, OpenAI, etc.)
        - Database connection strings and passwords
        - Private keys (RSA, SSH, PGP)
        - Authentication tokens (JWT, OAuth, Bearer)
        - High-entropy strings assigned to variables (e.g. const s = "Xy7...").

        CRITICAL: For each secret found, return the literal 'secretValue'. 
        If no secrets are found, return an empty array [].

        Code to analyze:
        ---
        ${code.substring(0, 8000)}
        ---`,
        config: {
          systemInstruction: "You are an expert security auditor. Your goal is to find accidentally committed secrets in code. Be precise and avoid false positives, but prioritize security. Always return valid JSON.",
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                line: { type: Type.INTEGER, description: "Line number" },
                type: { type: Type.STRING, description: "Type of secret (e.g. AWS Secret Key)" },
                snippet: { type: Type.STRING, description: "Small context snippet" },
                secretValue: { type: Type.STRING, description: "The actual hardcoded secret string" },
                severity: { 
                    type: Type.STRING, 
                    enum: Object.values(Severity),
                },
                explanation: { type: Type.STRING, description: "Why this is a risk" },
                suggestion: { type: Type.STRING, description: "How to fix (e.g. use env vars)" },
              },
              required: ["line", "type", "snippet", "secretValue", "severity", "explanation", "suggestion"]
            }
          }
        }
      });

      // Directly access the .text property from GenerateContentResponse
      const text = response.text?.trim();
      if (!text) return [];

      const findings = JSON.parse(text);
      return findings.map((f: any) => {
        const val = String(f.secretValue || "");
        const redacted = val.length > 8 
            ? `${val.substring(0, 4)}••••${val.substring(val.length - 4)}` 
            : "••••••••";

        return {
            ...f,
            id: Math.random().toString(36).substr(2, 9),
            file: fileName,
            redactedSecret: redacted
        };
      });
    } catch (error) {
      console.error("Gemini analysis error:", error);
      // Re-throw so UI can notify user of API failures rather than showing "Safe"
      throw new Error(error instanceof Error ? error.message : "Security analysis failed.");
    }
  }
}
