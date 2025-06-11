'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { User, Phone, MoreHorizontal } from 'lucide-react';
import type { Agent, AgentStatus } from '@/services/agent';
import { useToast } from "@/hooks/use-toast";

// Helper to get the color for each status badge
const getStatusColor = (status: Agent['status']) => {
  switch (status) {
    case 'available':
      return 'bg-green-500 hover:bg-green-600';
    case 'busy':
      return 'bg-yellow-500 hover:bg-yellow-600';
    case 'offline':
      return 'bg-red-500 hover:bg-red-600';
    default:
      return 'bg-gray-500';
  }
};

export function AgentStatusCard() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchAgents = async () => {
    try {
      const response = await fetch('/api/agents');
      if (!response.ok) {
        throw new Error('Failed to fetch agent data');
      }
      const data: Agent[] = await response.json();
      setAgents(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAgents();
    const interval = setInterval(fetchAgents, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleStatusChange = async (agentId: string, status: AgentStatus) => {
    try {
      const response = await fetch('/api/agents', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ agentId, status }),
      });
      if (!response.ok) {
        throw new Error('Failed to update status');
      }
      toast({ title: "Success", description: `Agent status updated to ${status}.` });
      await fetchAgents(); // Refresh the list immediately
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  return (
    <Card className="transition-all hover:shadow-xl">
      <CardHeader>
        <CardTitle className="font-headline text-xl">Agent Status</CardTitle>
        <CardDescription>Live status of the agent pool.</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <p>Loading agent statuses...</p>
        ) : error ? (
          <p className="text-destructive">Error: {error}</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Agent</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {agents.map((agent) => (
                <TableRow key={agent.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center">
                      <User className="mr-2 h-4 w-4 text-muted-foreground" />
                      {agent.name}
                    </div>
                    <div className="text-sm text-muted-foreground flex items-center mt-1">
                       <Phone className="mr-2 h-4 w-4 text-muted-foreground" />
                       {agent.phoneNumber}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(agent.status)}>
                      {agent.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleStatusChange(agent.id, 'available')}>
                          Set as Available
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleStatusChange(agent.id, 'busy')}>
                          Set as Busy
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleStatusChange(agent.id, 'offline')}>
                          Set as Offline
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
} 