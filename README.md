# Miranda Noor - Lyric & Art Generator

A creative tool designed by Miranda Noor and Annelies Brink to generate complete song concepts. This application leverages Google's powerful AI models, Gemini and Imagen, to help musicians and creators craft everything from lyrical themes to final album cover art, with output formatted for use in music generation platforms like Suno.

## About the Project

This application serves as an artistic partner, guiding the user through a step-by-step workflow to build a song from the ground up. It starts with a simple topic, which is then expanded by AI into a rich narrative. From there, the app helps select a musical style, choose appropriate instruments, generate a title and lyrics, and finally create a unique, photo-realistic cover image.

The entire project is self-contained and runs directly in the browser, using modern JavaScript features and direct module imports without requiring a complex build process.

## Features

- **Step-by-Step Creative Workflow:** Guides the user through Topic, Style, Instruments, Lyrics, Cover Image, and a final Collection page.
- **User-Provided API Keys:** Users must enter their own Google AI API key, which is stored securely in their browser's local storage.
- **AI-Powered Content Generation:**
  - **Topic Expansion:** Expands simple keywords into rich, descriptive paragraphs using Gemini.
  - **Style Suggestion:** Analyzes the song's topic to suggest a fitting musical style.
  - **Lyric & Title Generation:** Creates complete, structured lyrics and a title based on the topic, style, and instruments.
  - **Cover Art Creation:** Generates a detailed artistic prompt and then creates a high-quality album cover using Imagen.
- **Suno-Ready Output:** Lyrics are formatted with structural tags (`[Verse]`, `[Chorus]`) and instrument lists are easily copyable for direct use in Suno.
- **Image Gallery:** Keep multiple generated cover images and select the best one for the final collection.
- **Interactive Tools:**
  - **Music Styles Explorer:** A comprehensive browser for all available music styles and their associated instruments.
  - **Developer Console:** An in-app log viewer to inspect all API requests and responses for debugging.
  - **About & Manual:** Integrated documentation about the creators and the application's functionality.
- **Downloadable Collection:** Package and download all generated assets (title, lyrics, all images, report) in a single ZIP file.
- **Customizable Theme:** Toggle between light and dark modes for user comfort.

## Technology Stack

- **Frontend:** React, TypeScript
- **Styling:** Tailwind CSS (via CDN script)
- **AI Models:** Google Gemini API (`@google/genai`) for text and Imagen for images.
- **Module System:** ES Modules loaded directly from `esm.sh` (no bundler like Webpack or Vite is used).
- **Utilities:** `jszip` for creating ZIP archives, `file-saver` for downloading.

## Getting Started

Follow these instructions to set up and run the project on your local machine for development and testing purposes.

### Prerequisites

- [Git](https://git-scm.com/) for cloning the repository.
- [Node.js](https://nodejs.org/en/) (which includes `npx`) to run a simple local web server.
- A **Google AI API Key**. You can get one from [Google AI Studio](https://aistudio.google.com/app/apikey).

### Installation & Setup

1.  **Clone the repository:**
    ```sh
    git clone https://github.com/your-username/miranda-noor-app.git
    cd miranda-noor-app
    ```
    *(Replace `your-username/miranda-noor-app.git` with the actual repository URL)*

2.  **API Key Configuration:**
    This application requires a Google AI API key to function. The code expects the user to provide one, so the owner of the website does not need to spend his own budget.

    This API key can be set in the settings button with the gears symbol. The browser will store the key in local storage and never sends it to the server.

3.  **API Key Configuration:**
    The application requires a Google AI API key to function. The key is **not** stored in the code. When you run the application, you must enter your key via the user interface.

    - Click the **Settings** (gear) icon in the header.
    - Enter your Google AI API Key in the dialog box.
    - Click "Save & Close".

    Your key will be saved in your browser's local storage for future sessions.

4.  **Run the application:**
    Since this is a static web application, you can serve it with any simple HTTP server. We recommend using `serve`.
    ```sh
    npx serve
    ```
    The server will start and provide you with a local URL (e.g., `http://localhost:3000`). Open this URL in your web browser.

## Project Structure

The codebase is organized into the following main directories:

```
.
├── public/               # Static assets: markdown files, JSON data, images
├── src/                  # Main application source code
│   ├── components/       # Reusable React components (dialogs, icons, layout)
│   ├── context/          # React Context providers for global state
│   ├── hooks/            # Custom React hooks
│   ├── pages/            # Page components for each step of the workflow
│   ├── services/         # Modules for interacting with Google AI APIs
│   ├── types.ts          # Global TypeScript type definitions
│   ├── App.tsx           # Root React component, handles layout and routing
│   └── index.tsx         # Application entry point, mounts React app
├── index.html            # The main HTML file for the application
├── metadata.json         # Application metadata for the hosting platform
└── README.md             # This file
```

## Acknowledgements

- This application was conceived and designed by **Miranda Noor** and **Annelies Brink**.
- Powered by the Google Gemini and Imagen APIs.