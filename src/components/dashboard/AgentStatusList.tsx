
import type { Agent, AgentStatus } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { UserCheck, UserX, PhoneCall, Clock as OfflineIcon, UserCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const mockAgents: Agent[] = [
  { id: '1', name: 'Priya Sharma', avatarUrl: 'https://placehold.co/40x40.png', status: 'available', callsHandledToday: 12, lastSeen: 'Online' },
  { id: '2', name: 'Amit Singh', avatarUrl: 'https://placehold.co/40x40.png', status: 'on_call', callsHandledToday: 15, currentCallId: 'CALL-789', lastSeen: 'Online' },
  { id: '3', name: 'Sunita Patel', status: 'busy', callsHandledToday: 10, lastSeen: 'Online' },
  { id: '4', name: 'Rajesh Kumar', avatarUrl: 'https://placehold.co/40x40.png', status: 'offline', callsHandledToday: 0, lastSeen: '2 hours ago' },
];

const statusIcons: Record<AgentStatus, React.ElementType> = {
  available: UserCheck,
  busy: UserX,
  on_call: PhoneCall,
  offline: OfflineIcon,
};

const statusColors: Record<AgentStatus, string> = {
  available: 'bg-green-500',
  busy: 'bg-yellow-500',
  on_call: 'bg-blue-500',
  offline: 'bg-slate-500',
};

const statusText: Record<AgentStatus, string> = {
  available: 'Available',
  busy: 'Busy',
  on_call: 'On Call',
  offline: 'Offline',
};


export function AgentStatusList() {
  return (
    <Card className="shadow-lg transition-all hover:shadow-xl">
      <CardHeader>
        <CardTitle className="font-headline text-xl">Agent Status</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {mockAgents.map((agent) => {
          const IconComponent = statusIcons[agent.status];
          return (
            <div key={agent.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-secondary/50 transition-colors">
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={agent.avatarUrl} alt={agent.name} data-ai-hint="profile person" />
                  <AvatarFallback>
                    <UserCircle className="h-6 w-6 text-muted-foreground" />
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium text-foreground">{agent.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {agent.status === 'on_call' && agent.currentCallId ? `Call ID: ${agent.currentCallId}` : `${agent.callsHandledToday} calls today`}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                 <Badge variant={agent.status === 'available' ? 'default' : agent.status === 'on_call' ? 'secondary' : 'outline'} 
                       className={
                           agent.status === 'available' ? 'bg-green-100 text-green-800 border-green-300' :
                           agent.status === 'on_call' ? 'bg-blue-100 text-blue-800 border-blue-300' :
                           agent.status === 'busy' ? 'bg-yellow-100 text-yellow-800 border-yellow-300' :
                           'bg-slate-100 text-slate-800 border-slate-300'
                       }>
                    <IconComponent className={`mr-1.5 h-3.5 w-3.5 ${
                        agent.status === 'available' ? 'text-green-600' :
                        agent.status === 'on_call' ? 'text-blue-600' :
                        agent.status === 'busy' ? 'text-yellow-600' :
                        'text-slate-600'
                    }`} />
                    {statusText[agent.status]}
                </Badge>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
