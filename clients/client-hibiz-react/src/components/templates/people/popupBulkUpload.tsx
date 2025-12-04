import LoadingSpinner from '@/components/atom/loadingSpinner';
import PopUp from '@/components/atom/popUp';
import useBusinessData from '@/components/store/useBusinessData';
import { Button } from '@/components/ui/button';
import { formatDate } from '@/components/utils/helper';
import { useUploadCustomers } from '@/hooks/useHipeople';

type Props = {
  showConfirmPopup: boolean;
  setShowConfirmPopup: (value: boolean) => void;
  uploadPreview: { name: string; phone: string; dob?: number }[];
};
type Payload = {
  businessId?: string;
  users: { name: string; phone: string; dob?: number }[];
};

const PopupBulkUpload = (props: Props) => {
  const businessId = useBusinessData((s) => s.outletInfo?.businessId);
  const { mutate: executeBulkUploadContacts, isPending } = useUploadCustomers();

  const { showConfirmPopup, setShowConfirmPopup, uploadPreview } = props;
  const handleConfirmUpload = async () => {
    if (!uploadPreview.length) return;
    const payload: Payload = {
      businessId,
      users: uploadPreview.map(({ name, phone, dob }) => {
        const dobNum = Number(dob);
        return {
          name,
          phone,
          ...(dob && dobNum !== 0 ? { dob: dobNum } : {}),
        };
      }),
    };
    await executeBulkUploadContacts(payload);
    setShowConfirmPopup(false);
  };

  if (isPending) return <LoadingSpinner />;

  return (
    <PopUp show={showConfirmPopup} onClose={() => setShowConfirmPopup(false)} rightTopBack width="w-full max-w-md" height="h-auto" hide>
      <div className="space-y-4 p-4">
        <h2 className="text-lg font-semibold">Confirm Upload</h2>
        <p className="text-sm text-gray-600">
          You’re about to upload <b>{uploadPreview.length}</b> customers.
        </p>

        <div className="max-h-60 overflow-y-auto rounded-md border bg-gray-50 p-2">
          {uploadPreview.slice(0, 5).map((u, i) => (
            <div key={i} className="flex justify-between border-b py-1 text-sm">
              <span>{u.name}</span>
              <span>{u.phone}</span>
              {u.dob && <span>{formatDate(u.dob)}</span>}
            </div>
          ))}
          {uploadPreview.length > 5 && <p className="mt-1 text-xs text-gray-500">...and {uploadPreview.length - 5} more</p>}
        </div>

        <div className="mt-4 flex gap-2">
          <Button variant="outline" className="w-1/2" onClick={() => setShowConfirmPopup(false)}>
            Cancel
          </Button>
          <Button className="w-1/2 bg-purple-600 text-white" onClick={handleConfirmUpload}>
            Confirm Upload
          </Button>
        </div>
      </div>
    </PopUp>
  );
};

export default PopupBulkUpload;
