import { GoogleGenAI, Type } from "@google/genai";
import { SecretFinding, Severity } from "../types";

/**
 * MANDATORY: The API key must be obtained exclusively from process.env.API_KEY.
 * We declare it globally here to satisfy the TypeScript compiler during build.
 */
declare global {
  namespace NodeJS {
    interface ProcessEnv {
      // Added readonly modifier to align with vite-env.d.ts and avoid TypeScript declaration conflicts.
      readonly API_KEY: string;
    }
  }
}

export class GeminiService {
  async analyzeCodeForSecrets(code: string, fileName: string): Promise<SecretFinding[]> {
    const patterns = [
        /api[_-]?key/i, /password/i, /secret/i, /token/i, /access[_-]?key/i,
        /sk-[a-zA-Z0-9]{48}/, 
        /AIza[0-9A-Za-z-_]{35}/, 
        /sq0atp-[0-9A-Za-z\-_]{22}/, 
        /https:\/\/hooks\.slack\.com\/services\/T[0-9A-Z]{8}\/B[0-9A-Z]{8}\/[0-9A-Za-z]{24}/,
    ];

    const hasSuspiciousContent = patterns.some(p => p.test(code));
    if (!hasSuspiciousContent) return [];

    try {
      // MANDATORY: Create a new GoogleGenAI instance right before making an API call 
      // to ensure it always uses the most up-to-date API key from the environment.
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Analyze the following code from file "${fileName}" and identify if any hardcoded secrets are present.
        
        CRITICAL: For each secret found, you MUST return the 'secretValue' which is the literal text of the secret string so it can be redacted.
        
        Return results as a JSON array.
        Code:
        \`\`\`
        ${code.substring(0, 5000)}
        \`\`\``,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                line: { type: Type.INTEGER, description: "Line number" },
                type: { type: Type.STRING, description: "Type (e.g. AWS Key)" },
                snippet: { type: Type.STRING, description: "Surrounding context snippet" },
                secretValue: { type: Type.STRING, description: "The literal secret string found" },
                severity: { 
                    type: Type.STRING, 
                    enum: Object.values(Severity),
                },
                explanation: { type: Type.STRING, description: "Detailed risk assessment" },
                suggestion: { type: Type.STRING, description: "Remediation steps" },
              },
              required: ["line", "type", "snippet", "secretValue", "severity", "explanation", "suggestion"]
            }
          }
        }
      });

      const findings = JSON.parse(response.text || "[]");
      return findings.map((f: any) => {
        const val = f.secretValue || "";
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
      return [];
    }
  }
}
