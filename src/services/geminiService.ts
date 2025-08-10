import { GoogleGenAI, GenerateContentResponse, Type } from "@google/genai";
import { LogEntry, LogLevel, MusicStyle } from '../types';
import { getCharacterDescriptions } from './characterService';

type LogFn = (entry: Omit<LogEntry, 'timestamp'>) => void;

const getAi = (apiKey: string) => {
    if (!apiKey) {
        throw new Error("API Key is required.");
    }
    return new GoogleGenAI({ apiKey });
};

export const expandTopic = async (apiKey: string, topic: string, log: LogFn): Promise<string> => {
    const ai = getAi(apiKey);
    const prompt = `You are a creative muse. Expand the following user-provided topic or keywords into a rich, descriptive paragraph of about 300-500 words. This will be used as the basis for a song. Focus on imagery, emotion, and potential narrative arcs. Do not write lyrics, just the underlying story and mood. User topic: "${topic}"`;
    
    const requestPayload = {
        model: "gemini-2.5-flash",
        contents: prompt,
    };
    
    log({ level: LogLevel.GEMINI, source: 'Gemini', header: 'Request: Expand Topic', details: requestPayload });

    try {
        const response = await ai.models.generateContent(requestPayload);
        log({ level: LogLevel.GEMINI, source: 'Gemini', header: 'Response: Expand Topic', details: response });
        return response.text.trim();
    } catch (error: any) {
        log({ level: LogLevel.ERROR, source: 'Gemini', header: 'Error Expanding Topic', details: { error: error.message, stack: error.stack } });
        throw error;
    }
};

export const generateTitleAndLyrics = async (apiKey: string, { topic, style, instruments }: { topic: string, style: MusicStyle, instruments: string[] }, log: LogFn): Promise<{ title: string, lyrics: string }> => {
    const ai = getAi(apiKey);
    const prompt = `You are an expert songwriter creating lyrics for a song to be performed by a female duet (Miranda Noor and Annelies Brink).
    The song is in the style of: ${style}.
    It should feature the following instruments: ${instruments.join(', ')}.
    The song's theme is based on this story:
    ---
    ${topic || "An uplifting song about friendship and creativity."}
    ---
    Your task is to generate a suitable song title and the full song lyrics. To ensure the song fits within typical generation limits (around 2-3 minutes including instrumentals), please create a concise song structure.
    For example, a good structure would be: [Intro], [Verse 1], [Chorus], [Verse 2], [Chorus], [Bridge], [Instrumental Solo], [Chorus], [Outro].
    Avoid overly long verses or too many repeating sections.
    
    Follow these strict formatting rules for Suno AI:
    - Use tags like [Intro], [Verse], [Chorus], [Bridge], [Outro], etc., to structure the song.
    - Indicate non-lyrical vocalizations like (oohs), (aahs).
    - Use [Spoken Word] for spoken parts.
    - Use *sound effect* for sound effects, like *thunder clap*.
    - Clearly label parts for each singer: [Miranda], [Annelies], or [Duet].
    
    **Critically Important:** All musical or performance instructions MUST be enclosed in \`[]\` brackets. Do NOT write descriptive sentences about the music within the lyrics, such as 'The guitar comes in here'. Instead, use bracketed tags like \`[Acoustic guitar intro]\` or \`[Music fades out]\`. The lyrics should only contain the words to be sung and the bracketed instructions.

    Output a JSON object with two keys: "title" and "lyrics".
    Do not include any other text or explanation outside of the JSON object.`;
    
    const requestPayload = {
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    title: {
                        type: Type.STRING,
                        description: "A creative and fitting title for the song."
                    },
                    lyrics: { 
                        type: Type.STRING,
                        description: "The full lyrics of the song, formatted with line breaks and structural tags like [Verse], [Chorus], and singer parts like [Miranda] or [Annelies]. The structure should be concise (e.g., 2 verses, a bridge) to fit a 2-3 minute runtime. All instructions must be in brackets."
                    }
                }
            }
        }
    };
    
    log({ level: LogLevel.GEMINI, source: 'Gemini', header: 'Request: Generate Title & Lyrics', details: requestPayload });

    try {
        const response = await ai.models.generateContent(requestPayload);
        log({ level: LogLevel.GEMINI, source: 'Gemini', header: 'Response: Generate Title & Lyrics', details: response });
        
        if (!response.text) {
            log({
                level: LogLevel.ERROR,
                source: 'Gemini',
                header: 'Gemini response is empty',
                details: { fullResponse: response }
            });
            throw new Error('AI returned an empty response. Please try again.');
        }

        // Robust JSON parsing: clean and validate
        let cleanedText = response.text.trim();
        const jsonMatch = cleanedText.match(/```(json)?\s*([\s\S]*?)\s*```/);
        if (jsonMatch && jsonMatch[2]) {
            cleanedText = jsonMatch[2];
        }

        try {
            const parsed = JSON.parse(cleanedText);
            
            if (typeof parsed.title !== 'string' || typeof parsed.lyrics !== 'string') {
                 log({
                    level: LogLevel.ERROR,
                    source: 'Gemini',
                    header: 'Parsed JSON has incorrect format or missing fields',
                    details: {
                        parsedObject: parsed,
                        originalText: response.text,
                    }
                });
                throw new Error('AI returned data with missing title or lyrics. Please try again.');
            }

            return parsed;
        } catch (parseError: any) {
            log({
                level: LogLevel.ERROR,
                source: 'Gemini',
                header: 'Error Parsing Gemini JSON Response',
                details: {
                    error: parseError.message,
                    cleanedText: cleanedText,
                    originalResponseText: response.text,
                }
            });
            throw new Error('AI returned invalid data format. Please try again.');
        }

    } catch (error: any) {
        // Log if it's not one of our custom errors that is already explained
        if (!error.message.startsWith('AI returned')) {
          log({ level: LogLevel.ERROR, source: 'Gemini', header: 'Error Generating Title & Lyrics', details: { error: error.message, stack: error.stack } });
        }
        throw error;
    }
};

