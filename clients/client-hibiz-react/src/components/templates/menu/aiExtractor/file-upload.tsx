import { FileImage, FileSpreadsheet, FileText, FileType, X } from 'lucide-react';
import * as React from 'react';

type FileUploadProps = {
  files: File[];
  // keep your existing handler for <input> changes
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  // new: remove by index
  onRemoveFile: (index: number) => void;
  // new: optional drop handler (recommended for DnD)
  onDropFiles?: (files: File[]) => void;
  maxFiles?: number;
};

export function FileUpload({ files, onFileChange, onRemoveFile, onDropFiles, maxFiles = 3 }: FileUploadProps) {
  const [isDragging, setIsDragging] = React.useState(false);

  const onDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };
  const onDragLeave = () => setIsDragging(false);

  const onDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const dropped = Array.from(e.dataTransfer.files || []);
    if (!dropped.length) return;

    // ✅ Filter out Excel files (.xlsx / .xls)
    const filtered = dropped.filter(
      (f) => !f.name.toLowerCase().endsWith('.xlsx') && !f.name.toLowerCase().endsWith('.xls') && !f.type.includes('spreadsheetml'),
    );

    if (filtered.length === 0) {
      alert('Excel files (.xlsx, .xls) are not supported. Please upload images, PDFs, or CSV files only.');
      return;
    }

    // pass filtered files to parent
    onDropFiles?.(filtered);
  };

  const accept = 'image/*,.pdf,.csv,application/vnd.ms-excel,text/csv';

  const fileBadge = (f: File) => {
    const t = f.type.toLowerCase();
    const name = f.name.toLowerCase();
    const isImg = t.startsWith('image/');
    const isPdf = t === 'application/pdf' || name.endsWith('.pdf');
    const isCsv = t === 'text/csv' || name.endsWith('.csv');

    if (isImg) return { kind: 'image' as const, Icon: FileImage, tint: 'text-blue-600' };
    if (isPdf) return { kind: 'pdf' as const, Icon: FileText, tint: 'text-rose-600' };
    if (isCsv) return { kind: 'sheet' as const, Icon: FileSpreadsheet, tint: 'text-emerald-600' };
    return { kind: 'other' as const, Icon: FileType, tint: 'text-slate-600' };
  };

  // create object URLs for image previews
  const imagePreviews = React.useMemo(() => files.map((f) => (f.type.startsWith('image/') ? URL.createObjectURL(f) : null)), [files]);

  React.useEffect(() => {
    // revoke all on unmount or when files change
    return () => {
      imagePreviews.forEach((u) => u && URL.revokeObjectURL(u));
    };
  }, [imagePreviews]);

  const remaining = Math.max(0, maxFiles - files.length);

  return (
    <div
      className={[
        'relative mb-6 rounded-xl p-6 text-center transition-all duration-300',
        'border-2 border-dashed',
        isDragging ? 'border-blue-500 bg-blue-50/40' : 'border-gray-300 hover:border-blue-500',
      ].join(' ')}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
    >
      <input type="file" accept={accept} multiple className="absolute inset-0 h-full w-full cursor-pointer opacity-0" onChange={onFileChange} />

      <div className="pointer-events-none flex flex-col items-center justify-center">
        <svg className="mb-3 h-10 w-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M7 16a4 4 0 01-4-4v-1a4 4 0 014-4h10a4 4 0 014 4v1a4 4 0 01-4 4H7zM15 12h.01M19 12h.01M5 12h.01M9 12h.01"
          />
        </svg>

        <p className="font-medium text-gray-600">
          <span className="text-blue-600 underline decoration-blue-600 decoration-2">Choose file(s)</span> or drag them here
        </p>

        <p className="mt-1 text-xs text-gray-500">
          Images (any), PDF, CSV • up to {maxFiles} files
          {remaining < maxFiles ? ` • ${remaining} left` : ''}
        </p>
      </div>

      {/* Preview grid */}
      {files.length > 0 && (
        <div className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
          {files.map((f, idx) => {
            const badge = fileBadge(f);
            const previewUrl = imagePreviews[idx];
            return (
              <div key={f.name + idx} className="group relative overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm" title={f.name}>
                {/* remove button */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onRemoveFile(idx);
                  }}
                  className="absolute right-1 top-1 z-10 rounded-full bg-black/60 p-1 text-white opacity-0 transition-opacity group-hover:opacity-100"
                >
                  <X className="h-4 w-4" />
                </button>

                {/* preview */}
                {previewUrl ? (
                  <img src={previewUrl} alt={f.name} className="h-28 w-full object-cover" loading="lazy" />
                ) : (
                  <div className="flex h-28 w-full items-center justify-center bg-slate-50">
                    <badge.Icon className={`h-8 w-8 ${badge.tint}`} />
                  </div>
                )}

                {/* meta */}
                <div className="border-t px-3 py-2">
                  <div className="line-clamp-1 text-xs font-medium text-slate-800">{f.name}</div>
                  <div className="mt-0.5 flex items-center justify-between">
                    <span className="text-[10px] uppercase text-slate-500">{f.type || f.name.split('.').pop() || 'file'}</span>
                    <span className="text-[10px] text-slate-500">{(f.size / 1024).toFixed(0)} KB</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
      {files.length > 0 && (
        <p className="text-poppins text-secondary mt-4 text-lg font-semibold">
          🌱 Even AI has its off days — double-check your extracted dishes for the best accuracy.
        </p>
      )}
    </div>
  );
}
