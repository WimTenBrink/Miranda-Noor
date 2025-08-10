# Miranda Noor Lyric & Art Generator - User Manual

Welcome! This application is a creative partner designed to help you generate complete song concepts, from lyrical themes to final cover art, ready for use with music platforms like Suno. This app uses Google's AI models (Gemini and Imagen) to generate content.

## The Creative Workflow

The application is designed as a step-by-step process. You can navigate through the pages using the "Creative Steps" menu on the left. A step is marked as complete when you've generated content for it.

### Step 1: Topic
This is the foundation of your song.
- **What to do:** Enter a theme, a few keywords, a story idea, or a feeling.
- **Expand Topic:** For a richer starting point, click "Expand Topic." The AI will elaborate on your idea into a descriptive paragraph, which helps generate more detailed and coherent lyrics and art later on.
- **Next:** When you're happy with the topic, click "Next." The AI will analyze your topic to suggest a suitable music style on the next page.

### Step 2: Style
Choose the musical genre for your song.
- **What to do:** A list of styles is presented, grouped by genre. The AI's suggestion from the previous step will be pre-selected. You can choose any style you like.
- **Description:** Clicking a style shows a description and typical instruments on the right.

### Step 3: Instruments
Build the band for your track.
- **What to do:** Based on the style you chose, a list of appropriate instruments is shown. The most common ones are pre-selected. You can add or remove instruments.
- **For Suno:** Click the "Copy Style & Instruments for Suno" button. This copies a comma-separated list (e.g., "Pop, Synthesizer, Drum Machine, Bass Guitar") to your clipboard, which you can paste directly into Suno's "Style of Music" field.

### Step 4: Lyrics
This is where your song's story comes to life.
- **What to do:** When you land on this page, the AI will automatically generate a song title and lyrics based on your topic, style, and instruments.
- **For Suno:** The lyrics are formatted according to Suno's specifications, including structure tags like `[Verse]` and `[Chorus]`, and indicators for the two singers, `[Miranda]` and `[Annelies]`.
- **Redo & Copy:** You can regenerate the title or lyrics independently using the "Redo" buttons. Use the "Copy" buttons to copy the title and lyrics for pasting into Suno.

### Step 5: Cover Image
Create the visual identity for your song.
- **What to do:** The AI first generates a detailed, artistic prompt suitable for an image model. It then uses that prompt to create a unique 3:4 aspect ratio cover image using Imagen.
- **Redo & Download:** You can regenerate the image at any time. Hover over the image to find the download button.

### Step 6: Collection
Your completed song package.
- **What to do:** This page provides a summary of all your generated assets: Title, Style & Instruments, Lyrics, and Cover Art.
- **Download All & View Report:** When your collection is ready, buttons will appear in the header to "Download All" assets or "View Report".

## Header Buttons & Features

- **Theme (Sun/Moon):** Switch between light and dark mode.
- **Reset (Trash Can):** Starts a completely new session. This will clear all your current progress.
- **Console (Terminal):** View a detailed log of all API requests and responses. Useful for debugging.
- **Music Styles Explorer (Music Note):** A dialog to browse all available music styles and their instruments. You can even generate images of the instruments here.
- **Manual (Book):** Opens this guide.
- **Terms of Service (Document):** View the application's ToS.
- **About (Info):** Learn more about the creators, Miranda Noor and Annelies Brink.
