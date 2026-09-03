import type { ServiceDataItem } from '@/components/types/hotelTypes';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertTriangle } from 'lucide-react';
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';

const COLORS = [
  '#3b82f6',
  '#10b981',
  '#f59e0b',
  '#ef4444',
  '#8b5cf6',
  '#ec4899',
  '#06b6d4',
  '#f97316',
  '#84cc16',
  '#14b8a6',
  '#a855f7',
  '#f43f5e',
  '#6366f1',
  '#8b5cf6',
  '#ec4899',
];

interface EscalationPieChartProps {
  isLoading: boolean;
  serviceData: ServiceDataItem[];
}

export default function EscalationPieChart({ isLoading, serviceData }: EscalationPieChartProps) {
  const total = serviceData.reduce((s, i) => s + i.count, 0) || 1;

  // Sort + add percent
  const sorted = [...serviceData].sort((a, b) => b.count - a.count).map((i) => ({ ...i, percent: (i.count / total) * 100 }));

  const itemCount = sorted.length;
  const outerRadius = itemCount > 15 ? 80 : itemCount > 10 ? 100 : 120;

  // Show label only for ≥5%
  const showLabel = (p: number) => p >= 5;

  // ────── LOADING ──────
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Service Request Distribution</CardTitle>
          <CardDescription>Percentage breakdown of escalations by service type</CardDescription>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[400px] w-full rounded-xl" />
        </CardContent>
      </Card>
    );
  }

  // ────── EMPTY ──────
  if (!serviceData.length) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Service Request Distribution</CardTitle>
          <CardDescription>Percentage breakdown of escalations by service type</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-muted-foreground flex h-[400px] flex-col items-center justify-center">
            <AlertTriangle className="mb-4 h-10 w-10 opacity-50" />
            <p>No escalation data available</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Service Request Distribution</CardTitle>
        <CardDescription>Percentage breakdown of escalations by service type</CardDescription>
      </CardHeader>

      <CardContent>
        {/* Horizontal layout */}
        <div className="flex h-[300px] flex-col gap-6 lg:flex-row">
          {/* ────── PIE CHART (fixed width) ────── */}
          <div className="min-w-0 flex-1 lg:w-1/2">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={sorted} cx="50%" cy="50%" innerRadius={60} outerRadius={outerRadius} paddingAngle={1} dataKey="count" nameKey="name">
                  {sorted.map((_, i) => (
                    <Cell key={`cell-${i}`} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>

                {/* Labels only for ≥5% */}
                {sorted.map((entry, i) =>
                  showLabel(entry.percent) ? (
                    <text
                      key={`lbl-${i}`}
                      x={0}
                      y={0}
                      className="fill-foreground text-xs font-medium"
                      // Recharts auto‑positions via labelLine
                    >
                      {entry.name}: {entry.percent.toFixed(0)}%
                    </text>
                  ) : null,
                )}

                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--background))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                  }}
                  formatter={(v: number, n: string) => [`${v} request${v > 1 ? 's' : ''}`, n]}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* ────── LEGEND (scrollable, fixed width) ────── */}
          <div className="flex-1 lg:w-1/2 lg:max-w-xs">
            <ScrollArea className="h-full pr-4">
              <div className="space-y-2">
                {sorted.map((entry, i) => {
                  const pct = entry.percent.toFixed(1);
                  return (
                    <div key={entry.name} className="flex items-center gap-3 text-sm">
                      <div className="h-4 w-4 shrink-0 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                      <div className="min-w-0 flex-1">
                        <p className="text-foreground truncate font-medium">{entry.name}</p>
                        <p className="text-muted-foreground text-xs">
                          {entry.count} ({pct}%)
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
