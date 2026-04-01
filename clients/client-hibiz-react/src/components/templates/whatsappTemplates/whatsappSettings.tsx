import useBusinessData from '@/components/store/useBusinessData';
import { apiRpc } from '@hi/common';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { memo, useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { BsCameraVideo, BsTelephone } from 'react-icons/bs';
import { FaBatteryFull, FaSignal, FaWifi } from 'react-icons/fa';
import { FiChevronLeft, FiExternalLink } from 'react-icons/fi';
import whatzAppDoodle from '@/assets/whatzapp/whatsappdoodle.jpg';
import Hi from '@/assets/svg/hi.svg';

const MemoWhatsappSettings = () => {
  const businessData = useBusinessData((s) => s.businessData);
  const businessId = businessData?._id;
  const queryClient = useQueryClient();

  const [tableQrCustomMessage, setTableQrCustomMessage] = useState('');
  const [tableQrCustomUrlText, setTableQrCustomUrlText] = useState('');
  const [tableQrCustomUrl, setTableQrCustomUrl] = useState('');
  const [urlOption, setUrlOption] = useState<'EXPLORE' | 'CUSTOM'>('EXPLORE');

  const { data: whatsappConfig, isLoading } = useQuery({
    queryKey: ['whatsapp_config', businessId],
    queryFn: async () => {
      const res = await apiRpc.whatsapp.whatsapp_config[':businessId'].$get({
        param: { businessId: businessId || '' },
      });
      const data = await res.json();
      return data.data;
    },
    enabled: !!businessId,
  });

  useEffect(() => {
    if (whatsappConfig) {
      setTableQrCustomMessage(whatsappConfig?.tableQrCustomMessage || '');
      setTableQrCustomUrlText(whatsappConfig?.tableQrCustomUrlText || '');
      setTableQrCustomUrl(whatsappConfig?.tableQrCustomUrl || '');
      setUrlOption(whatsappConfig?.tableQrCustomUrl ? 'CUSTOM' : 'EXPLORE');
    }
  }, [whatsappConfig]);

  const updateConfigMutation = useMutation({
    mutationFn: async () => {
      if (!businessId) return;
      const res = await apiRpc.whatsapp.patch_whatsapp_config[':businessId'].$patch({
        param: { businessId: businessId || '' },
        json: {
          tableQrCustomMessage,
          tableQrCustomUrlText,
          tableQrCustomUrl,
        },
      });
      
      const payload = await res.json();
      if (payload.err) {
        throw new Error(payload.message || 'Error updating config');
      }
      return payload.data;
    },
    onSuccess: () => {
      toast.success('Settings updated successfully!');
      queryClient.invalidateQueries({ queryKey: ['whatsapp_config', businessId] });
    },
    onError: (err: any) => {
      toast.error(err.message || 'Failed to update settings');
    },
  });

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    updateConfigMutation.mutate();
  };

  const parseWhatsappFormatting = (text: string) => {
    const parts: React.ReactNode[] = [];
    let key = 0;

    const regex = /(\*[^*]+\*|_[^_]+_|~[^~]+~|`[^`]+`)/g;
    const segments = text.split(regex);

    for (const segment of segments) {
      if (!segment) continue;

      if (/^\*[^*]+\*$/.test(segment)) {
        parts.push(
          <strong key={key++} className="font-semibold">
            {segment.slice(1, -1)}
          </strong>
        );
      } else if (/^_[^_]+_$/.test(segment)) {
        parts.push(
          <em key={key++} className="italic">
            {segment.slice(1, -1)}
          </em>
        );
      } else if (/^~[^~]+~$/.test(segment)) {
        parts.push(
          <span key={key++} className="line-through">
            {segment.slice(1, -1)}
          </span>
        );
      } else if (/^`[^`]+`$/.test(segment)) {
        parts.push(
          <code key={key++} className="rounded bg-gray-100 px-1 py-0.5 font-mono text-sm">
            {segment.slice(1, -1)}
          </code>
        );
      } else {
        parts.push(segment);
      }
    }

    return parts;
  };

  // derived preview logic
  const defaultMessage = `Welcome to {{business_name}}! 🥽✨\n\nThank you for exploring with us at {{table_name}}. We hope you are enjoying your immersive VR experience today!\n\nTo view your live bill or complete your payment and skip the wait, simply tap the button below. 👇`;
  const defaultUrlText = 'View Bill & Pay';

  const rawPreviewMessage = (tableQrCustomMessage || defaultMessage)
    .replace(/{{business_name}}/g, businessData?.name || 'Business Name')
    .replace(/{{table_name}}/g, 'Table 12');

  const previewUrlText = tableQrCustomUrlText || defaultUrlText;

  return (
    <div className="rounded-xl bg-white p-6 shadow-sm">
      <div className="mb-6">
        <h2 className="text-xl font-semibold">WhatsApp Settings</h2>
        <p className="text-sm text-gray-500">Manage your automated WhatsApp interactions and templates.</p>
      </div>

      {isLoading ? (
        <div className="flex h-40 items-center justify-center">
           <p className="text-gray-500">Loading settings...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          {/* Form Content - 7 columns */}
          <div className="lg:col-span-7 xl:col-span-8">
            <form onSubmit={handleSave} className="space-y-6">
              <div className="space-y-6 rounded-xl border border-gray-100 bg-[#FAFAFA] p-5 shadow-sm">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">Welcome Message Template Customization</h3>
                  <p className="text-sm text-gray-500 mt-1">
                    Customize the automated WhatsApp message sent immediately when a guest scans your QR code.
                  </p>
                </div>

                <div className="flex flex-col space-y-2">
                  <div className="flex items-baseline justify-between">
                    <label htmlFor="customMessage" className="font-semibold text-gray-700">Message Body</label>
                    <span className="text-xs text-gray-400">Placeholders: <b>{`{{business_name}}`}</b>, <b>{`{{table_name}}`}</b></span>
                  </div>
                  <textarea
                    id="customMessage"
                    rows={5}
                    className="rounded-lg border border-gray-200 p-3 text-sm shadow-sm transition-all focus:border-[#075E54] focus:outline-none focus:ring-1 focus:ring-[#075E54]"
                    placeholder="e.g. Welcome to {{business_name}}! 🥽✨&#10;&#10;To view your bill and skip the wait, please tap the button below."
                    value={tableQrCustomMessage}
                    onChange={(e) => setTableQrCustomMessage(e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                  <div className="flex flex-col space-y-2">
                    <label htmlFor="customUrlText" className="font-semibold text-gray-700">Button Name</label>
                    <input
                      id="customUrlText"
                      type="text"
                      maxLength={20}
                      className="rounded-lg border border-gray-200 p-3 text-sm shadow-sm transition-all focus:border-[#075E54] focus:outline-none focus:ring-1 focus:ring-[#075E54]"
                      placeholder="e.g. View Bill & Pay"
                      value={tableQrCustomUrlText}
                      onChange={(e) => setTableQrCustomUrlText(e.target.value)}
                    />
                    <div className="flex justify-between">
                      <span className="text-xs text-gray-400">Max 20 characters</span>
                      <span className="text-xs text-gray-400">{tableQrCustomUrlText.length}/20</span>
                    </div>
                  </div>

                  <div className="flex flex-col space-y-2">
                    <label htmlFor="urlOption" className="font-semibold text-gray-700">Button Link Action</label>
                    <select
                      id="urlOption"
                      className="rounded-lg border border-gray-200 p-3 text-sm shadow-sm bg-white transition-all focus:border-[#075E54] focus:outline-none focus:ring-1 focus:ring-[#075E54]"
                      value={urlOption}
                      onChange={(e) => {
                        const val = e.target.value as 'EXPLORE' | 'CUSTOM';
                        setUrlOption(val);
                        if (val === 'EXPLORE') {
                          setTableQrCustomUrl('');
                        }
                      }}
                    >
                      <option value="EXPLORE">Dynamic Explore Page</option>
                      <option value="CUSTOM">Custom Link</option>
                    </select>
                  </div>

                  {urlOption === 'EXPLORE' && (
                    <div className="md:col-span-2 pt-1 pb-2">
                      <p className="text-xs leading-relaxed text-gray-500 rounded-lg border border-[#075E54]/20 bg-[#075E54]/5 p-3">
                        <span className="font-medium text-[#075E54]">Note:</span> This option will automatically redirect the guest to their correct live table session based on the specific QR code they just scanned. No custom link setup is required.
                      </p>
                    </div>
                  )}

                  {urlOption === 'CUSTOM' && (
                    <div className="flex flex-col space-y-2 md:col-span-2">
                      <label htmlFor="customUrl" className="font-semibold text-gray-700">Custom Link URL</label>
                      <input
                        id="customUrl"
                        type="url"
                        className="rounded-lg border border-gray-200 p-3 text-sm shadow-sm transition-all focus:border-[#075E54] focus:outline-none focus:ring-1 focus:ring-[#075E54]"
                        placeholder="https://yourwebsite.com/menu"
                        value={tableQrCustomUrl}
                        onChange={(e) => setTableQrCustomUrl(e.target.value)}
                        required
                      />
                    </div>
                  )}
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={updateConfigMutation.isPending}
                    className="flex items-center justify-center rounded-lg bg-[#075E54] px-6 py-2.5 font-medium text-white shadow-md transition-colors hover:bg-[#064c44] disabled:opacity-70"
                  >
                    {updateConfigMutation.isPending ? 'Saving...' : 'Save Settings'}
                  </button>
                </div>
              </div>
            </form>
          </div>

          {/* Preview Panel - 5 columns */}
          <div className="lg:col-span-5 xl:col-span-4 flex justify-center">
            <div className="inter relative w-full max-w-[265px] rounded-[2rem] border-[8px] border-black shadow-[0_8px_25px_rgb(0,0,0,0.12)] md:max-h-[520px] sticky top-6">
              {/* iPhone Notch */}
              <div className="absolute inset-x-0 top-0 h-5 rounded-b-2xl">
                <div className="absolute left-1/2 top-1 h-3.5 w-[70px] -translate-x-1/2 rounded-full bg-black" />
              </div>
              {/* Status Bar */}
              <div className="flex items-center justify-between rounded-t-[1.3rem] bg-white px-3.5 py-1.5 pt-[8px] text-[11px] font-medium">
                <span>9:41</span>
                <div className="flex items-center gap-1">
                  <FaSignal className="text-[9px]" />
                  <FaWifi className="text-[10px]" />
                  <FaBatteryFull className="text-[12px]" />
                </div>
              </div>
              {/* Screen Content */}
              <div
                style={{
                  backgroundImage: `url(${whatzAppDoodle})`,
                  backgroundSize: 'cover',
                }}
                className="relative h-[475px] w-full overflow-y-auto rounded-b-[1.3rem]"
              >
                {/* WhatsApp Header */}
                <section className="relative flex items-center gap-2 bg-[#075E54] px-2.5 py-2 text-white shadow-sm">
                  <FiChevronLeft className="text-[20px]" />
                  <img src={Hi} alt="Hi" className="h-[30px] w-[30px] flex-shrink-0 rounded-full border border-white/20 bg-white" />
                  <div className="flex-1 overflow-hidden">
                    <p className="truncate text-sm font-semibold leading-tight">{businessData?.name || 'Business Name'}</p>
                    <p className="text-[10px] opacity-85">bot</p>
                  </div>
                  <article className="flex items-center gap-2.5 pl-1">
                    <BsCameraVideo className="text-[16px]" />
                    <BsTelephone className="text-[15px]" />
                  </article>
                </section>

                {/* Message Content */}
                <div className="m-3 mt-4 overflow-hidden rounded-xl rounded-tl-sm bg-white p-1.5 shadow-sm">
                  <div className="space-y-1.5 p-2 pt-1.5">
                    <p className="whitespace-pre-wrap break-words text-[13px] leading-[1.35] text-[#111B21]">
                      {parseWhatsappFormatting(rawPreviewMessage)}
                    </p>
                    <span className="float-right ml-3 inline-block text-[10px] text-[#667781]">12:00</span>
                    <div className="clear-both hidden"></div>
                  </div>

                  <div className="border-t border-gray-100 mt-1">
                    <button type="button" className="flex w-full items-center justify-center py-2 text-[14px] font-medium text-[#34B7F1]">
                      <FiExternalLink className="mr-2" size={15} />
                      {previewUrlText}
                    </button>
                  </div>
                </div>

                {/* iPhone Home Indicator */}
                <div className="absolute bottom-1.5 left-1/2 h-1 w-[35%] -translate-x-1/2 rounded-full bg-black/40" />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const WhatsappSettings = memo(MemoWhatsappSettings);
export default WhatsappSettings;
