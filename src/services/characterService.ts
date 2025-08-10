let characterDescriptions: { miranda: string; annelies: string; } | null = null;

const parseDescription = (markdown: string): string => {
    const startMarker = "### Body Details";
    
    const startIndex = markdown.indexOf(startMarker);
    if (startIndex === -1) {
        return "Physical description not found.";
    }
    
    let subString = markdown.substring(startIndex + startMarker.length);
    const endIndex = subString.indexOf("\n## "); // Look for next H2
    if (endIndex !== -1) {
        subString = subString.substring(0, endIndex);
    }
    
    // Clean up the markdown for a prompt: remove markdown syntax, newlines, etc.
    return subString
        .replace(/- \*\*(.*?)\*\*:/g, '$1:') // Cleans up "**Prop:**"
        .replace(/;/g, ',')                 // Replaces semicolons with commas
        .replace(/\*/g, '')                  // Removes asterisks
        .replace(/(\r\n|\n|\r)/gm, " ")      // Replaces newlines with spaces
        .replace(/\s+/g, ' ')               // Collapses multiple spaces
        .trim();
};

export const getCharacterDescriptions = async (): Promise<{ miranda: string, annelies: string }> => {
    if (characterDescriptions) {
        return characterDescriptions;
    }

    try {
        const [mirandaResponse, anneliesResponse] = await Promise.all([
            fetch('/Miranda_Noor.md'),
            fetch('/Annelies_Brink.md')
        ]);

        if (!mirandaResponse.ok || !anneliesResponse.ok) {
            throw new Error('Failed to fetch character markdown files.');
        }

        const [mirandaMd, anneliesMd] = await Promise.all([
            mirandaResponse.text(),
            anneliesResponse.text()
        ]);

        const mirandaDesc = parseDescription(mirandaMd);
        const anneliesDesc = parseDescription(anneliesMd);
        
        characterDescriptions = {
            miranda: mirandaDesc,
            annelies: anneliesDesc,
        };

        return characterDescriptions;

    } catch (error) {
        console.error("Error fetching character descriptions:", error);
        // Fallback in case of fetch failure
        return {
            miranda: "A young woman of mixed Indian and Dutch heritage, with deep espresso black hair with auburn highlights, and warm dark hazel eyes. She plays a bass guitar.",
            annelies: "A young woman of Dutch heritage, with light brown, shoulder-length hair and blue almond-shaped eyes. She has a calm and creative presence.",
        };
    }
};
