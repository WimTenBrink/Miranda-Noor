
import React, { createContext, useState, useContext, ReactNode, Dispatch, SetStateAction, useEffect } from 'react';
import { GenerationState, MusicStyle, StyleGroup, MusicStyleDefinition } from '../types';

interface GenerationContextType {
  state: GenerationState;
  setState: Dispatch<SetStateAction<GenerationState>>;
  isLoading: boolean;
  setIsLoading: (loading: boolean, message?: string) => void;
  setTopic: (topic: string) => void;
  setExpandedTopic: (expandedTopic: string) => void;
  setStyle: (style: MusicStyle | null) => void;
  setInstruments: (instruments: string[]) => void;
  setTitle: (title: string) => void;
  setLyrics: (lyrics: string) => void;
  addCoverImagePrompt: (prompt: string) => void;
  addCoverImageUrl: (url: string) => void;
  setCoverImageUrls: (urls: string[]) => void;
  setCoverImagePrompts: (prompts: string[]) => void;
  setSelectedCoverImageIndex: (index: number | null) => void;
  setThinkingMessage: (message: string) => void;
  reset: () => void;
  // Style data from JSON
  isStyleDataLoading: boolean;
  styleGroups: StyleGroup[];
  styleData: Record<string, MusicStyleDefinition>;
}

const initialState: GenerationState = {
  topic: '',
  expandedTopic: '',
  style: null,
  instruments: [],
  title: '',
  lyrics: '',
  coverImagePrompts: [],
  coverImageUrls: [],
  selectedCoverImageIndex: null,
  thinkingMessage: 'AI is thinking...',
};

const STORAGE_KEY = 'mn-ab-generation-state';

const GenerationContext = createContext<GenerationContextType | undefined>(undefined);

export const GenerationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, setState] = useState<GenerationState>(initialState);
  const [isLoading, setIsLoadingState] = useState(false);
  
  // State for dynamically loaded style data
  const [isStyleDataLoading, setIsStyleDataLoading] = useState(true);
  const [styleGroups, setStyleGroups] = useState<StyleGroup[]>([]);
  const [styleData, setStyleData] = useState<Record<string, MusicStyleDefinition>>({});

  useEffect(() => {
    // Load generation state from local storage
    try {
      const storedState = localStorage.getItem(STORAGE_KEY);
      if (storedState) {
        let parsedState = JSON.parse(storedState);

        // Migration logic for old state structure
        if (parsedState.coverImageUrl && !parsedState.coverImageUrls) {
            parsedState.coverImageUrls = [parsedState.coverImageUrl];
            delete parsedState.coverImageUrl;
        }
        if (parsedState.coverImagePrompt && !parsedState.coverImagePrompts) {
            parsedState.coverImagePrompts = [parsedState.coverImagePrompt];
            delete parsedState.coverImagePrompt;
        }
        if (parsedState.coverImageUrls && parsedState.coverImageUrls.length > 0 && parsedState.selectedCoverImageIndex === undefined) {
            // Set the selected index to the last image if it's not already set
            parsedState.selectedCoverImageIndex = parsedState.coverImageUrls.length - 1;
        }

        const mergedState = { ...initialState, ...parsedState };
        setState(mergedState);
      }
    } catch (error) {
      console.error("Failed to load state from localStorage", error);
    }
    
    // Fetch music styles from JSON
    fetch('/music-styles.json')
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then((data: StyleGroup[]) => {
        setStyleGroups(data);
        const allStyles: Record<string, MusicStyleDefinition> = {};
        data.forEach(group => {
            Object.assign(allStyles, group.styles);
        });
        setStyleData(allStyles);
      })
      .catch(error => {
        console.error("Failed to fetch music styles:", error);
        // Handle error state in UI if necessary
      })
      .finally(() => {
        setIsStyleDataLoading(false);
      });

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
  const setExpandedTopic = (expandedTopic: string) => setState(s => ({ ...s, expandedTopic }));
  const setStyle = (style: MusicStyle | null) => setState(s => ({ ...s, style, instruments: [] }));
  const setInstruments = (instruments: string[]) => setState(s => ({ ...s, instruments }));
  const setTitle = (title: string) => setState(s => ({ ...s, title }));
  const setLyrics = (lyrics: string) => setState(s => ({ ...s, lyrics }));
  
  const addCoverImagePrompt = (prompt: string) => setState(s => ({...s, coverImagePrompts: [...s.coverImagePrompts, prompt]}));
  const addCoverImageUrl = (url: string) => setState(s => ({ 
      ...s, 
      coverImageUrls: [...s.coverImageUrls, url],
      selectedCoverImageIndex: s.coverImageUrls.length
  }));
  const setCoverImageUrls = (urls: string[]) => setState(s => ({...s, coverImageUrls: urls}));
  const setCoverImagePrompts = (prompts: string[]) => setState(s => ({...s, coverImagePrompts: prompts}));
  const setSelectedCoverImageIndex = (index: number | null) => setState(s => ({...s, selectedCoverImageIndex: index}));
  
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
    setExpandedTopic,
    setStyle,
    setInstruments,
    setTitle,
    setLyrics,
    addCoverImagePrompt,
    addCoverImageUrl,
    setCoverImageUrls,
    setCoverImagePrompts,
    setSelectedCoverImageIndex,
    setThinkingMessage,
    reset,
    isStyleDataLoading,
    styleGroups,
    styleData,
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