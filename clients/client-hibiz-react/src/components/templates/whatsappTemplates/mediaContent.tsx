import useWhatsapp, { HeaderInterface } from '@/components/store/useWhatsapp';
import { cn, storeImageAfterSave } from '@/components/utils/helper';
import { type ChangeEvent, memo, useCallback, useRef } from 'react';
import toast from 'react-hot-toast';
import { BiFile, BiMusic, BiPlus, BiVideo, BiX } from 'react-icons/bi';

// Frontend pre-flight caps. Kept generous on purpose — Meta has its own
// per-type limits and will surface a clean error via the templateError popup
// if exceeded server-side. Frontend just protects against accidentally huge
// picks (1 GB videos etc.).
//   - IMAGE: 10 MB (Meta's hard cap is 5 MB; over that comes back as a Meta error)
//   - VIDEO: 16 MB (Meta limit)
//   - AUDIO: 16 MB (Meta limit)
//   - DOCUMENT: 100 MB (Meta limit)
const MAX_MEDIA_BYTES: Record<string, number> = {
  IMAGE: 10 * 1024 * 1024,      // 10 MB
  VIDEO: 16 * 1024 * 1024,      // 16 MB
  AUDIO: 16 * 1024 * 1024,      // 16 MB
  DOCUMENT: 100 * 1024 * 1024,  // 100 MB
};

const MemoMediaContent = () => {
  const headerType = useWhatsapp((s) => s.headerType);
  const setHeaderType = useWhatsapp((s) => s.setHeaderType);
  const imagePreview = useWhatsapp((s) => s.imagePreview);
  const setImageFiles = useWhatsapp((s) => s.setImageFiles);
  const setImagePreview = useWhatsapp((s) => s.setImagePreview);
  const setTemplateError = useWhatsapp((s) => s.setTemplateError);
  const templateMediaRef = useRef<HTMLInputElement | null>(null);

  const handleFileChange = useCallback(
    async (event: ChangeEvent<HTMLInputElement>) => {
      const file = event?.target?.files?.[0];
      if (!file) return;

      // Detect category from MIME first so we can apply the right size cap.
      const type = file.type;
      let detected: HeaderInterface;
      if (type.startsWith('image/')) detected = HeaderInterface.Image;
      else if (type.startsWith('video/')) detected = HeaderInterface.Video;
      else if (type.startsWith('audio/')) detected = HeaderInterface.Audio;
      else detected = HeaderInterface.Document;

      const limit = MAX_MEDIA_BYTES[detected] ?? MAX_MEDIA_BYTES.IMAGE;
      if (file.size > limit) {
        const mb = (file.size / 1024 / 1024).toFixed(1);
        const limitMb = (limit / 1024 / 1024).toFixed(0);
        setTemplateError(
          `This ${detected.toLowerCase()} is ${mb} MB — over the ${limitMb} MB limit for ${detected.toLowerCase()}s. Please pick a smaller file.`,
        );
        // Reset the input so the same file can be re-picked after fixing it.
        if (templateMediaRef.current) templateMediaRef.current.value = '';
        return;
      }

      // Store the real File for uploadMedia() to consume at save-time. This is
      // memory-only (excluded from persist) so no JSON-serialization issue.
      setImageFiles(file);
      setHeaderType(detected);

      // Local preview = a blob URL pointing into memory. Tiny token string,
      // not a multi-MB base64. Revoke any previous one to avoid leaks.
      if (imagePreview && imagePreview.startsWith('blob:')) {
        try {
          URL.revokeObjectURL(imagePreview);
        } catch {}
      }
      const blobUrl = URL.createObjectURL(file);
      setImagePreview(blobUrl);

      // Kick off the background storage upload. `storeImageAfterSave` needs a
      // base64 data URL (it parses it back to a Blob internally), so we read
      // the file once locally — but DO NOT put the base64 into state. The
      // base64 string is GC'd after this function returns. When the upload
      // resolves we swap the blob URL for the canonical HTTPS URL.
      const reader = new FileReader();
      reader.onloadend = async () => {
        try {
          const base64 = reader.result as string;
          const uploadedUrl = await storeImageAfterSave(file, base64);
          if (uploadedUrl) {
            try {
              URL.revokeObjectURL(blobUrl);
            } catch {}
            setImagePreview(uploadedUrl);
          }
        } catch (err: any) {
          setTemplateError(err?.message || 'Media upload failed. Please try again.');
        }
      };
      reader.onerror = () => {
        setTemplateError('Could not read the selected file.');
      };
      reader.readAsDataURL(file);
    },
    [setHeaderType, setImageFiles, setImagePreview, setTemplateError, imagePreview],
  );

  const handleRemoveFile = useCallback(() => {
    if (imagePreview && imagePreview.startsWith('blob:')) {
      try {
        URL.revokeObjectURL(imagePreview);
      } catch {}
    }
    setImagePreview('');
    setImageFiles(null);
    setHeaderType(HeaderInterface.None);
  }, [imagePreview, setImagePreview, setImageFiles, setHeaderType]);

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