export const generateImagePrompt = async (apiKey: string, { topic, style }: { topic: string, style: MusicStyle | null }, log: LogFn): Promise<string> => {
    const ai = getAi(apiKey);
    
    const { miranda, annelies } = await getCharacterDescriptions();

    const prompt = `You are an expert prompt engineer for text-to-image models like Imagen.
Your task is to create a single, detailed, high-quality image prompt for a song's cover art.

**Core Subject:** The image MUST feature a female music duet (two young women) named Miranda and Annelies, performing together.
- **Miranda's Description:** ${miranda}
- **Annelies's Description:** ${annelies}

**Overall Theme & Background:** The song's theme is: "${topic || "Two female musicians creating music together"}". The background and environment of the image must subtly reflect this theme. For example, if the topic is 'a summer rainstorm in the city', the background could be a cozy room with a rain-streaked window overlooking city lights. Do not just put the topic in the background, but integrate it into the scene.

**Musical Style:** The music style is: ${style || "Pop"}. Their clothing, expressions, and the overall mood of the image should reflect this musical style.

**Instructions:**
- Combine all these elements into one cohesive, artistic scene.
- Describe their appearances based on the descriptions, their clothing, their emotional expressions, and their interaction with each other (and perhaps their instruments).
- Focus on creating a visually stunning and emotionally resonant image.
- Use descriptive keywords that text-to-image models understand well:
    - For Composition: cinematic, dynamic angle, symmetrical, rule of thirds.
    - For Lighting: soft lighting, dramatic lighting, neon glow, golden hour, Rembrandt lighting.
    - For Detail: photorealistic, 8k, hyper-detailed, intricate, sharp focus.
    - For Mood: ethereal, energetic, melancholic, joyful, mysterious.

Output only the final prompt as a single line of text. Do not include any other explanations.`;

    const requestPayload = {
        model: "gemini-2.5-flash",
        contents: prompt,
    };
    
    log({ level: LogLevel.GEMINI, source: 'Gemini', header: 'Request: Generate Image Prompt', details: requestPayload });

    try {
        const response = await ai.models.generateContent(requestPayload);
        log({ level: LogLevel.GEMINI, source: 'Gemini', header: 'Response: Generate Image Prompt', details: response });
        return response.text.trim();
    } catch (error: any) {
        log({ level: LogLevel.ERROR, source: 'Gemini', header: 'Error Generating Image Prompt', details: { error: error.message, stack: error.stack } });
        throw error;
    }
};

export const suggestStyle = async (apiKey: string, topic: string, allStyles: string[], log: LogFn): Promise<MusicStyle | null> => {
    const ai = getAi(apiKey);
    const prompt = `From the following list of music styles, which one best fits the song topic provided below?
Your answer must be ONLY the style name, exactly as it appears in the list. Do not add any other words, punctuation, or explanations.

Available Styles:
${allStyles.join(', ')}

Song Topic:
"${topic}"
`;

    const requestPayload = {
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
            temperature: 0.1,
            topK: 1
        }
    };
    
    log({ level: LogLevel.GEMINI, source: 'Gemini', header: 'Request: Suggest Style', details: requestPayload });

    try {
        const response = await ai.models.generateContent(requestPayload);
        log({ level: LogLevel.GEMINI, source: 'Gemini', header: 'Response: Suggest Style', details: response });

        const suggestedStyle = response.text.trim();
        if (allStyles.includes(suggestedStyle)) {
            return suggestedStyle;
        } else {
            log({ level: LogLevel.WARN, source: 'Gemini', header: 'Suggested style not in list or invalid response', details: { suggested: suggestedStyle, fullResponse: response } });
            return null;
        }
    } catch (error: any) {
        log({ level: LogLevel.ERROR, source: 'Gemini', header: 'Error Suggesting Style', details: { error: error.message, stack: error.stack } });
        return null;
    }
};