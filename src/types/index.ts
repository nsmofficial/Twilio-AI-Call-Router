import type { LucideIcon } from 'lucide-react';

export type AgentStatus = 'available' | 'busy' | 'offline' | 'on_call';

export interface Agent {
  id: string;
  name: string;
  avatarUrl?: string;
  status: AgentStatus;
  callsHandledToday: number;
  currentCallId?: string;
  lastSeen?: string;
}

export type CallStatus = 
  | 'ringing'
  | 'in_progress_ivr'
  | 'pending_verification'
  | 'verification_successful'
  | 'verification_failed'
  | 'routing_to_agent'
  | 'connected_to_agent'
  | 'completed'
  | 'missed'
  | 'failed';

export interface CallRecording {
  id: string;
  callerId: string; // e.g., phone number
  startTime: string; // ISO string
  endTime?: string; // ISO string
  duration: string; // e.g., "5m 32s"
  agent?: Agent;
  recordingUrl?: string; // Placeholder
  status: CallStatus;
  transcriptSummary?: string;
  ivrPath?: string[]; // e.g. ['Greeting', 'NameCollection', 'AgeCollection']
}

export interface CallMetric {
  label: string;
  value: string | number;
  icon: LucideIcon;
  trend?: string; // e.g., "+5.2%"
  trendType?: 'positive' | 'negative';
  description?: string;
}

export interface AISimulationResult {
  collectedInfo?: {
    name?: string;
    age?: number;
    readyForHuman?: boolean;
    response?: string; // The AI-generated response to say to the user.
    error?: string;
  };
  verificationInfo?: {
    isValid?: boolean;
    confidenceScore?: number;
    reason?: string;
    error?: string;
  };
  error?: string;
}
