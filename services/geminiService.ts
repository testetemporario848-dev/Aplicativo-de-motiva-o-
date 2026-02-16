
import { GoogleGenAI, Type } from "@google/genai";
import { ReflectionResponse } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || "" });

export const generateReflection = async (category: string, context: string): Promise<ReflectionResponse> => {
  const model = ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Analise a seguinte situação e forneça uma reflexão profunda, um conselho prático, uma afirmação positiva e uma citação relevante. 
    A resposta deve ser empática, sábia e encorajadora.
    
    Categoria: ${category}
    Contexto do Usuário: ${context}`,
    config: {
      systemInstruction: "Você é um mentor de vida sábio e empático, focado em reflexão profunda e psicologia positiva. Seus conselhos não são superficiais; eles buscam a causa raiz e o crescimento pessoal.",
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          reflection: {
            type: Type.STRING,
            description: 'Uma reflexão profunda sobre o estado interno e a situação.',
          },
          advice: {
            type: Type.STRING,
            description: 'Um conselho prático e compassivo sobre o que fazer ou como pensar.',
          },
          affirmation: {
            type: Type.STRING,
            description: 'Uma afirmação positiva curta para o usuário repetir.',
          },
          quote: {
            type: Type.OBJECT,
            properties: {
              text: { type: Type.STRING },
              author: { type: Type.STRING }
            },
            required: ['text', 'author']
          },
        },
        required: ['reflection', 'advice', 'affirmation', 'quote'],
      },
    },
  });

  const response = await model;
  const jsonStr = response.text?.trim() || "{}";
  return JSON.parse(jsonStr);
};

export const generateRandomReflection = async (): Promise<ReflectionResponse> => {
  const model = ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: "Gere uma reflexão aleatória curta e impactante para o dia.",
    config: {
      systemInstruction: "Você é um mentor zen. Gere uma reflexão concisa (máximo 2 frases) e um conselho prático curto. Use o formato JSON.",
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          reflection: { type: Type.STRING },
          advice: { type: Type.STRING },
          affirmation: { type: Type.STRING },
          quote: {
            type: Type.OBJECT,
            properties: {
              text: { type: Type.STRING },
              author: { type: Type.STRING }
            }
          }
        },
        required: ['reflection', 'advice', 'affirmation', 'quote']
      }
    }
  });

  const response = await model;
  return JSON.parse(response.text?.trim() || "{}");
};
