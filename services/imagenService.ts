
import { GoogleGenAI } from "@google/genai";
import { LogEntry, LogLevel } from '../types';

export const generateImage = async (
    apiKey: string,
    prompt: string,
    log: (entry: Omit<LogEntry, 'timestamp'>) => void
): Promise<string> => {
    if (!apiKey) {
        throw new Error("API Key is required.");
    }
    // Explicitly use the provided user API key for the client
    const ai = new GoogleGenAI({ apiKey });
    
    const requestPayload = {
        model: 'imagen-3.0-generate-002',
        prompt: prompt,
        config: {
          numberOfImages: 1,
          outputMimeType: 'image/png',
          aspectRatio: '3:4',
        },
    };

    log({
        level: LogLevel.IMAGEN,
        source: 'Imagen',
        header: `Request to imagen-3.0-generate-002`,
        details: { request: requestPayload }
    });

    try {
        const response = await ai.models.generateImages(requestPayload);

        log({
            level: LogLevel.IMAGEN,
            source: 'Imagen',
            header: `Response from imagen-3.0-generate-002`,
            details: { response: response }
        });

        if (!response.generatedImages || response.generatedImages.length === 0) {
            throw new Error("Imagen API did not return any images.");
        }

        const base64ImageBytes: string = response.generatedImages[0].image.imageBytes;
        return `data:image/png;base64,${base64ImageBytes}`;
    } catch (error: any) {
        log({
            level: LogLevel.ERROR,
            source: 'Imagen',
            header: `Error from Imagen API`,
            details: { error: error.message, stack: error.stack }
        });
        throw error;
    }
};
