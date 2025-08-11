# Miranda Noor Lyric & Art Generator - User Manual

Welcome! This application is a creative partner designed to help you generate complete song concepts, from lyrical themes to final cover art, ready for use with music platforms like Suno. This app uses Google's AI models (Gemini and Imagen) to generate content.

## The Creative Workflow

The application is designed as a step-by-step process. You can navigate through the pages using the "Creative Steps" menu on the left. The current step is highlighted. While you can navigate freely, following the steps in order provides the best results.

### Step 1: Topic
This is the foundation of your song.
- **What to do:** Enter a theme, a few keywords, a story idea, or a feeling. You must also select the singers for your project from the provided list.

### Step 2: Language
Choose the language(s) for the lyrics.
- **What to do:** Select a primary language for the song. If you have chosen more than one singer, you can optionally select a second language for one of the singers to create a bilingual performance.

### Step 3: Qualities
Fine-tune the mood and tone of your song.
- **What to do:** Select optional qualities like mood, genre, pace, or texture from the dropdowns. These will help guide the AI in later steps.
- **Expand Topic:** Click the **"Expand Topic with Qualities"** button to let the AI elaborate on your initial idea into a rich, descriptive paragraph. This provides a stronger foundation for lyrics and art.
- **Next Step:** When you click "Next", the AI will analyze your topic and qualities to suggest a suitable musical style on the next page.

### Step 4: Style
Choose the musical genre for your song.
- **What to do:** A list of styles is presented, grouped by genre. If you proceeded from the Qualities page, the AI's suggested style will be pre-selected. You can accept this suggestion or choose any other style you prefer.
- **Description:** Clicking a style shows a description and its typical instruments in the right-hand sidebar.

### Step 5: Instruments
Build the band for your track.
- **What to do:** Based on the style you chose, a list of appropriate instruments is shown. The most common ones are pre-selected. You can add or remove instruments by checking the boxes. Hover over an instrument to see its description.
- **For Suno:** Click the **"Copy Style & Instruments for Suno"** button. This copies a comma-separated list (e.g., "Pop, Synthesizer, Drum Machine, Bass Guitar") to your clipboard, which you can paste directly into Suno's "Style of Music" field.

### Step 6: Lyrics
This is where your song's story comes to life.
- **What to do:** When you first land on this page, the AI will automatically generate a song title and lyrics based on all your previous selections.
- **For Suno:** The lyrics are formatted according to Suno's specifications, including structure tags like `[Verse]` and `[Chorus]`, and indicators for the singers, e.g., `[Miranda]`.
- **Redo & Copy:** You can regenerate the title or lyrics independently using the "Redo" buttons. Use the "Copy Formatted" button to grab the lyrics for Suno, or "Copy Plain" for just the words.

### Step 7: Collection
Your completed song package, all in one place.
- **What to do:** This page provides a final summary of all your generated assets: Title, Style & Instruments, Lyrics, and the selected Cover Art.
- **Exporting:** Use the "Copy" buttons for each section to easily transfer your content. On this page, two new buttons will appear in the header: **"View Report"** and **"Download All"** (as a ZIP file).

### Step 8: Karaoke
A simple, clean view for a sing-along.
- **What to do:** This page displays the lyrics in a large, easy-to-read format, with all the formatting tags like `[Verse]` and `[Chorus]` removed. It's perfect for singing along to your newly created song.

### Step 9: Cover Image
Create the visual identity for your song.
- **What to do:** The AI first generates a detailed, artistic prompt, then uses it to create two unique 3:4 aspect ratio cover images using Imagen. You can generate more images one by one.
- **Skip:** If you prefer not to create a cover, you can use the "Skip for Now" button.
- **View Prompt & Download:** Select an image to make it your active choice for the collection. You can click "View Prompt" to see what text was used to create it, or hover over any image to find its download button.

## Sidebars & Header

- **Left Sidebar:** Navigate the 9 creative steps of the application. The current step is highlighted.
- **Right Sidebar:** Displays a compact, real-time summary of your song as you build it, showing your selections from every step.
- **Header Buttons:**
  - **Reset (Trash Can):** Starts a completely new session. This will clear all your current progress.
  - **Theme (Sun/Moon):** Switch between light and dark mode.
  - **Settings (Gear):** Enter and save your Google AI API key.
  - **Console (Terminal):** View a detailed log of all API requests and responses. Useful for debugging.
  - **Manual (Book):** Opens this guide.
  - **Music Styles Explorer (Music Note):** A dialog to browse all available music styles and their instruments. You can even generate images of the instruments here.
  - **Terms of Service (Document):** View the application's ToS.
  - **About (Info):** Learn more about the creators, Miranda Noor and Annelies Brink.
  - **View Report (Chart/Graph, on Collection page):** Opens a dialog with a full, formatted report of your song.
  - **Download All (Download Icon, on Collection page):** Downloads a ZIP file containing all your song's assets.
