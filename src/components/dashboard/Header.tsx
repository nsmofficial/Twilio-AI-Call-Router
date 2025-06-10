import { BotMessageSquare } from 'lucide-react';

export function DashboardHeader() {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background/80 px-4 backdrop-blur-md sm:px-6">
      <div className="flex items-center gap-2">
        <BotMessageSquare className="h-7 w-7 text-primary" />
        <h1 className="text-xl font-semibold text-foreground font-headline">
          Twilio AI Call Router
        </h1>
      </div>
      {/* Add User/Settings Dropdown here if needed later */}
    </header>
  );
}
