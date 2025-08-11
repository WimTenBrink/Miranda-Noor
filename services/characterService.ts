
// Module-level cache to store fetched and parsed descriptions.
// This prevents re-fetching and re-parsing the markdown files on every call.
let characterDescriptions: { miranda: string; annelies: string; } | null = null;

/**
 * Parses a specific section from a character's markdown file to extract a clean description.
 * @param markdown The full markdown content of the file.
 * @returns A cleaned-up string of the character's physical description.
 */
const parseDescription = (markdown: string): string => {
    const startMarker = "### Body Details";
    
    const startIndex = markdown.indexOf(startMarker);
    if (startIndex === -1) {
        return "Physical description not found in markdown file.";
    }
    
    // Get the substring starting after "### Body Details"
    let subString = markdown.substring(startIndex + startMarker.length);
    
    // Find the end of the section, which is the start of the next H2 header
    const endIndex = subString.indexOf("\n## ");
    if (endIndex !== -1) {
        subString = subString.substring(0, endIndex);
    }
    
    // Clean up the markdown for use in a prompt: remove markdown syntax, newlines, etc.
    return subString
        .replace(/- \*\*(.*?)\*\*:/g, '$1:') // Cleans up "**Prop:**" to "Prop:"
        .replace(/;/g, ',')                 // Replaces semicolons with commas for better sentence flow
        .replace(/\*/g, '')                  // Removes asterisks
        .replace(/(\r\n|\n|\r)/gm, " ")      // Replaces all newline characters with a space
        .replace(/\s+/g, ' ')               // Collapses multiple whitespace characters into a single space
        .trim();
};

/**
 * Fetches and parses the character descriptions for Miranda and Annelies.
 * Caches the result after the first successful fetch to avoid redundant network requests.
 * @returns A promise that resolves to an object containing the descriptions for Miranda and Annelies.
 */
export const getCharacterDescriptions = async (): Promise<{ miranda: string, annelies: string }> => {
    // Return the cached descriptions if they already exist.
    if (characterDescriptions) {
        return characterDescriptions;
    }

    try {
        // Fetch both markdown files in parallel for efficiency.
        const [mirandaResponse, anneliesResponse] = await Promise.all([
            fetch('/Miranda_Noor.md'),
            fetch('/Annelies_Brink.md')
        ]);

        if (!mirandaResponse.ok || !anneliesResponse.ok) {
            throw new Error(`Failed to fetch character markdown files. Miranda Status: ${mirandaResponse.statusText}, Annelies Status: ${anneliesResponse.statusText}`);
        }

        const [mirandaMd, anneliesMd] = await Promise.all([
            mirandaResponse.text(),
            anneliesResponse.text()
        ]);

        // Parse the descriptions from the markdown content.
        const mirandaDesc = parseDescription(mirandaMd);
        const anneliesDesc = parseDescription(anneliesMd);
        
        // Cache the result for subsequent calls.
        characterDescriptions = {
            miranda: mirandaDesc,
            annelies: anneliesDesc,
        };

        return characterDescriptions;

    } catch (error) {
        console.error("Error fetching and parsing character descriptions:", error);
        // Provide a hardcoded fallback to ensure the app can continue functioning even if the fetch fails.
        return {
            miranda: "A young woman of mixed Indian and Dutch heritage, with deep espresso black hair with auburn highlights, and warm dark hazel eyes. She plays a bass guitar.",
            annelies: "A young woman of Dutch heritage, with light brown, shoulder-length hair and blue almond-shaped eyes. She has a calm and creative presence.",
        };
    }
};
