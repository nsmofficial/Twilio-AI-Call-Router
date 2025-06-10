import { DashboardHeader } from '@/components/dashboard/Header';
import { CallMetricsCards } from '@/components/dashboard/CallMetricsCard';
import { AgentStatusList } from '@/components/dashboard/AgentStatusList';
import { CallRecordingsTable } from '@/components/dashboard/CallRecordingsTable';
import { CallSimulationCard } from '@/components/dashboard/CallSimulationCard';

export default function DashboardPage() {
  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
      <DashboardHeader />
      <main className="flex flex-1 flex-col gap-6 p-4 sm:p-6">
        <section aria-labelledby="call-metrics-title">
          <h2 id="call-metrics-title" className="sr-only">
            Call Metrics
          </h2>
          <CallMetricsCards />
        </section>

        <div className="grid gap-6 lg:grid-cols-3">
          <section aria-labelledby="ai-simulation-and-agents-title" className="lg:col-span-1 flex flex-col gap-6">
             <h2 id="ai-simulation-and-agents-title" className="sr-only">
                AI Simulation and Agent Status
             </h2>
            <CallSimulationCard />
            <AgentStatusList />
          </section>

          <section aria-labelledby="call-recordings-title" className="lg:col-span-2">
            <h2 id="call-recordings-title" className="sr-only">
              Call Recordings
            </h2>
            <CallRecordingsTable />
          </section>
        </div>
      </main>
      <footer className="py-4 px-6 text-center text-sm text-muted-foreground border-t">
        © {new Date().getFullYear()} Twilio AI Call Router. All rights reserved.
      </footer>
    </div>
  );
}
