

import { GoogleGenAI, GenerateContentResponse, Type } from "@google/genai";
import { LogEntry, LogLevel, MusicStyle, Singer, SongRating } from '../types';
import { getCharacterDescriptions } from './characterService';

type LogFn = (entry: Omit<LogEntry, 'timestamp'>) => void;

interface SelectorOptions {
    mood: string | null;
    genre: string | null;
    pace: string | null;
    instrumentation: string | null;
    vocalStyle: string | null;
    lyricalTheme: string | null;
    drumStyle: string | null;
    snareType: string | null;
    specialInstrument: string | null;
    narrativeDynamic: string | null;
}

const getAi = (apiKey: string) => {
    if (!apiKey) {
        throw new Error("API Key is required.");
    }
    return new GoogleGenAI({ apiKey });
};

export const expandTopic = async (apiKey: string, topic: string, singers: Singer[], rating: SongRating, log: LogFn): Promise<string> => {
    const ai = getAi(apiKey);
    
    const singerNames = singers.map(s => s.name);
    const has = (name: string) => singerNames.includes(name);

    let performerDescription = '';
    if (singers.length === 1) {
        performerDescription = `a solo performance by ${singers[0].name}.`;
    } else if (singers.length === 2) {
        performerDescription = `a duet between ${singerNames[0]} and ${singerNames[1]}.`;
    } else {
        performerDescription = `a small choir piece for ${singerNames.join(', ')}.`;
    }

    let personalContext = '';
    if (singers.length === 2) {
        const isMirandaAndAnnelies = has('Miranda Noor') && has('Annelies Brink');
        const isFannieAndEmma = has('Fannie de Jong') && has('Emma Vermeer');

        if (isMirandaAndAnnelies) {
            personalContext = ' The performers, Miranda and Annelies, are a romantic couple. Their music often reflects their deep, romantic bond.';
        } else if (isFannieAndEmma) {
            personalContext = ' The performers, Fannie and Emma, are close friends. Their music often reflects their intimate and playful chemistry.';
        }
    } else if (singers.length === 4 && has('Miranda Noor') && has('Annelies Brink') && has('Fannie de Jong') && has('Emma Vermeer')) {
        personalContext = ' The group consists of two pairs: the romantic couple Miranda and Annelies, and the playful, close friends Fannie and Emma. You can draw on these dynamics.';
    }

    if (personalContext) {
        personalContext += ' A consistent underlying theme for all their songs is a subtle sapphic sensibility, exploring love and connection from a female perspective.';
    }

    const ratingInstruction = `**Content Rating:** The narrative must adhere to a "${rating}" rating.
- G: Suitable for all audiences. No mature themes.
- PG: Parental guidance suggested. May contain mild thematic elements.
- PG-13: Parents strongly cautioned. May contain some suggestive themes, brief strong language, or non-graphic allusions to mature topics.
- R: Restricted. May contain strong language, mature themes, and non-explicit references to violence or sensuality.
- NC-17: Adults only. Can explore themes of violence and eroticism in an artistic, non-gratuitous way. Polite but explicit names for body parts and specific acts can be used.`;


    const prompt = `You are a creative muse. Your goal is to expand a user's song idea into a rich, descriptive paragraph of about 300-500 words. This will be used as the basis for a song.
    
${ratingInstruction}

The song will be performed by ${performerDescription}. This context can optionally influence the narrative. For example, a solo might be more introspective, while a duet or choir song could explore themes of interaction, harmony, or contrasting viewpoints.
${personalContext ? `\nFor additional, optional context about the performers: ${personalContext}\n` : ''}
If the user's topic mentions any names, you must incorporate them into the narrative you create.

Focus on imagery, emotion, and potential narrative arcs. Do not write lyrics, just the underlying story and mood. Do not mention specific instruments or musical styles.

User topic: "${topic}"`;
    
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

export const generateTitleAndLyrics = async (apiKey: string, { topic, style, instruments, language, language2, singers, rating, mood, genre, pace, instrumentation, vocalStyle, lyricalTheme, drumStyle, snareType, specialInstrument, narrativeDynamic }: { topic: string, style: MusicStyle, instruments: string[], language: string, language2: string, singers: Singer[], rating: SongRating, mood: string | null, genre: string | null, pace: string | null, instrumentation: string | null, vocalStyle: string | null, lyricalTheme: string | null, drumStyle: string | null, snareType: string | null, specialInstrument: string | null, narrativeDynamic: string | null }, log: LogFn): Promise<{ title: string, lyrics: string }> => {
    const ai = getAi(apiKey);

    const isBilingual = language.toLowerCase() !== language2.toLowerCase();
    const singerLabels = singers.map(s => `[${s.name.split(' ')[0]}]`);

    let languageInstruction = `The song must be written entirely in ${language}. The title must also be in ${language}.`;
    let performerInstruction = '';

    const leadSingers = singers.filter(s => s.name === 'Miranda Noor' || s.name === 'Annelies Brink');
    const backgroundSingers = singers.filter(s => s.name === 'Fannie de Jong' || s.name === 'Emma Vermeer');

    let rolesInstruction = '';
    if (leadSingers.length > 0 || backgroundSingers.length > 0) {
        const roleParts = [];
        if (leadSingers.length > 0) {
            const leadVerb = leadSingers.length === 1 ? 'is a main singer.' : 'are main singers.';
            roleParts.push(`${leadSingers.map(s => s.name).join(' and ')} ${leadVerb}`);
        }
        if (backgroundSingers.length > 0) {
            const bgVerb = backgroundSingers.length === 1 ? 'is a background singer and will perform any rap lyrics.' : 'are background singers and will perform any rap lyrics.';
            roleParts.push(`${backgroundSingers.map(s => s.name).join(' and ')} ${bgVerb}`);
        }
        rolesInstruction = 'Performer Roles: ' + roleParts.join(' ');
    }


    if (singers.length === 1) {
        performerInstruction = `The song is a solo performed by ${singers[0].name} (${singers[0].voice}). All lyrics should be for this singer, using the label ${singerLabels[0]}.`;
    } else if (singers.length === 2) {
        const duetLabels = singers.map(s => `[${s.name.split(' ')[0]}]`).join(' and ');
        if (isBilingual) {
            languageInstruction = `This is a bilingual song. The title must be in ${language}.
- ${singers[0].name} will sing in ${language}.
- ${singers[1].name} will sing in ${language2}.
**IMPORTANT RULE:** Before each singer's part, you MUST specify the language in brackets. Example: "[${language}] [${singers[0].name.split(' ')[0]}]" or "[${language2}] [${singers[1].name.split(' ')[0]}]".
For duet parts sung together, favor ${language} unless the blend of languages is more artistic.`;
            performerInstruction = `The song is a bilingual duet. ${rolesInstruction} Use labels ${duetLabels} to assign parts. Use [Duet] when they sing together.`;
        } else {
            performerInstruction = `The song is a duet performed by ${singers[0].name} (${singers[0].voice}) and ${singers[1].name} (${singers[1].voice}). ${rolesInstruction} Use the labels ${duetLabels} to assign parts. Use [Duet] when they sing together.`;
        }
    } else { // Choir
        if (isBilingual) {
            languageInstruction = `This is a bilingual choir song. The primary language is ${language}, and the title must be in ${language}.
- ${singers[1].name} (${singers[1].voice}) should sing her solo parts in ${language2}.
- All other singers sing in ${language}.
**IMPORTANT RULE:** Before each singer's part, you MUST specify the language in brackets. Example: "[${language}] [Miranda]" or "[${language2}] [Annelies]".
For full choir parts, use the primary language, ${language}.`;
            performerInstruction = `The song is for a female choir of ${singers.length}. ${rolesInstruction} Clearly label all parts (e.g., [Miranda], [Annelies], [Choir]).`;
        } else {
            performerInstruction = `The song is for a female choir of ${singers.length}. ${rolesInstruction} Clearly label parts for each singer using their names in brackets (e.g., ${singerLabels.join(', ')}). Use [Choir] or [All] when they all sing together.`;
        }
    }

    let relationshipInstruction = '';
    if (narrativeDynamic) {
        relationshipInstruction = `The core narrative dynamic of the song is: **${narrativeDynamic}**. The lyrics MUST reflect this dynamic in the interactions and perspectives of the singers. All lyrics should be interpreted from a female perspective.`;
    } else {
        // Fallback to original hardcoded logic if no dynamic is chosen
        const singerNames = singers.map(s => s.name);
        const has = (name: string) => singerNames.includes(name);

        relationshipInstruction = 'A consistent underlying theme for all their songs is a subtle sapphic sensibility; the lyrics should reflect this, exploring themes of love, connection, and identity from a female perspective, regardless of the main topic.';

        if (singers.length === 2) {
            const isMirandaAndAnnelies = has('Miranda Noor') && has('Annelies Brink');
            const isFannieAndEmma = has('Fannie de Jong') && has('Emma Vermeer');

            if (isMirandaAndAnnelies) {
                relationshipInstruction += ' This song is for the couple Miranda and Annelies. The lyrics should reflect their deep, romantic bond.';
            } else if (isFannieAndEmma) {
                relationshipInstruction += ' This song is for the close friends Fannie and Emma. The lyrics should reflect their intimate and playful chemistry.';
            }
        } else if (singers.length === 4 && has('Miranda Noor') && has('Annelies Brink') && has('Fannie de Jong') && has('Emma Vermeer')) {
            relationshipInstruction += ' The group consists of two pairs: the romantic couple Miranda and Annelies, and the playful, close friends Fannie and Emma. The lyrics can explore the dynamics within and between these pairs.';
        }
    }

    const ratingInstruction = `**Content Rating:** The song must adhere to a "${rating}" rating.
- G: Suitable for all audiences. No mature themes.
- PG: Parental guidance suggested. May contain mild thematic elements.
- PG-13: Parents strongly cautioned. May contain some suggestive themes, brief strong language, or non-graphic allusions to mature topics.
- R: Restricted. May contain strong language, mature themes, and non-explicit references to violence or sensuality.
- NC-17: Adults only. Can explore themes of violence and eroticism in an artistic, non-gratuitous way. Polite but explicit names for body parts and specific acts can be used.`;

    const prompt = `You are an expert songwriter creating lyrics for a song.

**Primary Directive:** The song's narrative, story, and core subject matter MUST be derived exclusively from the "Song's Theme" provided below. The musical style, instruments, and other qualities are for tonal and structural guidance only; they should influence the *feeling* and *rhythm* of the lyrics, but **not** the story itself. For example, if the style is 'Merfolk/Siren' but the topic is 'a robot finding a friend', the lyrics must be about the robot, with a haunting or alluring *tone*, not about the sea.

${ratingInstruction}

${performerInstruction}
${languageInstruction}
${relationshipInstruction}

The song should be written in the *tonal spirit* of: ${style}.
The song's *rhythmic feel* should be compatible with: ${instruments.join(', ')}.

The song's theme, which dictates the story, is based on this:
---
${topic || "An uplifting song about friendship and creativity."}
---
Also, consider these qualities for the song's overall feel:
- Narrative Dynamic: ${narrativeDynamic || 'Not specified'}
- Mood: ${mood || 'Not specified'}
- Genre Context: ${genre || 'Not specified'}
- Pace: ${pace || 'Not specified'}
- Texture: ${instrumentation || 'Not specified'}
- Lyrical Theme: ${lyricalTheme || 'Not specified'}
- Vocal Style: ${vocalStyle || 'Not specified'}
- Drum Style: ${drumStyle || 'Not specified'}
- Snare Sound: ${snareType || 'Not specified'}
- Special Instrument Feature: ${specialInstrument || 'Not specified'}
These should influence the lyrical tone, the structure, and the performance directions you provide in brackets.

Your task is to generate a suitable song title and the full song lyrics. To ensure the song fits within typical generation limits (around 2-3 minutes including instrumentals), please create a concise song structure.
For example, a good structure would be: [Intro], [Verse 1], [Chorus], [Verse 2], [Chorus], [Bridge], [Instrumental Solo], [Chorus], [Outro].
Avoid overly long verses or too many repeating sections.
    
Follow these strict formatting rules for Suno AI:
- Use tags like [Intro], [Verse], [Chorus], [Bridge], [Outro], etc., to structure the song.
- Indicate non-lyrical vocalizations like (oohs), (aahs).
- Use [Spoken Word] for spoken parts.
- Use *sound effect* for sound effects, like *thunder clap*.
- ${singers.length > 1 ? `Clearly label parts for each singer or group (e.g., ${singerLabels.join(', ')}, [Duet], [Choir]).` : `Label the singer part as ${singerLabels[0]}.`}
    
**Critically Important:** All musical or performance instructions MUST be enclosed in \`[]\` brackets. Do NOT write descriptive sentences about the music within the lyrics, such as 'The guitar comes in here'. Instead, use bracketed tags like \`[Acoustic guitar intro]\` or \`[Music fades out]\`. The lyrics should only contain the words to be sung and the bracketed instructions.

Output a JSON object with two keys: "title" and "lyrics". The title must be in ${language}. The lyrics must follow the language instructions provided above.
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
                        description: `A creative and fitting title for the song, in ${language}.`
                    },
                    lyrics: { 
                        type: Type.STRING,
                        description: `The full lyrics of the song, following all language and formatting rules. The structure should be concise (e.g., 2 verses, a bridge) to fit a 2-3 minute runtime. All instructions must be in brackets.`
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

export const generateReportIntroduction = async (apiKey: string, { title, topic, lyrics, singers }: { title: string, topic: string, lyrics: string, singers: Singer[] }, log: LogFn): Promise<string> => {
    const ai = getAi(apiKey);
    const singerNames = singers.map(s => s.name);
    const has = (name: string) => singerNames.includes(name);

    let characterContext = '';
    const personalNotesInstructions: string[] = [];

    // Only include Miranda and Annelies in the personal notes, per user request.
    if (has('Miranda Noor')) {
        characterContext += `- Miranda Noor: A passionate storyteller and musician (Indian/Dutch/American heritage). She is resilient, empathetic, and channels her experiences with identity and love into her music. She is in a romantic relationship with Annelies.\n`;
        personalNotesInstructions.push(`- A personal note from Miranda Noor, reflecting on the song's origin and its meaning to her.`);
    }
    if (has('Annelies Brink')) {
        characterContext += `- Annelies Brink: A calm, supportive, and creative graphic designer and poet from the Netherlands. She is loyal and optimistic, often providing a grounding presence. She is in a romantic relationship with Miranda.\n`;
        personalNotesInstructions.push(`- A personal note from Annelies Brink, reflecting on her perspective on the song and its creation.`);
    }


    const prompt = `You are a creative writer and biographer for the musical duo Noor (Miranda Noor and Annelies Brink). Your task is to write the introductory chapter for a song report about their new song, "${title}".

**Song Details:**
- Title: "${title}"
- Singers: ${singerNames.join(', ')}
- Core Story/Theme:
---
${topic}
---
- Lyrics:
---
${lyrics}
---

**Character Context for Personal Notes:**
${characterContext || 'No specific character context provided.'}
- General Theme: The artists explore themes of love, connection, and identity from a female perspective, often with a subtle sapphic sensibility. Their relationships (Miranda/Annelies are a couple) should inform the tone of their personal notes.

**Instructions:**
Your response must be structured in two distinct parts: "The Story" and "Personal Notes".

**Part 1: The Story**

1.  **Fictional Origin Story:**
    - As a creative writer, invent a compelling, fictional origin story for the song. This should be a small adventure or a moment of sudden inspiration.
    - **CRITICAL:** This story **MUST** be written as three or more distinct paragraphs. Each paragraph should be separated by a newline. Do not merge them into a single block of text. For example:
      Paragraph 1...
      
      Paragraph 2...
      
      Paragraph 3...
    - The story should be engaging and weave in elements from the song's theme and lyrics.

2.  **The Song's Message:**
    - Immediately after the story, write a new, separate paragraph that explains the core message of the song in simple, plain language. This paragraph should start with something like "At its heart, the song is about..."

**Part 2: Personal Notes**

1.  **Singer Reflections:**
    - After explaining the message, create the following sections, each with a short, heartfelt note from the singer's perspective.
    ${personalNotesInstructions.join('\n')}
    - In each note, the singer should reflect on the fictional origin story you created and their personal connection to the song's message.

**Output Format:**
- Use Markdown for formatting. The personal notes must use \`## A Note from [Singer Name]\` headers.
- The entire response should be the report content. Do not add any preamble.
`;

    const requestPayload = {
        model: "gemini-2.5-flash",
        contents: prompt,
    };

    log({ level: LogLevel.GEMINI, source: 'Gemini', header: 'Request: Generate Report Introduction', details: requestPayload });

    try {
        const response = await ai.models.generateContent(requestPayload);
        log({ level: LogLevel.GEMINI, source: 'Gemini', header: 'Response: Generate Report Introduction', details: response });
        // The introduction from the AI will now include its own markdown headers for the notes,
        // and the consuming components add the main chapter header. We just return the text.
        return response.text.trim();
    } catch (error: any) {
        log({ level: LogLevel.ERROR, source: 'Gemini', header: 'Error Generating Report Introduction', details: { error: error.message, stack: error.stack } });
        throw error;
    }
};

