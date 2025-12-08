import { normalizeInput } from "@/components/helpers/whatzAppHelpers";
import { ActionType } from "@/components/store/useWhatsapp";
import { memo } from "react";
import { BiChevronDown, BiX } from "react-icons/bi";

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

const CTAButton = memo(
  ({
    title,
    actionType,
    text,
    setText,
    url,
    setUrl,
    phone,
    setPhone,
    onRemove,
  }: Props) => {
    return (
      <div className="border rounded-md p-4 space-y-4 relative">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 className="font-bold text-sm">{title}</h2>
          <button type="button" onClick={onRemove} className="text-gray-500 hover:text-red-500">
            <BiX size={20} />
          </button>
        </div>

        {/* Select Action */}
        <div>
          <label className="block mb-1 text-sm font-medium">Type of Action</label>
          <div className="relative">
            <p
              className="w-full border rounded-md py-2 px-3 text-sm bg-gray-50">
                {actionType}
            </p>
          </div>
        </div>

        {/* Button text */}
        <div>
          <label className="block mb-1 text-sm font-medium">Button Text</label>
          <input
            value={text}
            maxLength={25}
            onChange={(e) => setText(normalizeInput(e.target.value))}
            className="w-full border rounded-md p-2 text-sm"
            placeholder="Write button name"
          />
        </div>

        {/* URL */}
        {actionType === ActionType.VisitWebsite && (
          <div>
            <label className="block mb-1 text-sm font-medium">Website URL</label>
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(normalizeInput(e.target.value))}
              className="w-full border rounded-md p-2 text-sm"
            />
          </div>
        )}

        {/* Phone */}
        {actionType === ActionType.CallUs && (
          <div>
            <label className="block mb-1 text-sm font-medium">Phone Number</label>
            <div className="flex">
              <span className="px-3 py-2 border border-r-0 rounded-l-md bg-gray-50">+91</span>
              <input
                value={phone}
                type="tel"
                maxLength={15}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
                className="w-full border rounded-r-md p-2 text-sm"
              />
            </div>
          </div>
        )}
      </div>
    );
  }
);

export default CTAButton;
