# Next.js AI Call Center

## Project Summary

This project showcases the development of a sophisticated, AI-powered Interactive Voice Response (IVR) system for a call center, built from the ground up using a modern web technology stack. The core of the application is a Next.js-based dashboard that provides a real-time view of agent availability and a comprehensive history of all processed calls. The system leverages Twilio for telephony, allowing it to handle live phone calls, and integrates with Google's Gemini models via Genkit to create an intelligent, multi-turn conversational AI.

The primary goal of the AI is to interact with callers to gather essential preliminary information, such as their name and age. It is designed with robust logic to handle partial information, asking clarifying follow-up questions to complete its data collection before making a decision. Once the necessary information is gathered, the system intelligently determines if an agent is available and, if so, seamlessly transfers the call.

Persistence is achieved through a Vercel Postgres database, managed by Prisma, which stores all agent data and call logs. This ensures that the state is maintained across server restarts and provides a rich dataset for the dashboard's call history feature.

A key aspect of the development process was the creation of a comprehensive, end-to-end testing suite. A dedicated script (`test:multi-turn`) was developed to simulate a full call lifecycle, from the initial connection to the final agent status cleanup. This script interacts with the same database and API endpoints as a real call, ensuring high confidence in the application's logic. The development environment is further enhanced by an automated `ngrok` tunneling script (`dev-with-tunnel.js`), which simplifies the process of exposing the local server to Twilio's webhooks, making real-world testing efficient and straightforward. This project serves as a practical, in-depth example of integrating modern AI, database, and telephony services into a cohesive, real-world application.

---

This project is an AI-powered call center IVR (Interactive Voice Response) and dashboard, built with Next.js, Genkit, Twilio, and Vercel Postgres. It demonstrates a multi-turn conversational AI that can gather information from a caller, process it, and intelligently route the call to a human agent.

The dashboard provides a real-time view of agent status and a history of all calls processed by the system.

![Dashboard Screenshot](UI/ui%20screenshot.png)

## Core Features

*   **Conversational AI IVR:** A multi-turn AI that intelligently gathers caller information (name, age).
*   **Dynamic Call Routing:** The AI determines when it has enough information to transfer the caller to an available agent.
*   **Real-time Agent Dashboard:** A frontend built with Next.js and ShadCN UI to monitor agent status (`Available`, `Busy`, etc.) and view call history.
*   **Persistent Data:** Call logs and agent data are stored in a Vercel Postgres database, managed with Prisma.
*   **End-to-End Testing:** A robust local testing script (`npm run test:multi-turn`) simulates a full call flow, including database setup and cleanup, to ensure reliability.
*   **Automated Tunneling:** The development server automatically uses `ngrok` to create a public URL, making it easy to connect with Twilio webhooks.

## Tech Stack & Key Tools

*   **Framework:** Next.js (App Router)
*   **Language:** TypeScript
*   **AI Integration:** Google AI (Gemini) via Genkit
*   **Database:** Vercel Postgres with Prisma
*   **Telephony:** Twilio
*   **UI:** React, ShadCN UI, Recharts for charts
*   **Styling:** Tailwind CSS
*   **Runtime Environment:** `tsx` for running TypeScript scripts
*   **Tunneling:** `ngrok`

## Prerequisites

*   **Node.js:** v20.x or later
*   **npm:** v10.x or later
*   **Twilio Account:**
    *   Your Account SID and Auth Token.
    *   A Twilio phone number.
*   **Google AI API Key:**
    *   An API key from Google AI Studio to use the Gemini models.
*   **Vercel Account:**
    *   A Vercel account to create a free Postgres database.
*   **ngrok Account:**
    *   An `ngrok` authtoken for creating a stable public URL for local development.

## Setup & Running Instructions

Follow these steps to get the project running locally.

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/your-repo-name.git
cd your-repo-name
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Environment Variables

Create a file named `.env.local` in the project root. Copy and paste the following content into it, then fill in the values for each variable.

