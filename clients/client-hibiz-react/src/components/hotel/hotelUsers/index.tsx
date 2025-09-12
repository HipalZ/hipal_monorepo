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
    <Card className="w-full shadow-sm hover:shadow-md transition-shadow duration-300 border-0 bg-gradient-to-br from-card to-card/80">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg sm:text-xl font-bold flex items-center space-x-3 text-foreground">
            <div className="p-2 rounded-lg bg-primary/10">
              <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
            </div>
            <span className="bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
              Booking Sources Distribution
            </span>
          </CardTitle>
          <div className="hidden sm:flex items-center space-x-2 text-muted-foreground">
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
                      className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors duration-200"
                    >
                      <div className="flex items-center space-x-3">
                        <div
                          className="w-4 h-4 rounded-full border-2 border-white shadow-sm"
                          style={{ backgroundColor: entry.color }}
                        />
                        <span className="font-medium text-foreground text-sm sm:text-base">
                          {entry.name}
                        </span>
                      </div>
                      <span className="font-bold text-primary text-lg">
                        {entry.value.toFixed(1)}%
                      </span>
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
              </div>
            </div>

            <div className="pt-6 border-t border-border/50">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
                <div className="text-center sm:text-left space-y-1">
                  <div className="text-sm text-muted-foreground font-medium">
                    Total Sources
                  </div>
                  <div className="text-2xl sm:text-3xl font-bold text-primary">
                    {chartData.length}
                  </div>
                </div>
                <div className="text-center sm:text-left space-y-1">
                  <div className="text-sm text-muted-foreground font-medium">
                    Top Source
                  </div>
                  <div className="text-base sm:text-lg font-semibold text-foreground truncate">
                    {
                      chartData.reduce((max, item) =>
                        item.value > max.value ? item : max,
                      ).name
                    }
                  </div>
                </div>
                <div className="text-center sm:text-left space-y-1">
                  <div className="text-sm text-muted-foreground font-medium">
                    Top Percentage
                  </div>
                  <div className="text-2xl sm:text-3xl font-bold text-accent">
                    {`${chartData
                      .reduce((max, item) =>
                        item.value > max.value ? item : max,
                      )
                      .value.toFixed(1)}%`}
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
