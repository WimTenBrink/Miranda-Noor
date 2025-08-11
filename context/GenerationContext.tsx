
import React, { createContext, useState, useContext, ReactNode, Dispatch, SetStateAction, useEffect } from 'react';
import { GenerationState, MusicStyle, StyleGroup, MusicStyleDefinition, LanguageGroup, Singer, QualityGroup, SongRating } from '../types';

interface GenerationContextType {
  state: GenerationState;
  setState: Dispatch<SetStateAction<GenerationState>>;
  isLoading: boolean;
  setIsLoading: (loading: boolean, message?: string) => void;
  setTopic: (topic: string) => void;
  setStyle: (style: MusicStyle | null) => void;
  setMood: (mood: string | null) => void;
  setGenre: (genre: string | null) => void;
  setPace: (pace: string | null) => void;
  setInstrumentation: (instrumentation: string | null) => void;
  setVocalStyle: (vocalStyle: string | null) => void;
  setLyricalTheme: (lyricalTheme: string | null) => void;
  setDrumStyle: (drumStyle: string | null) => void;
  setSnareType: (snareType: string | null) => void;
  setSpecialInstrument: (specialInstrument: string | null) => void;
  setNarrativeDynamic: (narrativeDynamic: string | null) => void;
  setRating: (rating: SongRating) => void;
  setInstruments: (instruments: string[]) => void;
  setSingers: (singers: Singer[]) => void;
  setTitle: (title: string) => void;
  setLyrics: (lyrics: string) => void;
  setReportIntroduction: (intro: string) => void;
  setReportLyricsSnapshot: (lyrics: string) => void;
  setTranslatedLyrics: (translation: string) => void;
  setLanguage: (language: string) => void;
  setLanguage2: (language: string) => void;
  addCoverImagePrompt: (prompt: string) => void;
  addCoverImageUrl: (url: string) => void;
  setCoverImageUrls: (urls: string[]) => void;
  setCoverImagePrompts: (prompts: string[]) => void;
  setSelectedCoverImageIndex: (index: number | null) => void;
  setImageGenerationSkipped: (skipped: boolean) => void;
  setThinkingMessage: (message: string) => void;
  reset: () => void;
  // Style data from JSON
  isStyleDataLoading: boolean;
  styleGroups: StyleGroup[];
  styleData: Record<string, MusicStyleDefinition>;
  // Language data
  isLanguageDataLoading: boolean;
  languageGroups: LanguageGroup[];
  // Qualities data
  isQualitiesDataLoading: boolean;
  qualityGroups: QualityGroup[];
}

export const ALL_SINGERS: Singer[] = [
    { name: 'Miranda Noor', voice: 'Soprano' },
    { name: 'Annelies Brink', voice: 'Alto' },
    { name: 'Fannie de Jong', voice: 'Mezzo-Soprano' },
    { name: 'Emma Vermeer', voice: 'Feminine Baritone' },
];

const initialState: GenerationState = {
  topic: '',
  style: null,
  mood: null,
  genre: null,
  pace: null,
  instrumentation: null,
  vocalStyle: null,
  lyricalTheme: null,
  drumStyle: null,
  snareType: null,
  specialInstrument: null,
  narrativeDynamic: null,
  rating: 'PG-13',
  instruments: [],
  singers: [ALL_SINGERS[0], ALL_SINGERS[1]],
  title: '',
  lyrics: '',
  reportIntroduction: '',
  reportLyricsSnapshot: '',
  translatedLyrics: '',
  language: 'English',
  language2: 'English',
  coverImagePrompts: [],
  coverImageUrls: [],
  selectedCoverImageIndex: null,
  thinkingMessage: 'AI is thinking...',
  imageGenerationSkipped: false,
};

const STORAGE_KEY = 'mn-ab-generation-state';

const GenerationContext = createContext<GenerationContextType | undefined>(undefined);

