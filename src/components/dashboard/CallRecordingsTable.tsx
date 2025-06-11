'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { PlayCircle, Phone, User, Calendar, Tag } from 'lucide-react';
import { format } from 'date-fns';
import type { Call } from '@/services/call';
import type { Agent } from '@/services/agent';

// A type that includes the agent details
type CallWithAgent = Call & { agent: Agent | null };

export function CallRecordingsTable() {
  const [calls, setCalls] = useState<CallWithAgent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCalls = async () => {
      try {
        const response = await fetch('/api/calls');
        if (!response.ok) {
          throw new Error('Failed to fetch call history');
        }
        const data: CallWithAgent[] = await response.json();
        setCalls(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCalls();
    // Refresh call history every 10 seconds
    const interval = setInterval(fetchCalls, 10000);
    return () => clearInterval(interval);
  }, []);
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Call History</CardTitle>
        <CardDescription>A log of all processed calls.</CardDescription>
      </CardHeader>
      <CardContent>
         {isLoading ? (
          <p>Loading call history...</p>
        ) : error ? (
          <p className="text-destructive">Error: {error}</p>
        ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Caller</TableHead>
              <TableHead>Agent</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="text-right">Recording</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {calls.map((call) => (
              <TableRow key={call.id}>
                <TableCell>
                  <div className="flex items-center">
                    <Phone className="mr-2 h-4 w-4 text-muted-foreground" />
                    {call.fromNumber}
                  </div>
                </TableCell>
                <TableCell>
                   <div className="flex items-center">
                    {call.agent ? (
                      <>
                        <User className="mr-2 h-4 w-4 text-muted-foreground" />
                        {call.agent.name}
                      </>
                    ) : (
                      <span className="text-muted-foreground">N/A</span>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline">{call.status}</Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center">
                     <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                     {format(new Date(call.createdAt), 'PPpp')}
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  {call.recordingUrl ? (
                    <a href={call.recordingUrl} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline flex items-center justify-end">
                      <PlayCircle className="mr-2 h-5 w-5" />
                      Play
                    </a>
                  ) : (
                    <span className="text-muted-foreground">No Recording</span>
                  )}
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
