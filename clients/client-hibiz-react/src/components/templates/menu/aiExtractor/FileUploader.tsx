import { useState } from "react";

export function FileUploader({
  onFiles,
}: { onFiles: (files: File[]) => void }) {
  const [error, setError] = useState<string | null>(null);
  return (
    <div className="relative border-2 border-dashed border-gray-300 rounded-xl p-6 text-center">
      <input
        type="file"
        accept=".csv,.xlsx,.xls,.pdf,.doc,.docx,image/*"
        multiple
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        onChange={(e) => {
          const files = e.target.files ? Array.from(e.target.files) : [];
          if (files.length === 0) return;
          if (files.length > 5) {
            setError("Please select no more than 5 files.");
            onFiles([]);
            return;
          }
          setError(null);
          onFiles(files);
        }}
      />
      <p className="text-gray-600 font-medium">
        <span className="text-blue-600 underline">Choose files</span> or drag &
        drop
      </p>
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </div>
  );
}
