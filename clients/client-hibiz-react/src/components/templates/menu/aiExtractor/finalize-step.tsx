import { UtensilsCrossed, CheckCircle2, Loader2 } from "lucide-react";

interface FinalizeStepProps {
  stage: "creating-categories" | "linking-dishes" | "complete";
  categoriesCount: number;
  dishesCount: number;
}

export function FinalizeStep({
  stage,
  categoriesCount,
  dishesCount,
}: FinalizeStepProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-6">
      <div className="max-w-md w-full space-y-8">
        {/* Creating Categories */}
        <div
          className={`flex items-start gap-4 transition-opacity ${
            stage === "creating-categories" ? "opacity-100" : "opacity-50"
          }`}
        >
          <div
            className={`p-3 rounded-xl ${
              stage === "creating-categories" ? "bg-primary/10" : "bg-muted"
            }`}
          >
            {stage === "creating-categories" ? (
              <Loader2 className="w-6 h-6 text-primary animate-spin" />
            ) : (
              <CheckCircle2 className="w-6 h-6 text-primary" />
            )}
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-foreground mb-1">
              Setting up your menu structure
            </h3>
            <p className="text-sm text-muted-foreground">
              Creating {categoriesCount} categories...
            </p>
          </div>
        </div>

        {/* Linking Dishes */}
        <div
          className={`flex items-start gap-4 transition-opacity ${
            stage === "linking-dishes"
              ? "opacity-100"
              : stage === "complete"
                ? "opacity-100"
                : "opacity-30"
          }`}
        >
          <div
            className={`p-3 rounded-xl ${
              stage === "linking-dishes"
                ? "bg-primary/10"
                : stage === "complete"
                  ? "bg-muted"
                  : "bg-muted/50"
            }`}
          >
            {stage === "linking-dishes" ? (
              <Loader2 className="w-6 h-6 text-primary animate-spin" />
            ) : stage === "complete" ? (
              <CheckCircle2 className="w-6 h-6 text-primary" />
            ) : (
              <UtensilsCrossed className="w-6 h-6 text-muted-foreground" />
            )}
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-foreground mb-1">
              Saving dishes and attaching them to categories
            </h3>
            <p className="text-sm text-muted-foreground">
              Processing {dishesCount} dishes...
            </p>
          </div>
        </div>

        {/* Complete */}
        {stage === "complete" && (
          <div className="pt-8 text-center">
            <div className="inline-flex p-4 rounded-full bg-primary/10 mb-4">
              <CheckCircle2 className="w-12 h-12 text-primary" />
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-2">
              All done! 🎉
            </h2>
            <p className="text-muted-foreground">
              Created {categoriesCount} categories and {dishesCount} dishes.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
