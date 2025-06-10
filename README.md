
# NextJS AI Call Center Dashboard

## Project Overview

Alright, so this thing is basically a dashboard I whipped up to simulate an AI-powered call center IVR. The main idea was for me to test how an AI would handle the initial part of a call – you know, grabbing the caller's name and age, and then figuring out if that info is good enough to pass them to a human.

I used Next.js for the frontend, mostly because it's quick to get stuff up and running, and server components are pretty neat for this kind of dashboard. For the UI, it's all ShadCN components with Tailwind CSS, so it looks decent without a ton of custom styling work on my part.

The AI smarts? That's Genkit. I've got a couple of flows set up: one to pull out info like name and age from whatever text you type in (simulating a call transcript), and another to double-check if that info makes sense. Think of it like a quick sanity check before a real agent gets bothered.

You can punch in some sample call transcripts on the dashboard, hit a button, and see what the AI comes up with. It's all mock data for the agent statuses and call logs right now, but the AI simulation part is live (if you set up your API key!). It helped me quickly see if the prompts I'm giving the AI are actually working or if they need tweaking. Pretty handy for iterating on the AI logic without needing a full phone system hooked up.

## Tech Stack & Key Tools

*   **Framework:** Next.js (v15.3.x app router)
*   **Language:** TypeScript
*   **AI Integration:** Genkit (v1.8.x) with Google AI (Gemini models)
*   **UI:** React, ShadCN UI
*   **Styling:** Tailwind CSS (with CSS Variables for theming)
*   **Form Handling:** React Hook Form with Zod for validation
*   **Icons:** Lucide React

## Prerequisites

*   **Node.js:** v20.x or later recommended
*   **npm:** v10.x or later (or yarn v1.22.x or later)
*   **Google AI API Key (Optional for UI, Required for AI Features):**
    *   You'll need an API key from Google AI Studio (or Google Cloud Console) to use the Gemini models via Genkit for the AI Call Simulation feature.
    *   If you don't provide an API key, the dashboard will still run, but the AI simulation will be disabled and show a message.

## Setup & Running

1.  **Clone the repository:**
    ```bash
    git clone <your-repo-url>
    cd <project-directory-name>
    ```

2.  **Install dependencies:**
    Using npm:
    ```bash
    npm install
    ```
    Or using yarn:
    ```bash
    yarn install
    ```

3.  **Set up Environment Variables (for AI Features):**
    Create a `.env` file in the root of the project by copying the example file:
    ```bash
    cp .env.example .env
    ```
    Open the `.env` file and add your Google AI API Key if you want to use the AI simulation features:
    ```env
    GOOGLE_API_KEY=YOUR_GOOGLE_AI_API_KEY_HERE
    ```
    This key is essential for the AI features to work. If left blank, the AI simulation will be disabled.

4.  **Run the Next.js Development Server:**
    ```bash
    npm run dev
    ```
    The application will typically be available at `http://localhost:9002`.

5.  **Run the Genkit Development Server (Optional, for AI flow inspection, requires API Key):**
    If you want to inspect, test, or debug the Genkit flows directly using the Genkit Inspector UI (and you have set up your `GOOGLE_API_KEY`), run this command in a *separate terminal*:
    ```bash
    npm run genkit:dev
    ```
    The Genkit Inspector will usually be available at `http://localhost:4000`.

## Building for Production

1.  **Build the Next.js application:**
    ```bash
    npm run build
    ```

2.  **Start the production server:**
    ```bash
    npm run start
    ```

## Project Structure Highlights

*   `src/app/`: Main Next.js application directory using the App Router.
    *   `page.tsx`: The main dashboard page.
    *   `layout.tsx`: The root layout for the application.
    *   `globals.css`: Global styles and Tailwind CSS theme variables.
*   `src/components/`: Reusable React components.
    *   `dashboard/`: Components specific to the dashboard UI.
    *   `ui/`: ShadCN UI components.
*   `src/ai/`: Contains all Genkit-related code.
    *   `flows/`: Genkit flows for AI tasks.
    *   `genkit.ts`: Genkit initialization and configuration.
    *   `dev.ts`: Entry point for the Genkit development server.
*   `src/lib/`:
    *   `actions.ts`: Next.js Server Actions, used by the AI simulation card.
    *   `utils.ts`: Utility functions.
*   `src/types/`: TypeScript type definitions.
*   `public/`: Static assets.
*   `.env.example`: Example environment file.
*   `tailwind.config.ts`, `next.config.ts`, `package.json`, `tsconfig.json`: Project configuration files.
```
