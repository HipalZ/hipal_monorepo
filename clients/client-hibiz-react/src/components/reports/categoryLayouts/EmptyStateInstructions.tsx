import { Card, CardContent } from "@/components/ui/card.tsx";
import { Calendar, MousePointer, TrendingUp, BarChart3 } from "lucide-react";
import { memo } from "react";

interface CategoryReportProps {
  text: string;
}

const MemoEmptyStateInstructions = ({ text }: CategoryReportProps) => {
  return (
    <Card className="w-full pb-[5rem]">
      <CardContent className="flex flex-col items-center justify-center py-12">
        <section className="flex items-center">
          <BarChart3 className="w-16 h-16 text-muted-foreground mb-6" />
          <h3 className="text-xl font-semibold mb-4">
            Generate Your {text} Report
          </h3>
        </section>
        <p className="text-muted-foreground text-center mb-8 max-w-md">
          Follow these simple steps to generate your {text} analytics report
        </p>

        {/* Step-by-step instructions */}
        <div className="w-full max-w-md space-y-4">
          <div className="flex items-start gap-4 p-4 bg-muted/30 rounded-lg">
            <div className="flex items-center justify-center w-8 h-8 bg-base-100 text-base-100-foreground rounded-full text-sm font-semibold">
              1
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <Calendar className="w-4 h-4 text-base-100" />
                <h4 className="font-semibold">Select Date Range</h4>
              </div>
              <p className="text-sm text-muted-foreground">
                Choose your desired date range using the date picker above
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4 p-4 bg-muted/30 rounded-lg">
            <div className="flex items-center justify-center w-8 h-8 bg-base-100 text-base-100-foreground rounded-full text-sm font-semibold">
              2
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <MousePointer className="w-4 h-4 text-base-100" />
                <h4 className="font-semibold">Generate Report</h4>
              </div>
              <p className="text-sm text-muted-foreground">
                Click the "Generate Report" button below to fetch your data
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4 p-4 bg-muted/30 rounded-lg">
            <div className="flex items-center justify-center w-8 h-8 bg-base-100 text-base-100-foreground rounded-full text-sm font-semibold">
              3
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp className="w-4 h-4 text-base-100" />
                <h4 className="font-semibold">View Analytics</h4>
              </div>
              <p className="text-sm text-muted-foreground">
                Analyze your {text} performance with detailed insights
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const EmptyStateInstructions = memo(MemoEmptyStateInstructions);
export default EmptyStateInstructions;
