
import type { CallRecording } from '@/types';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlayCircle, FileText, CheckCircle2, AlertTriangle, XCircle, PhoneForwarded, Clock, PhoneMissed, PhoneCall, Phone } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { format, parseISO } from 'date-fns';

const mockRecordings: CallRecording[] = [
  { id: 'REC001', callerId: '+91-9876500101', startTime: new Date(Date.now() - 3600000).toISOString(), duration: '5m 32s', agent: { id: '1', name: 'Priya S.', status: 'available', callsHandledToday: 0 }, status: 'completed', transcriptSummary: 'Inquired about new mobile plan details.' },
  { id: 'REC002', callerId: '+91-9876500102', startTime: new Date(Date.now() - 7200000).toISOString(), duration: '2m 10s', status: 'verification_successful', ivrPath: ['Greet', 'Name', 'Age', 'Verify'] },
  { id: 'REC003', callerId: '+91-9876500103', startTime: new Date(Date.now() - 10800000).toISOString(), duration: '0m 45s', status: 'verification_failed', transcriptSummary: 'Age verification for service failed.' },
  { id: 'REC004', callerId: '+91-9876500104', startTime: new Date(Date.now() - 14400000).toISOString(), duration: '3m 15s', agent: { id: '2', name: 'Amit S.', status: 'available', callsHandledToday: 0 }, status: 'completed', transcriptSummary: 'Resolved billing query successfully.' },
  { id: 'REC005', callerId: '+91-9876500105', startTime: new Date(Date.now() - 18000000).toISOString(), duration: '1m 02s', status: 'missed' },
];

const statusIconsAndText: Record<CallRecording['status'], { icon: React.ElementType, text: string, colorClass: string }> = {
  ringing: { icon: Phone, text: 'Ringing', colorClass: 'text-blue-500 bg-blue-100 border-blue-300' },
  in_progress_ivr: { icon: Clock, text: 'IVR Active', colorClass: 'text-purple-500 bg-purple-100 border-purple-300' },
  pending_verification: { icon: Clock, text: 'Verifying', colorClass: 'text-yellow-500 bg-yellow-100 border-yellow-300' },
  verification_successful: { icon: CheckCircle2, text: 'Verified', colorClass: 'text-green-500 bg-green-100 border-green-300' },
  verification_failed: { icon: XCircle, text: 'Verification Failed', colorClass: 'text-red-500 bg-red-100 border-red-300' },
  routing_to_agent: { icon: PhoneForwarded, text: 'Routing', colorClass: 'text-cyan-500 bg-cyan-100 border-cyan-300' },
  connected_to_agent: { icon: PhoneCall, text: 'Agent Connected', colorClass: 'text-indigo-500 bg-indigo-100 border-indigo-300' },
  completed: { icon: CheckCircle2, text: 'Completed', colorClass: 'text-green-600 bg-green-100 border-green-400' },
  missed: { icon: PhoneMissed, text: 'Missed', colorClass: 'text-orange-500 bg-orange-100 border-orange-300' },
  failed: { icon: AlertTriangle, text: 'Failed', colorClass: 'text-red-600 bg-red-100 border-red-400' },
};


export function CallRecordingsTable() {
  return (
    <Card className="shadow-lg transition-all hover:shadow-xl">
      <CardHeader>
        <CardTitle className="font-headline text-xl">Call Log & Recordings</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Caller ID</TableHead>
              <TableHead>Date & Time</TableHead>
              <TableHead>Duration</TableHead>
              <TableHead>Agent</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {mockRecordings.map((rec) => {
              const statusInfo = statusIconsAndText[rec.status] || { icon: AlertTriangle, text: 'Unknown', colorClass: 'text-gray-500 bg-gray-100 border-gray-300' };
              const StatusIcon = statusInfo.icon;
              return (
                <TableRow key={rec.id} className="hover:bg-secondary/50 transition-colors">
                  <TableCell className="font-medium">{rec.callerId}</TableCell>
                  <TableCell>{format(parseISO(rec.startTime), 'MMM d, yyyy HH:mm')}</TableCell>
                  <TableCell>{rec.duration}</TableCell>
                  <TableCell>{rec.agent?.name || 'N/A'}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={`whitespace-nowrap ${statusInfo.colorClass}`}>
                      <StatusIcon className="mr-1.5 h-3.5 w-3.5" />
                      {statusInfo.text}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    {rec.recordingUrl && (
                       <Button variant="ghost" size="icon" aria-label="Play Recording">
                         <PlayCircle className="h-5 w-5 text-primary" />
                       </Button>
                    )}
                    {rec.transcriptSummary && (
                      <Button variant="ghost" size="icon" aria-label="View Transcript">
                        <FileText className="h-5 w-5 text-muted-foreground" />
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
