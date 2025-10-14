import { useBulkUploadContacts } from '@/components/helpers/whatzAppHelpers';
import { useMessageRecipientsStore } from '@/components/store/useMessageRecipientsStore';
import { Button } from '@/components/ui/button';
import { CloudDownload, Upload, X } from 'lucide-react';
import { useRef, useState } from 'react';

type Props = {
  setShowConfirmPopup: (value: boolean) => void;
  setUploadPreview: (value: { name: string; phone: string; dob?: number }[]) => void;
};

const BulkUpload = ({ setShowConfirmPopup, setUploadPreview }: Props) => {
  const { mutate: uploadContacts } = useBulkUploadContacts();
  const bulkCustomers = useMessageRecipientsStore((s) => s.bulkCustomers);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);

    try {
      await uploadContacts(file);
      setUploadPreview(bulkCustomers || []);
      setShowConfirmPopup(true);
    } catch (error) {
      console.error('Upload error:', error);
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <section className="mb-6 flex flex-col justify-between gap-6 rounded-xl border bg-white p-6 shadow md:flex-row md:items-center md:gap-0">
      {/* LEFT: Description */}
      <article className="md:w-1/2">
        <h2 className="mb-2 text-lg font-semibold text-[#6F649B]">Bulk Upload Customers</h2>
        <p className="text-sm text-gray-500">Download the sample format, fill in your customer details, and upload the CSV file.</p>
      </article>

      {/* RIGHT: Buttons + File Info */}
      <article className="flex flex-wrap items-center justify-start gap-3 md:w-1/2 md:justify-end">
        <Button
          variant="outline"
          title="Download Sample Template"
          onClick={() => {
            const link = document.createElement('a');
            link.href = '/sample-customer.csv';
            link.download = 'sample-customer.csv';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
          }}
        >
          <CloudDownload className="mr-2 h-4 w-4" />
          Download Sample Template
        </Button>

        {!selectedFile ? (
          <>
            <Button title="Upload Customers Data" variant="outline" onClick={() => fileInputRef.current?.click()}>
              <Upload className="mr-2 h-4 w-4" />
              Upload Customers Data
            </Button>
            <input type="file" accept=".xls,.xlsx,.csv" ref={fileInputRef} onChange={handleFileUpload} className="hidden" />
          </>
        ) : (
          <div className="flex items-center gap-2 rounded-full border border-gray-300 bg-gray-50 px-4 py-1.5 text-sm shadow-sm">
            <span className="max-w-[10rem] truncate text-gray-700">{selectedFile.name}</span>
            <button
              type="button"
              onClick={handleRemoveFile}
              className="flex items-center justify-center rounded-full bg-red-100 p-1 text-red-600 hover:bg-red-200"
              title="Remove file"
            >
              <X size={14} />
            </button>
          </div>
        )}
      </article>
    </section>
  );
};

export default BulkUpload;
