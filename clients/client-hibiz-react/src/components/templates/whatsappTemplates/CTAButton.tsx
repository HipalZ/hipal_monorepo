import { normalizeInput } from '@/components/helpers/whatzAppHelpers';
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
          <label className="mb-1 block text-sm font-medium">Website URL</label>
          <input type="url" value={url} onChange={(e) => setUrl(normalizeInput(e.target.value))} className="w-full rounded-md border p-2 text-sm" />
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
