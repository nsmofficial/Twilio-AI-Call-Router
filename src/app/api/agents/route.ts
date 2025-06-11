import { NextResponse } from 'next/server';
import { agentService, Agent } from '@/services/agent';

export async function GET() {
  const agents: Agent[] = await agentService.listAgents();
  return NextResponse.json(agents);
}

export async function PUT(request: Request) {
  try {
    const { agentId, status } = await request.json();
    if (!agentId || !status) {
      return NextResponse.json({ error: 'Missing agentId or status' }, { status: 400 });
    }
    const updatedAgent = await agentService.setAgentStatus(agentId, status);
    return NextResponse.json(updatedAgent);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update agent status' }, { status: 500 });
  }
} 