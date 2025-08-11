

export interface Singer {
  name: string;
  voice: string;
}

export enum LogLevel {
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR',
  GEMINI = 'GEMINI',
  IMAGEN = 'IMAGEN'
}

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  source: 'App' | 'Gemini' | 'Imagen';
  header: string;
  details: Record<string, any> | string;
}

export interface GenerationState {
  topic: string;
  expandedTopic: string;
  style: MusicStyle | null;
  mood: string | null;
  genre: string | null;
  pace: string | null;
  instrumentation: string | null;
  vocalStyle: string | null;
  lyricalTheme: string | null;
  instruments: string[];
  singers: Singer[];
  title: string;
  lyrics: string;
  language: string;
  language2: string;
  coverImagePrompts: string[];
  coverImageUrls: string[];
  selectedCoverImageIndex: number | null;
  thinkingMessage: string;
  imageGenerationSkipped: boolean;
}

export type Page = 'topic' | 'language' | 'qualities' | 'style' | 'instruments' | 'lyrics' | 'cover' | 'collection' | 'karaoke';

// --- New Data Structure ---

export type Instrument = {
    name: string;
    description: string;
    default?: boolean;
};

export type MusicStyleDefinition = {
    description: string;
    instruments: Instrument[];
};

export type StyleGroup = {
    name: string;
    description: string;
    styles: Record<string, MusicStyleDefinition>;
};

export type Language = {
    name: string;
    code: string;
};

export type LanguageGroup = {
    groupName: string;
    languages: Language[];
};

export type Quality = {
    name: string;
    description: string;
};

export type QualityGroup = {
  groupName: string;
  description: string;
  key: keyof Pick<GenerationState, 'mood' | 'genre' | 'pace' | 'instrumentation' | 'vocalStyle' | 'lyricalTheme'>;
  qualities: Quality[];
};

export type MusicStyle = string;