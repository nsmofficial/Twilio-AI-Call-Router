# **App Name**: Twilio AI Call Router

## Core Features:

- AI-Powered IVR: Interactive Voice Response (IVR) system to greet callers and collect initial information such as name and age, using AI for natural language understanding.
- Response Verification: Verification step using AI to confirm responses. Acts as a tool to use confidence scoring for intent recognition to qualify for human handover.
- Twilio Integration: Integration with Twilio to handle inbound calls and routing.
- Agent Availability Check: Webhook integration to interact with a number pool, ensuring calls are routed only to available agents. Simplifies call routing with available agents by providing a lightweight state store for agents.
- Call Tracking Dashboard: Dashboard to display call metrics, recordings, and agent status, hosted at v0.dev.

## Style Guidelines:

- Primary color: Strong blue (#4285F4) to convey reliability and professionalism.
- Background color: Light gray (#F5F5F5), a neutral tone for the interface.
- Accent color: Analogous lighter blue (#64B5F6) to provide highlights and focus.
- Font: 'Inter', a grotesque sans-serif used for body and headline to ensure clear and modern readability across the dashboard.
- Simple, line-based icons representing call status, agent availability, and other metrics.
- Clean, card-based layout for dashboard elements, with clear separation between data sections.
- Subtle transitions when loading data or updating call status.