export const GenerationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, setState] = useState<GenerationState>(initialState);
  const [isLoading, setIsLoadingState] = useState(false);
  
  const [isStyleDataLoading, setIsStyleDataLoading] = useState(true);
  const [styleGroups, setStyleGroups] = useState<StyleGroup[]>([]);
  const [styleData, setStyleData] = useState<Record<string, MusicStyleDefinition>>({});
  
  const [isLanguageDataLoading, setIsLanguageDataLoading] = useState(true);
  const [languageGroups, setLanguageGroups] = useState<LanguageGroup[]>([]);

  const [isQualitiesDataLoading, setIsQualitiesDataLoading] = useState(true);
  const [qualityGroups, setQualityGroups] = useState<QualityGroup[]>([]);


  useEffect(() => {
    try {
      const storedState = localStorage.getItem(STORAGE_KEY);
      if (storedState) {
        let parsedState = JSON.parse(storedState);
        // Migration logic...
        const mergedState = { ...initialState, ...parsedState };
        setState(mergedState);
      }
    } catch (error) {
      console.error("Failed to load state from localStorage", error);
    }
    
    // Fetch music styles
    fetch('/music-styles.json')
      .then(response => response.json())
      .then((data: StyleGroup[]) => {
        setStyleGroups(data);
        const allStyles: Record<string, MusicStyleDefinition> = {};
        data.forEach(group => { Object.assign(allStyles, group.styles); });
        setStyleData(allStyles);
      })
      .catch(error => console.error("Failed to fetch music styles:", error))
      .finally(() => setIsStyleDataLoading(false));

    // Fetch languages
    fetch('/languages.json')
      .then(response => response.json())
      .then((data: LanguageGroup[]) => setLanguageGroups(data))
      .catch(error => console.error("Failed to fetch languages:", error))
      .finally(() => setIsLanguageDataLoading(false));

    // Fetch qualities
    fetch('/qualities.json')
      .then(response => response.json())
      .then((data: QualityGroup[]) => setQualityGroups(data))
      .catch(error => console.error("Failed to fetch qualities:", error))
      .finally(() => setIsQualitiesDataLoading(false));

  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (error) {
      console.error("Failed to save state to localStorage", error);
    }
  }, [state]);

  const setThinkingMessage = (message: string) => setState(s => ({ ...s, thinkingMessage: message }));

  const setIsLoading = (loading: boolean, message: string = 'AI is thinking...') => {
    setIsLoadingState(loading);
    if (loading) {
      setThinkingMessage(message);
    }
  };

  const setTopic = (topic: string) => setState(s => ({ ...s, topic }));
  const setStyle = (style: MusicStyle | null) => setState(s => ({ ...s, style, instruments: [] }));
  const setMood = (mood: string | null) => setState(s => ({ ...s, mood }));
  const setGenre = (genre: string | null) => setState(s => ({ ...s, genre }));
  const setPace = (pace: string | null) => setState(s => ({ ...s, pace }));
  const setInstrumentation = (instrumentation: string | null) => setState(s => ({ ...s, instrumentation }));
  const setVocalStyle = (vocalStyle: string | null) => setState(s => ({ ...s, vocalStyle }));
  const setLyricalTheme = (lyricalTheme: string | null) => setState(s => ({ ...s, lyricalTheme }));
  const setDrumStyle = (drumStyle: string | null) => setState(s => ({ ...s, drumStyle }));
  const setSnareType = (snareType: string | null) => setState(s => ({ ...s, snareType }));
  const setSpecialInstrument = (specialInstrument: string | null) => setState(s => ({ ...s, specialInstrument }));
  const setNarrativeDynamic = (narrativeDynamic: string | null) => setState(s => ({ ...s, narrativeDynamic }));
  const setRating = (rating: SongRating) => setState(s => ({...s, rating}));
  const setInstruments = (instruments: string[]) => setState(s => ({ ...s, instruments }));
  const setSingers = (singers: Singer[]) => setState(s => ({ ...s, singers }));
  const setTitle = (title: string) => setState(s => ({ ...s, title }));
  const setLyrics = (lyrics: string) => setState(s => ({ ...s, lyrics }));
  const setLanguage = (language: string) => setState(s => ({ ...s, language }));
  const setLanguage2 = (language: string) => setState(s => ({ ...s, language2: language }));
  const setReportIntroduction = (intro: string) => setState(s => ({ ...s, reportIntroduction: intro }));
  const setReportLyricsSnapshot = (lyrics: string) => setState(s => ({ ...s, reportLyricsSnapshot: lyrics }));
  const setTranslatedLyrics = (translation: string) => setState(s => ({...s, translatedLyrics: translation}));
  
  const addCoverImagePrompt = (prompt: string) => setState(s => ({...s, coverImagePrompts: [...s.coverImagePrompts, prompt]}));
  const addCoverImageUrl = (url: string) => setState(s => ({ 
      ...s, 
      coverImageUrls: [...s.coverImageUrls, url],
      selectedCoverImageIndex: s.coverImageUrls.length
  }));
  const setCoverImageUrls = (urls: string[]) => setState(s => ({...s, coverImageUrls: urls}));
  const setCoverImagePrompts = (prompts: string[]) => setState(s => ({...s, coverImagePrompts: prompts}));
  const setSelectedCoverImageIndex = (index: number | null) => setState(s => ({...s, selectedCoverImageIndex: index}));
  const setImageGenerationSkipped = (skipped: boolean) => setState(s => ({ ...s, imageGenerationSkipped: skipped }));
  
  const reset = () => {
    localStorage.removeItem(STORAGE_KEY);
    setState(initialState);
  };

  const value: GenerationContextType = {
    state,
    setState,
    isLoading,
    setIsLoading,
    setTopic,
    setStyle,
    setMood,
    setGenre,
    setPace,
    setInstrumentation,
    setVocalStyle,
    setLyricalTheme,
    setDrumStyle,
    setSnareType,
    setSpecialInstrument,
    setNarrativeDynamic,
    setRating,
    setInstruments,
    setSingers,
    setTitle,
    setLyrics,
    setReportIntroduction,
    setReportLyricsSnapshot,
    setTranslatedLyrics,
    setLanguage,
    setLanguage2,
    addCoverImagePrompt,
    addCoverImageUrl,
    setCoverImageUrls,
    setCoverImagePrompts,
    setSelectedCoverImageIndex,
    setImageGenerationSkipped,
    setThinkingMessage,
    reset,
    isStyleDataLoading,
    styleGroups,
    styleData,
    isLanguageDataLoading,
    languageGroups,
    isQualitiesDataLoading,
    qualityGroups,
  };

  return (
    <GenerationContext.Provider value={value}>
      {children}
    </GenerationContext.Provider>
  );
};

export const useGenerationContext = (): GenerationContextType => {
  const context = useContext(GenerationContext);
  if (!context) {
    throw new Error('useGenerationContext must be used within a GenerationProvider');
  }
  return context;
};
