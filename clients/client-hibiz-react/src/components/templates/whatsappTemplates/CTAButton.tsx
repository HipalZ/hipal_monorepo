import { normalizeInput } from '@/components/helpers/whatzAppHelpers';
import { API_URL } from '@/configs';
import useBusinessData from '@/components/store/useBusinessData';
import { ActionType } from '@/components/store/useWhatsapp';
import { memo } from 'react';
import { BiX } from 'react-icons/bi';

interface Props {
  index: number;
  title: string;

  actionType: ActionType;

  text: string;
  setText: (v: string) => void;

  url: string;
  setUrl: (v: string) => void;

  phone: string;
  setPhone: (v: string) => void;

  onRemove: () => void;
}

const CTAButton = memo(({ title, actionType, text, setText, url, setUrl, phone, setPhone, onRemove }: Props) => {
  const outLetType = useBusinessData((s) => s.outletInfo?.outLetType);
  const normalizedApiUrl = API_URL?.replace(/\/$/, '') || '';
  const hotelRoomButtonUrl = `${normalizedApiUrl}/surl/r/{{1}}`;

  return (
    <div className="relative space-y-4 rounded-md border p-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-bold">{title}</h2>
        <button type="button" onClick={onRemove} className="text-gray-500 hover:text-red-500">
          <BiX size={20} />
        </button>
      </div>

      {/* Select Action */}
      <div>
        <label className="mb-1 block text-sm font-medium">
          Type of Action: <b> {actionType}</b>
        </label>
      </div>

      {/* Button text */}
      <div>
        <label className="mb-1 block text-sm font-medium">Button Text</label>
        <input
          value={text}
          maxLength={25}
          onChange={(e) => setText(normalizeInput(e.target.value))}
          className="w-full rounded-md border p-2 text-sm"
          placeholder="Write button name"
        />
      </div>

      {/* URL */}
      {actionType === ActionType.VisitWebsite && (
        <div>
          <div className="mb-1 flex items-center justify-between gap-2">
            <label className="block text-sm font-medium">Website URL</label>
            {outLetType === 'HOTEL' && normalizedApiUrl && (
              <button
                type="button"
                className="rounded-md border border-blue-200 bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 hover:bg-blue-100"
                onClick={() => {
                  setUrl(hotelRoomButtonUrl);
                  if (!text) setText('Open hotel services');
                }}
              >
                Use hotel room link
              </button>
            )}
          </div>
          <input type="text" value={url} onChange={(e) => setUrl(normalizeInput(e.target.value))} className="w-full rounded-md border p-2 text-sm" />
          {url.includes('{{') && (
            <p className="mt-1 text-xs text-gray-500">
              Dynamic URL button detected. Hibiz will let you map this button to the room link after Meta approval.
            </p>
          )}
        </div>
      )}

      {/* Phone */}
      {actionType === ActionType.CallUs && (
        <div>
          <label className="mb-1 block text-sm font-medium">Phone Number</label>
          <div className="flex">
            <span className="rounded-l-md border border-r-0 bg-gray-50 px-3 py-2">+91</span>
            <input
              value={phone}
              type="tel"
              maxLength={15}
              onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
              className="w-full rounded-r-md border p-2 text-sm"
            />
          </div>
        </div>
      )}
    </div>
  );
});

export default CTAButton;
