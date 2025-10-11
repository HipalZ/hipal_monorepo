import { useState } from "react";
import { FileUploadZone } from "./file-upload-zone";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";

interface UploadStepProps {
  onExtract: (files: File[]) => void;
  isLoading: boolean;
}

export function UploadStep({ onExtract, isLoading }: UploadStepProps) {
  const [files, setFiles] = useState<File[]>([]);

  const handleExtract = () => {
    if (files.length > 0) {
      onExtract(files);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
          <Sparkles className="w-4 h-4" />
          <span>AI-Powered Menu Extraction</span>
        </div>

        <h1 className="text-5xl font-bold text-foreground mb-4 text-balance">
          Transform Your Menu
          <br />
          <span className="text-primary">In Seconds</span>
        </h1>

        <p className="text-lg text-muted-foreground text-balance max-w-2xl mx-auto">
          Upload images, PDFs, Excel sheets, or CSV files. Our AI will extract
          categories, dishes, prices, and portions automatically.
        </p>
      </div>

      <FileUploadZone onFilesSelected={setFiles} maxFiles={5} />

      {files.length > 0 && (
        <div className="mt-8 flex justify-center">
          <Button
            onClick={handleExtract}
            disabled={isLoading}
            size="lg"
            className="px-8 py-6 text-lg font-semibold bg-secondary hover:bg-secondary/90"
          >
            {isLoading ? (
              <>
                <Sparkles className="w-5 h-5 mr-2 animate-pulse" />
                Extracting...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5 mr-2" />
                Extract Menu with AI
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  );
}