```env
# .env.local

# Genkit AI Features - Get from Google AI Studio or Google Cloud Console
GOOGLE_API_KEY=YOUR_GOOGLE_AI_API_KEY_HERE

# Vercel Postgres Database - Get from your Vercel project dashboard
DATABASE_URL="postgresql://..."

# Twilio Telephony - Get from your Twilio Console
TWILIO_ACCOUNT_SID=YOUR_TWILIO_ACCOUNT_SID_HERE
TWILIO_AUTH_TOKEN=YOUR_TWILIO_AUTH_TOKEN_HERE

# Ngrok Tunneling - Get from your ngrok Dashboard
# Required for the dev server to expose a public URL for Twilio webhooks
NGROK_AUTHTOKEN=YOUR_NGROK_AUTHTOKEN_HERE
```

### 4. Set Up the Database

Run the following command to apply the database schema and create the necessary tables.

```bash
npm run db:migrate
```

Next, seed the database with initial data (e.g., sample agents).

```bash
npm run db:seed
```

### 5. Run the Development Server

Start the application with a single command. This will launch the Next.js development server and automatically create a public `ngrok` URL for you.

```bash
npm run dev
```

Look for the `ngrok` URL in the console output. It will look like this:
**`Public URL: https://<some-random-string>.ngrok-free.app`**

This is the URL you will use for the Twilio webhook. All server activity, including the `ngrok` URL and incoming call data, is logged to `logs/app.log`.

### 6. Configure the Twilio Webhook

1.  Go to your **Twilio Console**.
2.  Navigate to **Phone Numbers > Manage > Active numbers** and click on your number.
3.  Scroll down to the **Voice & Fax** section.
4.  Under **"A CALL COMES IN"**, set the webhook to your public `ngrok` URL, followed by the API path:
    *   `https://<your-ngrok-url>.ngrok-free.app/api/twilio/incoming-call`
5.  Set the HTTP method to **`HTTP POST`**.
6.  Click **Save**.

### 7. Make a Call

You are now set up! Call your Twilio number from any phone. The AI should answer and guide you through the process.

## Testing

This project includes an end-to-end test script that simulates a full multi-turn conversation. It resets the database state before running and simulates the final webhook from Twilio to clean up the agent status.

To run the test, use the following command:

```bash
npm run test:multi-turn
```

A detailed log of the test run will be created in the `logs/` directory.

## Project Structure Highlights

*   `dev-with-tunnel.js`: A smart startup script that runs the Next.js server and `ngrok` tunnel simultaneously.
*   `src/app/`: Main Next.js application directory.
    *   `page.tsx`: The main dashboard page.
    *   `api/twilio/`: Contains all Twilio webhook handlers.
        *   `incoming-call/route.ts`: Handles the initial call from Twilio.
        *   `gather/route.ts`: Processes the user's speech and runs the AI logic.
        *   `dial-status/route.ts`: A callback from Twilio to clean up agent status after a call ends.
*   `src/components/`: Reusable React components, including dashboard-specific components and ShadCN UI elements.
*   `src/ai/`: All Genkit-related code, including AI flows.
*   `src/lib/`: Core application logic, including server actions (`actions.ts`) and the application logger (`logger.ts`).
*   `src/services/`: Services for interacting with the database (e.g., `agentService`, `callService`).
*   `prisma/`: Contains the database schema (`schema.prisma`), migrations, and seed script.
*   `scripts/`: Contains test scripts like `test-multi-turn.js`.
*   `logs/`: Contains detailed log files for the main application (`app.log`) and test runs.

## Key API Endpoints

*   `POST /api/twilio/incoming-call`: The initial webhook Twilio calls. It initiates the AI conversation.
*   `POST /api/twilio/gather`: Processes speech results from the user and orchestrates the multi-turn AI conversation.
*   `POST /api/twilio/dial-status`: A status callback from Twilio after a dialed call completes. Used to free up the agent.
*   `GET /api/agents`: Fetches all agents for the dashboard.
*   `PUT /api/agents`: Allows manual updates to an agent's status from the dashboard.
*   `GET /api/calls`: Fetches all call history for the dashboard.

    
