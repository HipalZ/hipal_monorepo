import useWhatsapp, { HeaderInterface } from '@/components/store/useWhatsapp';
import { cn, storeImageAfterSave } from '@/components/utils/helper';
import { type ChangeEvent, memo, useCallback, useRef } from 'react';
import toast from 'react-hot-toast';
import { BiFile, BiMusic, BiPlus, BiVideo, BiX } from 'react-icons/bi';

const MemoMediaContent = () => {
  const headerType = useWhatsapp((s) => s.headerType);
  const setHeaderType = useWhatsapp((s) => s.setHeaderType);
  const imagePreview = useWhatsapp((s) => s.imagePreview);
  const setImageFiles = useWhatsapp((s) => s.setImageFiles);
  const setImagePreview = useWhatsapp((s) => s.setImagePreview);
  const templateMediaRef = useRef<HTMLInputElement | null>(null);
  const handleFileChange = useCallback(
    async (event: ChangeEvent<HTMLInputElement>) => {
      const file = event?.target?.files?.[0];
      if (!file) return;
      setImageFiles(file);
      const maxSizeInBytes = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSizeInBytes) {
        toast.error('File size exceeds 5MB. Please select a smaller file.');
        return;
      }

      const type = file.type;
      if (type.startsWith('image/')) setHeaderType(HeaderInterface.Image);
      else if (type.startsWith('video/')) setHeaderType(HeaderInterface.Video);
      else if (type.startsWith('audio/')) setHeaderType(HeaderInterface.Audio);
      else setHeaderType(HeaderInterface.Document);

      // Read file for preview
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onloadend = async () => {
        const base64 = reader.result as string;

        // Show preview immediately
        setImagePreview(base64);

        // Immediately upload the image
        const uploadedUrl = await storeImageAfterSave(file, base64);

        if (uploadedUrl) {
          // Store final URL in state
          setImagePreview(uploadedUrl);
        }
      };
    },
    [setHeaderType, setImageFiles, setImagePreview],
  );

  const handleRemoveFile = useCallback(() => {
    setImagePreview('');
    setHeaderType(HeaderInterface.None);
  }, [setImagePreview, setHeaderType]);

  return (
    <div>
      <label htmlFor="headerFile" className="mb-2 block text-base font-semibold text-gray-800">
        Choose Media (Video, Audio, Document, or Image)
      </label>

      <div
        className={cn(
          'relative mb-4 h-40 w-40 rounded-lg bg-white transition-all duration-300',
          imagePreview ? 'shadow-md hover:shadow-lg' : 'border-2 border-dashed border-gray-300 hover:border-blue-400',
        )}
      >
        {!imagePreview && (
          <input
            ref={templateMediaRef}
            type="file"
            id="headerFile"
            className="absolute inset-0 z-10 h-full w-full cursor-pointer opacity-0"
            accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.xls,.xlsx"
            onChange={handleFileChange}
          />
        )}

        {imagePreview ? (
          <div className="relative h-full w-full rounded-lg">
            {headerType === HeaderInterface.Image && (
              <img src={imagePreview} alt="Header Preview" className="h-full w-full rounded-lg object-cover" />
            )}

            {headerType === HeaderInterface.Video && (
              <video src={imagePreview} controls loop autoPlay muted playsInline className="h-full w-full rounded-lg object-cover" />
            )}

            {headerType === HeaderInterface.Document && <iframe src={imagePreview} title="Document Preview" className="h-full w-full rounded-lg" />}

            {headerType === HeaderInterface.Audio && (
              <div className="flex h-full w-full items-center justify-center rounded-lg bg-gray-50">
                <audio src={imagePreview} controls className="w-11/12" />
              </div>
            )}

            <button
              type="button"
              className="absolute -right-3 -top-3 m-2 rounded-full bg-red-700 p-1 text-white shadow-md"
              onClick={handleRemoveFile}
            >
              <BiX className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <BiPlus className="h-12 w-12 text-gray-400" />
            <p className="mt-2 text-sm text-gray-500">Click to upload a file</p>
            <div className="mt-2 flex gap-3 text-xs text-gray-400">
              <BiVideo /> <BiMusic /> <BiFile />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const MediaContent = memo(MemoMediaContent);
export default MediaContent;
