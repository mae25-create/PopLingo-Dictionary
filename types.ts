export interface DictionaryEntry {
  id: string;
  word: string; // The search term
  targetLanguage: string;
  nativeLanguage: string;
  definition: string; // Native language
  phoneticGuess?: string;
  examples: Array<{
    target: string;
    native: string;
  }>;
  usageNote: string;
  imageUrl: string;
  timestamp: number;
}

export interface Language {
  code: string;
  name: string;
  voiceName: string; // For TTS config
}

export type ViewState = 'home' | 'notebook' | 'study';

export const LANGUAGES: Language[] = [
  { code: 'en', name: 'English', voiceName: 'Puck' },
  { code: 'es', name: 'Spanish', voiceName: 'Kore' },
  { code: 'fr', name: 'French', voiceName: 'Fenrir' },
  { code: 'de', name: 'German', voiceName: 'Puck' },
  { code: 'zh', name: 'Chinese (Mandarin)', voiceName: 'Charon' },
  { code: 'ja', name: 'Japanese', voiceName: 'Kore' },
  { code: 'ko', name: 'Korean', voiceName: 'Kore' },
  { code: 'hi', name: 'Hindi', voiceName: 'Puck' },
  { code: 'pt', name: 'Portuguese', voiceName: 'Fenrir' },
  { code: 'ru', name: 'Russian', voiceName: 'Charon' },
  { code: 'ar', name: 'Arabic', voiceName: 'Zephyr' },
];