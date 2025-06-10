
'use client';

import { useState } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, CheckCircle, XCircle, MessageSquare, User, Calendar, Info } from 'lucide-react';
import { processCallTranscriptAction } from '@/lib/actions';
import type { AISimulationResult } from '@/types';
import { useToast } from "@/hooks/use-toast";


const formSchema = z.object({
  callTranscript: z.string().min(3, { message: "Transcript must be at least 3 characters." }),
});
type FormData = z.infer<typeof formSchema>;

export function CallSimulationCard() {
  const [isLoading, setIsLoading] = useState(false);
  const [simulationResult, setSimulationResult] = useState<AISimulationResult | null>(null);
  const { toast } = useToast();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      callTranscript: "",
    },
  });

  const onSubmit: SubmitHandler<FormData> = async (data) => {
    setIsLoading(true);
    setSimulationResult(null);
    try {
      const result = await processCallTranscriptAction(data.callTranscript);
      setSimulationResult(result);
      if (result.error) {
        toast({
          title: "Simulation Error",
          description: result.error,
          variant: "destructive",
        });
      } else {
         toast({
          title: "Simulation Complete",
          description: "AI processing finished.",
        });
      }
    } catch (error: any) {
      console.error("Simulation action error:", error);
      setSimulationResult({ error: error.message || "An unexpected error occurred." });
      toast({
        title: "Simulation Failed",
        description: error.message || "An unexpected error occurred.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="shadow-lg transition-all hover:shadow-xl">
      <CardHeader>
        <CardTitle className="font-headline text-xl">AI Call Simulation</CardTitle>
        <CardDescription>Test the AI IVR and response verification flow.</CardDescription>
      </CardHeader>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="callTranscript" className="mb-1 block">Caller Transcript / Input</Label>
            <Textarea
              id="callTranscript"
              placeholder="e.g., Hello, my name is John Doe and I am 30 years old..."
              className="min-h-[100px]"
              {...form.register('callTranscript')}
            />
            {form.formState.errors.callTranscript && (
              <p className="text-sm text-destructive mt-1">{form.formState.errors.callTranscript.message}</p>
            )}
          </div>
        </CardContent>
        <CardFooter className="flex justify-end">
          <Button type="submit" disabled={isLoading}>
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <MessageSquare className="mr-2 h-4 w-4" />}
            Process Call
          </Button>
        </CardFooter>
      </form>

      {simulationResult && (
        <>
          <Separator className="my-4" />
          <CardContent className="space-y-4">
            <h3 className="text-lg font-semibold font-headline">Simulation Results:</h3>
            {simulationResult.collectedInfo && (
              <Alert variant={simulationResult.collectedInfo.error ? "destructive" : "default"}>
                 <Info className="h-4 w-4" />
                <AlertTitle className="font-headline">Information Collection (IVR)</AlertTitle>
                <AlertDescription className="space-y-1">
                  {simulationResult.collectedInfo.error ? (
                    <p>Error: {simulationResult.collectedInfo.error}</p>
                  ) : (
                    <>
                      <p className="flex items-center"><User className="mr-2 h-4 w-4 text-muted-foreground" /> Name: {simulationResult.collectedInfo.name || 'Not Provided'}</p>
                      <p className="flex items-center"><Calendar className="mr-2 h-4 w-4 text-muted-foreground" /> Age: {simulationResult.collectedInfo.age || 'Not Provided'}</p>
                      <p className="flex items-center">
                        {simulationResult.collectedInfo.readyForHuman ? <CheckCircle className="mr-2 h-4 w-4 text-green-500" /> : <XCircle className="mr-2 h-4 w-4 text-red-500" />}
                        Ready for Human Agent: {simulationResult.collectedInfo.readyForHuman ? 'Yes' : 'No'}
                      </p>
                    </>
                  )}
                </AlertDescription>
              </Alert>
            )}

            {simulationResult.verificationInfo && (
              <Alert variant={simulationResult.verificationInfo.error ? "destructive" : (simulationResult.verificationInfo.isValid ? "default" : "destructive")}>
                {simulationResult.verificationInfo.isValid ? <CheckCircle className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
                <AlertTitle className="font-headline">Response Verification</AlertTitle>
                <AlertDescription className="space-y-1">
                  {simulationResult.verificationInfo.error ? (
                    <p>Error: {simulationResult.verificationInfo.error}</p>
                  ) : (
                    <>
                      <p>Is Valid: {simulationResult.verificationInfo.isValid ? 'Yes' : 'No'}</p>
                      <p>Confidence Score: {simulationResult.verificationInfo.confidenceScore?.toFixed(2) || 'N/A'}</p>
                      <p>Reason: {simulationResult.verificationInfo.reason || 'N/A'}</p>
                    </>
                  )}
                </AlertDescription>
              </Alert>
            )}
            {simulationResult.error && !simulationResult.collectedInfo && !simulationResult.verificationInfo && (
                 <Alert variant="destructive">
                    <XCircle className="h-4 w-4" />
                    <AlertTitle>Overall Simulation Error</AlertTitle>
                    <AlertDescription>{simulationResult.error}</AlertDescription>
                 </Alert>
            )}
          </CardContent>
        </>
      )}
    </Card>
  );
}