export const translateLyricsToEnglish = async (apiKey: string, lyrics: string, log: LogFn): Promise<string> => {
    const ai = getAi(apiKey);
    const prompt = `Translate the following song lyrics to English.
    **Crucial instructions:**
    1.  Preserve the original song structure perfectly. This includes all tags like [Verse], [Chorus], [Bridge], [Intro], [Outro], etc.
    2.  Preserve all singer labels, such as [Miranda], [Annelies], [Duet], [Choir], etc.
    3.  Preserve all language specifiers like [English] or [Dutch] if they appear before a singer label.
    4.  Translate only the lyrical content. Do not translate the tags or labels themselves.
    5.  The goal is a natural-sounding English translation that fits the song's context, not a literal word-for-word translation. Capture the meaning and emotion.
    6.  Output ONLY the translated lyrics text. Do not add any preamble, explanation, or extra formatting.

    Lyrics to translate:
    ---
    ${lyrics}
    ---
    `;

    const requestPayload = {
        model: "gemini-2.5-flash",
        contents: prompt,
    };
    
    log({ level: LogLevel.GEMINI, source: 'Gemini', header: 'Request: Translate Lyrics', details: requestPayload });

    try {
        const response = await ai.models.generateContent(requestPayload);
        log({ level: LogLevel.GEMINI, source: 'Gemini', header: 'Response: Translate Lyrics', details: response });
        return response.text.trim();
    } catch (error: any) {
        log({ level: LogLevel.ERROR, source: 'Gemini', header: 'Error Translating Lyrics', details: { error: error.message, stack: error.stack } });
        throw error;
    }
};


