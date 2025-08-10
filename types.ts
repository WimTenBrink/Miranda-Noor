

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
  instruments: string[];
  title: string;
  lyrics: string;
  coverImagePrompts: string[];
  coverImageUrls: string[];
  selectedCoverImageIndex: number | null;
  thinkingMessage: string;
}

export type Page = 'topic' | 'style' | 'instruments' | 'lyrics' | 'cover' | 'collection';

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

export type MusicStyle = string;