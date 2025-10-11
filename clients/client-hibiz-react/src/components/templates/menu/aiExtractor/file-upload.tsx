interface FileUploadProps {
  files: File[];
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export function FileUpload({ files, onFileChange }: FileUploadProps) {
  return (
    <div className="relative border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-blue-500 transition-all duration-300 mb-6">
      <input
        type="file"
        accept="image/png, image/jpeg, image/jpg"
        multiple
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        onChange={onFileChange}
      />
      <div className="flex flex-col items-center justify-center pointer-events-none">
        <svg
          className="w-10 h-10 text-gray-400 mb-3"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M7 16a4 4 0 01-4-4v-1a4 4 0 014-4h10a4 4 0 014 4v1a4 4 0 01-4 4H7zM15 12h.01M19 12h.01M5 12h.01M9 12h.01"
          />
        </svg>
        <p className="text-gray-600 font-medium">
          <span className="text-blue-600 underline">Choose file(s)</span> or
          drag them here
        </p>
        {files.length > 0 && (
          <ul className="mt-3 text-sm text-gray-500 list-disc list-inside">
            {files.map((f) => (
              <li key={f.name}>{f.name}</li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
