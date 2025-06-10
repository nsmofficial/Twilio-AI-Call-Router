import type { CallMetric } from '@/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { TrendingUp, TrendingDown, Phone, Users, Clock, ArrowRightCircle } from 'lucide-react';
import { cn } from "@/lib/utils"

const mockMetrics: CallMetric[] = [
  {
    label: 'Total Calls Today',
    value: 125,
    icon: Phone,
    trend: '+15%',
    trendType: 'positive',
    description: 'Compared to yesterday',
  },
  {
    label: 'Active IVR Sessions',
    value: 8,
    icon: Users, // Using Users icon for active sessions
    description: 'Currently interacting with AI',
  },
  {
    label: 'Avg. IVR Time',
    value: '1m 25s',
    icon: Clock,
    trend: '-5s',
    trendType: 'positive', // Shorter time is positive
    description: 'Average time in IVR before action',
  },
  {
    label: 'Transferred to Agents',
    value: 42,
    icon: ArrowRightCircle, // Using ArrowRightCircle for transfers
    trend: '+8',
    trendType: 'positive',
    description: 'Calls successfully handed over',
  },
];

export function CallMetricsCards() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {mockMetrics.map((metric) => (
        <Card key={metric.label} className="transition-all hover:shadow-xl">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {metric.label}
            </CardTitle>
            <metric.icon className="h-6 w-6 text-muted-foreground" /> {/* Increased icon size */}
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground font-headline">{metric.value}</div>
            {metric.trend && (
              <p className="text-xs text-muted-foreground mt-1 flex items-center">
                {metric.trendType === 'positive' ? (
                  <TrendingUp className="mr-1 h-4 w-4 text-green-500" />
                ) : (
                  <TrendingDown className="mr-1 h-4 w-4 text-red-500" />
                )}
                <span className={cn(metric.trendType === 'positive' ? 'text-green-600' : 'text-red-600', 'font-semibold')}> {/* Made trend text bolder */}
                  {metric.trend}
                </span>
                <span className="ml-1">{metric.description}</span>
              </p>
            )}
            {!metric.trend && metric.description && (
                 <p className="text-xs text-muted-foreground mt-1">{metric.description}</p>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