export const generateImagePrompt = async (apiKey: string, { topic, style, singers }: { topic: string, style: MusicStyle | null, singers: Singer[] }, log: LogFn): Promise<string> => {
    const ai = getAi(apiKey);
    
    const { miranda, annelies } = await getCharacterDescriptions();

    const characterDescriptionMap: { [key: string]: string } = {
        'Miranda Noor': miranda,
        'Annelies Brink': annelies,
        'Fannie de Jong': 'Fannie de Jong, an average Dutch girl with a charming spray of freckles across her nose and cheeks, wearing stylish glasses. She has a blond ponytail and friendly blue eyes.',
        'Emma Vermeer': 'Emma Vermeer, a Dutch girl with striking reddish, shoulder-length hair and captivating light green eyes.',
    };
    
    const singerNames = singers.map(s => s.name);
    const has = (name: string) => singerNames.includes(name);

    let subjectInstruction = '';
    if (singers.length === 1) {
        subjectInstruction = `The image MUST feature a solo female musician, ${singers[0].name}.`;
    } else if (singers.length === 2) {
        const isMirandaAndAnnelies = has('Miranda Noor') && has('Annelies Brink');
        const isFannieAndEmma = has('Fannie de Jong') && has('Emma Vermeer');

        if (isMirandaAndAnnelies) {
            subjectInstruction = `The image MUST feature the female music duet and romantic couple, Miranda Noor and Annelies Brink, performing together. Capture their deep connection and intimacy in their interaction and expressions.`;
        } else if (isFannieAndEmma) {
            subjectInstruction = `The image MUST feature the female music duet and close friends, Fannie de Jong and Emma Vermeer, performing together. Their bond is playful and intimate, with a visible, easy-going chemistry.`;
        } else {
            subjectInstruction = `The image MUST feature a female music duet (two young women), ${singerNames.join(' and ')}, performing together.`;
        }
    } else {
        const allFour = singers.length === 4 && has('Miranda Noor') && has('Annelies Brink') && has('Fannie de Jong') && has('Emma Vermeer');
        if (allFour) {
            subjectInstruction = `The image MUST feature the full female musical group of 4 women: Miranda Noor, Annelies Brink, Fannie de Jong, and Emma Vermeer. Depict Miranda and Annelies as a couple with a deep connection, and Fannie and Emma as close, playful friends. They should be performing together as a cohesive band.`;
        } else {
            const singerNamesList = singers.map(s => s.name).join(', ');
            subjectInstruction = `The image MUST feature a small female musical group of ${singers.length} women: ${singerNamesList}. They should be depicted performing together as a small choir or band.`;
        }
    }

    const descriptions = singers.map(singer => `- **${singer.name}'s Description:** ${characterDescriptionMap[singer.name] || `A young female musician with a ${singer.voice} voice.`}`).join('\n');


    const prompt = `You are an expert prompt engineer for text-to-image models like Imagen.
Your task is to create a single, detailed, high-quality image prompt for a song's cover art.

**Core Subject:** ${subjectInstruction}
${descriptions}

**Overall Theme & Background:** The song's theme is: "${topic || "A group of female musicians creating music together"}". The background and environment of the image must subtly reflect this theme. A consistent underlying theme for all their work is a subtle sapphic sensibility; this should be reflected in the mood and interaction, regardless of the specific topic. For example, if the topic is 'a summer rainstorm in the city', the background could be a cozy room with a rain-streaked window overlooking city lights. Do not just put the topic in the background, but integrate it into the scene.

**Musical Style:** The music style is: ${style || "Pop"}. Their clothing, expressions, and the overall mood of the image should reflect this musical style.

**Instructions:**
- Combine all these elements into one cohesive, artistic scene.
- Describe their appearances based on the descriptions, their clothing, their emotional expressions, and their interaction with each other (and perhaps their instruments).
- Focus on creating a visually stunning and emotionally resonant image.
- Use descriptive keywords that text-to-image models understand well:
    - For Composition: cinematic, dynamic angle, rule of thirds.
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

export const suggestStyle = async (apiKey: string, topic: string, allStyles: string[], {
    language,
    language2,
    mood,
    genre,
    pace,
    instrumentation,
    vocalStyle,
    lyricalTheme,
    drumStyle,
    snareType,
    specialInstrument,
    narrativeDynamic
}: {
    language: string;
    language2: string;
} & SelectorOptions, log: LogFn): Promise<MusicStyle | null> => {
    const ai = getAi(apiKey);
    const isBilingual = language.toLowerCase() !== language2.toLowerCase();
    const languageInfo = isBilingual ? `Languages: ${language} and ${language2}` : `Language: ${language}`;

    const prompt = `From the following list of music styles, which one best fits the song described below?
Your answer must be ONLY the style name, exactly as it appears in the list. Do not add any other words, punctuation, or explanations.

Available Styles:
${allStyles.join(', ')}

---
Description of the Song:
- Song Topic: "${topic}"
- ${languageInfo}
- Mood/Emotion: ${mood || 'Not specified'}
- Intended Genre: ${genre || 'Not specified'}
- Pace/Dynamics: ${pace || 'Not specified'}
- Texture/Instrumentation: ${instrumentation || 'Not specified'}
- Lyrical Theme: ${lyricalTheme || 'Not specified'}
- Narrative Dynamic: ${narrativeDynamic || 'Not specified'}
- Vocal Style: ${vocalStyle || 'Not specified'}
- Drum Style: ${drumStyle || 'Not specified'}
- Snare Sound: ${snareType || 'Not specified'}
- Special Instrument Feature: ${specialInstrument || 'Not specified'}
---
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