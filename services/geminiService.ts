import { GoogleGenAI, Type, Modality } from "@google/genai";
import { DictionaryEntry, LANGUAGES } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// -- Text Generation (Definition, Examples, Usage) --
export const fetchDefinition = async (
  text: string,
  nativeLang: string,
  targetLang: string
): Promise<Partial<DictionaryEntry>> => {
  
  const prompt = `
    User input: "${text}".
    Native Language: ${nativeLang}.
    Target Language: ${targetLang}.
    
    Task:
    1. Identify if the input is in Native or Target. If Native, translate to Target first. If Target, use as is. This is the "word".
    2. Provide a natural definition in ${nativeLang}.
    3. Provide 2 example sentences in ${targetLang} with ${nativeLang} translations.
    4. Write a "usageNote" in ${nativeLang}. usageNote should be fun, lively, casual (like a friend explaining), explaining cultural nuance, tone, or common confusion. Be concise. No fillers.
    
    Return JSON.
  `;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          word: { type: Type.STRING, description: "The word/phrase in target language" },
          definition: { type: Type.STRING, description: "Definition in native language" },
          examples: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                target: { type: Type.STRING },
                native: { type: Type.STRING },
              }
            }
          },
          usageNote: { type: Type.STRING }
        }
      }
    }
  });

  if (response.text) {
    return JSON.parse(response.text);
  }
  throw new Error("Failed to generate definition");
};

// -- Image Generation --
export const fetchImage = async (word: string): Promise<string> => {
  const prompt = `A bright, pop-art style, fun, minimalist illustration representing the concept of: "${word}". White background.`;
  
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash-image", // Using flash-image for speed as requested
    contents: prompt,
  });

  for (const part of response.candidates?.[0]?.content?.parts || []) {
    if (part.inlineData) {
      return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
    }
  }
  return ""; // Fallback or empty if fail
};

// -- Audio Generation (TTS) --
export const fetchAudio = async (text: string, voiceName: string = 'Kore'): Promise<string> => {
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash-preview-tts",
    contents: [{ parts: [{ text }] }],
    config: {
      responseModalities: [Modality.AUDIO],
      speechConfig: {
        voiceConfig: {
          prebuiltVoiceConfig: { voiceName },
        },
      },
    },
  });

  const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
  if (base64Audio) {
    return base64Audio;
  }
  throw new Error("Failed to generate audio");
};

// -- Story Generation --
export const generateStory = async (
  words: DictionaryEntry[],
  nativeLang: string,
  targetLang: string
): Promise<string> => {
  const wordList = words.map(w => w.word).join(", ");
  
  const prompt = `
    Write a short, fun, and crazy story (approx 150 words) in ${targetLang} that incorporates the following words: ${wordList}.
    The story should be designed to help a learner memorize these words.
    After the story, provide a brief summary/translation in ${nativeLang}.
    Highlight the keywords in the story by wrapping them in asterisks like *word*.
  `;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
  });

  return response.text || "Could not generate story.";
};
