
# NextJS AI Call Center Dashboard

## Project Overview

This project is a dashboard I whipped up to simulate an AI-powered call center IVR. The main idea was for me to test how an AI would handle the initial part of a call – you know, grabbing the caller's name and age, and then figuring out if that info is good enough to pass them to a human.

I used Next.js for the frontend, mostly because it's quick to get stuff up and running, and server components are pretty neat for this kind of dashboard. For the UI, it's all ShadCN components with Tailwind CSS, so it looks decent without a ton of custom styling work on my part.

The AI smarts? That's Genkit. I've got a couple of flows set up: one to pull out info like name and age from whatever text you type in (simulating a call transcript), and another to double-check if that info makes sense. Think of it like a quick sanity check before a real agent gets bothered. This part can be tested through the "AI Call Simulation" card on the dashboard.

You can punch in some sample call transcripts on the dashboard, hit a button, and see what the AI comes up with. It's all mock data for the agent statuses and call logs right now.

The project also includes integration with Twilio to handle live calls. When a user calls the configured Twilio number:
1.  The call is answered by `/api/twilio/voice`.
2.  The AI (via TwiML `<Gather>`) asks the caller for their name and age.
3.  The spoken response is sent to `/api/twilio/handle-ivr-response`.
4.  This endpoint uses the `collectCallerInformation` Genkit flow to extract details.
5.  If successful, it uses the `verifyCallerResponses` Genkit flow to validate.
6.  A TwiML response is then given to the caller based on the AI's findings, simulating a transfer if verification is successful.

It helped me quickly see if the prompts I'm giving the AI are actually working or if they need tweaking. Pretty handy for iterating on the AI logic.

## Tech Stack & Key Tools

*   **Framework:** Next.js (v15.3.x app router)
*   **Language:** TypeScript
*   **AI Integration:** Genkit (v1.8.x) with Google AI (Gemini models)
*   **Telephony:** Twilio
*   **UI:** React, ShadCN UI
*   **Styling:** Tailwind CSS (with CSS Variables for theming)
*   **Form Handling:** React Hook Form with Zod for validation
*   **Icons:** Lucide React

## Prerequisites

*   **Node.js:** v20.x or later recommended
*   **npm:** v10.x or later (or yarn v1.22.x or later)
*   **Google AI API Key (Required for AI Features):**
    *   You'll need an API key from Google AI Studio (or Google Cloud Console) to use the Gemini models via Genkit.
    *   If you don't provide an API key, AI features (both simulation and live call processing) will be disabled.
*   **Twilio Account (Required for Twilio Integration):**
    *   A Twilio account.
    *   Your Twilio Account SID and Auth Token.
    *   A Twilio phone number.
*   **ngrok (For Local Twilio Development, if not using a cloud IDE with a public URL):**
    *   A tool to expose your local server to the internet, so Twilio can send requests to your webhooks. Download from [ngrok.com](https://ngrok.com/).

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

3.  **Set up Environment Variables:**
    Create a `.env` file in the root of the project by copying the example file:
    ```bash
    cp .env.example .env
    ```
    Open the `.env` file and add your keys:
    ```env
    # For Genkit AI features
    GOOGLE_API_KEY=YOUR_GOOGLE_AI_API_KEY_HERE

    # For Twilio Integration
    TWILIO_ACCOUNT_SID=YOUR_TWILIO_ACCOUNT_SID_HERE
    TWILIO_AUTH_TOKEN=YOUR_TWILIO_AUTH_TOKEN_HERE
    # TWILIO_PHONE_NUMBER=+1YOURTWILIONUMBER # Optional, but good to have
    ```
    *   `GOOGLE_API_KEY` is essential for all AI features. If left blank, AI simulation will be disabled, and live Twilio calls requiring AI will fail or respond with an error. The dashboard UI will still load.
    *   `TWILIO_ACCOUNT_SID` and `TWILIO_AUTH_TOKEN` are required for Twilio integration.

4.  **Run the Next.js Development Server:**
    ```bash
    npm run dev
    ```
    The application will typically be available at `http://localhost:9002` (or the port specified in your `package.json` `dev` script or Next.js default `3000`).
    If you are using a cloud-based IDE (like Firebase Studio, Gitpod, GitHub Codespaces, etc.), it will provide you with a public URL for your running application.

5.  **Set up Twilio Webhook (for Twilio integration):**
    Twilio needs to send HTTP requests to your application's `/api/twilio/voice` endpoint. This endpoint must be accessible from the public internet.

    *   **If using a Cloud-Based IDE (e.g., Firebase Studio, Gitpod, GitHub Codespaces):**
        1.  Ensure your Next.js app is running.
        2.  Your cloud IDE will provide a public URL for your running application (e.g., `https://your-unique-id.cloud-provider.dev` or `https://port-9002-your-instance.cloud-provider.app`). For instance, a Firebase Studio URL might look like `https://9000-your-project-details.cluster-id.cloudworkstations.dev`.
        3.  Your Twilio voice webhook URL will be this public URL plus `/api/twilio/voice` (e.g., `https://your-public-url.com/api/twilio/voice`). The `handle-ivr-response` endpoint is called by Twilio based on the `action` in the TwiML from the `voice` endpoint.

    *   **If running locally (not in a cloud IDE with a public URL):**
        1.  Ensure your Next.js app is running (e.g., on port `9002`).
        2.  Open a new terminal and run `ngrok` to expose your local port:
            ```bash
            ngrok http 9002
            ```
            (Replace `9002` with your application's port if it's different).
        3.  Ngrok will give you a public HTTPS URL (e.g., `https://your-unique-id.ngrok.io`).
        4.  Your Twilio voice webhook URL will be this ngrok URL plus `/api/twilio/voice` (e.g., `https://your-unique-id.ngrok.io/api/twilio/voice`).

    *   **Twilio Configuration Steps:**
        1.  Go to your [Twilio Console](https://www.twilio.com/console).
        2.  Navigate to "Phone Numbers" > "Manage" > "Active Numbers" (or find your number through the search).
        3.  Click on the Twilio phone number you want to use.
        4.  Scroll down to the "Voice & Fax" (or "Voice") section.
        5.  Under "A CALL COMES IN" (or "CONFIGURE WITH", "PRIMARY HANDLER"), select "Webhook".
        6.  In the text field, paste your full public webhook URL for the initial call (e.g., `https://your-public-url.com/api/twilio/voice`).
        7.  Ensure the HTTP method is set to `HTTP POST`.
        8.  Save the configuration.
        9.  Call your Twilio number to test. You should be greeted by the AI and asked for your name and age.

6.  **Run the Genkit Development Server (Optional, for AI flow inspection, requires API Key):**
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
    For production, ensure your webhook configurations in Twilio point to your live application URL.

## Project Structure Highlights

*   `src/app/`: Main Next.js application directory using the App Router.
    *   `page.tsx`: The main dashboard page.
    *   `layout.tsx`: The root layout for the application.
    *   `globals.css`: Global styles and Tailwind CSS theme variables.
    *   `api/twilio/voice/route.ts`: API route for handling initial incoming Twilio voice calls and gathering input.
    *   `api/twilio/handle-ivr-response/route.ts`: API route for processing the speech input gathered by the `voice` route, interacting with AI flows, and responding to the caller.
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
*   `.env.example`: Example environment file for API keys and other secrets.
*   `tailwind.config.ts`, `next.config.ts`, `package.json`, `tsconfig.json`: Project configuration files.

    
