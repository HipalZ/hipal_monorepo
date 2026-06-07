import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, BarChart3, Inbox } from "lucide-react";

interface SourcesDashboardProps {
  sourcePercentages: Record<string, number>;
}

const COLORS = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
];

export function SourcesDashboard({ sourcePercentages }: SourcesDashboardProps) {
  const chartData = Object.entries(sourcePercentages || {})
    .filter(([_, v]) => Number(v) > 0)
    .map(([name, value], i) => ({
      name,
      value: Number(value),
      color: COLORS[i % COLORS.length],
    }));

  const hasData = chartData.length > 0;
  const topSource = hasData
    ? chartData.reduce((max, item) => (item.value > max.value ? item : max))
    : null;

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-card border border-border rounded-lg p-3 shadow-xl backdrop-blur-sm animate-in fade-in-0 zoom-in-95 duration-200">
          <p className="font-semibold text-card-foreground">
            {payload[0].name}
          </p>
          <p className="text-primary font-bold text-lg">
            {Number(payload[0].value).toFixed(1)}%
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="w-full overflow-hidden rounded-lg border border-border/60 bg-white shadow-sm transition-all duration-300 hover:shadow-lg">
      <div className="h-1.5 bg-gradient-to-r from-teal-500 via-amber-400 to-rose-400" />
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg sm:text-xl font-bold flex items-center space-x-3 text-foreground">
            <div className="p-2 rounded-lg bg-teal-50 text-teal-700 ring-1 ring-teal-100">
              <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <span>Booking Sources Distribution</span>
          </CardTitle>
          <div className="hidden sm:flex items-center space-x-2 rounded-full bg-slate-50 px-3 py-1 text-muted-foreground ring-1 ring-slate-100">
            <BarChart3 className="w-4 h-4" />
            <span className="text-sm font-medium">Analytics</span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {!hasData ? (
          <div className="py-16 flex flex-col items-center justify-center gap-2 text-muted-foreground">
            <Inbox className="w-8 h-8" />
            <p className="font-medium">
              No source data available for the selected range.
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-center">
              {/* Legend */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-foreground mb-4">
                  Sources
                </h3>
                <div className="space-y-3">
                  {chartData.map((entry) => (
                    <div
                      key={entry.name}
                      className="rounded-lg border border-border/50 bg-slate-50/70 p-3 transition-all duration-200 hover:-translate-y-0.5 hover:bg-white hover:shadow-sm"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex min-w-0 items-center space-x-3">
                          <div
                            className="h-3.5 w-3.5 rounded-full border-2 border-white shadow-sm"
                            style={{ backgroundColor: entry.color }}
                          />
                          <span className="truncate text-sm font-semibold text-foreground sm:text-base">
                            {entry.name}
                          </span>
                        </div>
                        <span className="text-base font-bold text-slate-900">
                          {entry.value.toFixed(1)}%
                        </span>
                      </div>
                      <div className="mt-3 h-2 overflow-hidden rounded-full bg-white ring-1 ring-border/40">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{
                            width: `${Math.min(entry.value, 100)}%`,
                            backgroundColor: entry.color,
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Pie */}
              <div className="relative">
                <div className="h-72 sm:h-80 lg:h-96 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={chartData}
                        cx="50%"
                        cy="50%"
                        innerRadius="35%"
                        outerRadius="70%"
                        paddingAngle={3}
                        dataKey="value"
                        animationBegin={0}
                        animationDuration={800}
                      >
                        {chartData.map((e, i) => (
                          <Cell
                            key={`cell-${i}`}
                            fill={e.color}
                            className="hover:opacity-80 transition-opacity duration-200 cursor-pointer"
                          />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                {topSource && (
                  <div className="pointer-events-none absolute left-1/2 top-1/2 w-32 -translate-x-1/2 -translate-y-1/2 text-center">
                    <div className="text-xs font-medium text-muted-foreground">
                      Leader
                    </div>
                    <div className="truncate text-sm font-bold text-foreground">
                      {topSource.name}
                    </div>
                    <div className="text-lg font-black text-amber-600">
                      {topSource.value.toFixed(1)}%
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="rounded-lg border border-dashed border-border/70 bg-slate-50/70 px-4 py-3 text-sm text-muted-foreground">
              Source share is shown in the chart and progress bars above.
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
