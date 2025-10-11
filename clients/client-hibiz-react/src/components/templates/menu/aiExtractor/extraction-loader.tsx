import { Scan, Loader2 } from "lucide-react";

interface ExtractionLoaderProps {
  filesCount: number;
}

export function ExtractionLoader({ filesCount }: ExtractionLoaderProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6">
      <div className="relative mb-8">
        <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full animate-pulse" />
        <div className="relative p-6 rounded-2xl bg-card border border-primary/20">
          <Scan className="w-12 h-12 text-primary animate-pulse" />
        </div>
      </div>

      <h3 className="text-2xl font-bold text-foreground mb-2">
        Extracting Menu Data
      </h3>
      <p className="text-muted-foreground text-center max-w-md mb-6">
        Reading your {filesCount} {filesCount === 1 ? "file" : "files"} and
        structuring menu with AI...
      </p>

      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="w-4 h-4 animate-spin" />
        <span>This may take a moment</span>
      </div>
    </div>
  );
}
