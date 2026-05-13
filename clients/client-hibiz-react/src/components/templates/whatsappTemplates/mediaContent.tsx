import axios from '@/axios';
import useBusinessData from '@/components/store/useBusinessData';
import useWhatsapp, { HeaderInterface } from '@/components/store/useWhatsapp';
import { cn } from '@/components/utils/helper';
import { type ChangeEvent, memo, useCallback, useRef, useState } from 'react';
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
  IMAGE: 10 * 1024 * 1024, // 10 MB
  VIDEO: 10 * 1024 * 1024, // 16 MB
  AUDIO: 10 * 1024 * 1024, // 16 MB
  DOCUMENT: 10 * 1024 * 1024, // 100 MB
};

// Unique key for a file based on its content-identifying attributes. If the
// user picks the same file twice, both fingerprints match and we skip the
// network upload entirely.
const fingerprintFor = (f: File) => `${f.name}|${f.size}|${f.lastModified}`;

const MemoMediaContent = () => {
  const headerType = useWhatsapp((s) => s.headerType);
  const setHeaderType = useWhatsapp((s) => s.setHeaderType);
  const imagePreview = useWhatsapp((s) => s.imagePreview);
  const setImageFiles = useWhatsapp((s) => s.setImageFiles);
  const setImagePreview = useWhatsapp((s) => s.setImagePreview);
  const setMediaHandle = useWhatsapp((s) => s.setMediaHandle);
  const setMediaFingerprint = useWhatsapp((s) => s.setMediaFingerprint);
  const setTemplateError = useWhatsapp((s) => s.setTemplateError);
  const businessId = useBusinessData((s) => s.businessData?._id);
  const templateMediaRef = useRef<HTMLInputElement | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  // 0 → 100. Up to 95% reflects the actual browser→backend upload progress.
  // Beyond 95% means "backend is fanning out to storage + Meta" — we tick the
  // bar up artificially so the user sees motion until the response lands.
  const [progress, setProgress] = useState(0);

  const handleFileChange = useCallback(
    async (event: ChangeEvent<HTMLInputElement>) => {
      const file = event?.target?.files?.[0];
      if (!file) return;
      if (!businessId) {
        setTemplateError('Business context not loaded yet. Please try again in a moment.');
        return;
      }

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
        if (templateMediaRef.current) templateMediaRef.current.value = '';
        return;
      }

      // In-session same-file guard ONLY (protects against accidental
      // double-clicks of the file picker). The cache is wiped on × and on
      // page reload, so this never silently reuses a stale handle across
      // explicit user actions.
      const fingerprint = fingerprintFor(file);
      const cachedFp = useWhatsapp.getState().mediaFingerprint;
      const cachedHandle = useWhatsapp.getState().mediaHandle;
      if (fingerprint === cachedFp && cachedHandle) {
        setImageFiles(file);
        setHeaderType(detected);
        return;
      }

      // Different file (or no cache): keep the File, render blob preview, upload.
      setImageFiles(file);
      setHeaderType(detected);

      if (imagePreview && imagePreview.startsWith('blob:')) {
        try {
          URL.revokeObjectURL(imagePreview);
        } catch {}
      }
      const blobUrl = URL.createObjectURL(file);
      setImagePreview(blobUrl);

      // SINGLE upload — backend fans out to storage + Meta in parallel.
      setIsUploading(true);
      setProgress(0);
      // Slow "thinking" tick once browser→backend transfer is done; gives the
      // user visible motion while backend talks to storage + Meta in parallel.
      let thinkingTimer: ReturnType<typeof setInterval> | null = null;
      try {
        const formData = new FormData();
        formData.append('file', file);
        const res = await axios.post(`/whatsapp/media-upload/${businessId}`, formData, {
          maxBodyLength: Number.POSITIVE_INFINITY,
          maxContentLength: Number.POSITIVE_INFINITY,
          onUploadProgress: (e) => {
            if (e.total) {
              // Cap actual transfer at 90% so there's room for the server-side
              // fan-out phase before we reach 100%.
              const pct = Math.min(90, Math.round((e.loaded / e.total) * 90));
              setProgress(pct);
              if (pct >= 90 && !thinkingTimer) {
                thinkingTimer = setInterval(() => {
                  setProgress((p) => (p < 95 ? p + 1 : p));
                }, 400);
              }
            }
          },
        });
        if (thinkingTimer) clearInterval(thinkingTimer);
        const { url, handle } = res.data?.data ?? {};
        if (!handle) {
          throw new Error(res.data?.message || 'Server did not return a media handle.');
        }
        setMediaHandle(handle);
        setMediaFingerprint(fingerprint);
        if (url) {
          try {
            URL.revokeObjectURL(blobUrl);
          } catch {}
          setImagePreview(url);
        }
        setProgress(100);
        // Brief 100% flash before clearing the overlay.
        setTimeout(() => setIsUploading(false), 400);
      } catch (err: any) {
        if (thinkingTimer) clearInterval(thinkingTimer);
        setIsUploading(false);
        setProgress(0);
        setMediaHandle('');
        setMediaFingerprint('');
        const msg = err?.response?.data?.message || err?.message || 'Media upload failed. Please try again.';
        setTemplateError(msg);
      }
    },
    [
      businessId,
      setHeaderType,
      setImageFiles,
      setImagePreview,
      setMediaHandle,
      setMediaFingerprint,
      setTemplateError,
      imagePreview,
    ],
  );

  // × fully resets the media slot. We don't try to cache across removals
  // because filenames can collide while contents differ — safer to always
  // re-upload when the user explicitly removes and re-picks.
  const handleRemoveFile = useCallback(() => {
    if (imagePreview && imagePreview.startsWith('blob:')) {
      try {
        URL.revokeObjectURL(imagePreview);
      } catch {}
    }
    setImagePreview('');
    setImageFiles(null);
    setMediaHandle('');
    setMediaFingerprint('');
    setHeaderType(HeaderInterface.None);
    if (templateMediaRef.current) templateMediaRef.current.value = '';
  }, [imagePreview, setImagePreview, setImageFiles, setMediaHandle, setMediaFingerprint, setHeaderType]);

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

            {/* Upload progress overlay */}
            {isUploading && (
              <div className="absolute inset-0 z-20 flex flex-col items-center justify-center rounded-lg bg-gradient-to-br from-slate-900/85 to-blue-900/85 backdrop-blur-sm">
                <div className="relative">
                  <svg className="h-16 w-16 -rotate-90" viewBox="0 0 64 64">
                    <circle
                      cx="32"
                      cy="32"
                      r="28"
                      fill="none"
                      stroke="rgba(255,255,255,0.18)"
                      strokeWidth="4"
                    />
                    <circle
                      cx="32"
                      cy="32"
                      r="28"
                      fill="none"
                      stroke="url(#mediaGrad)"
                      strokeWidth="4"
                      strokeLinecap="round"
                      strokeDasharray={2 * Math.PI * 28}
                      strokeDashoffset={2 * Math.PI * 28 * (1 - progress / 100)}
                      style={{ transition: 'stroke-dashoffset 200ms linear' }}
                    />
                    <defs>
                      <linearGradient id="mediaGrad" x1="0" y1="0" x2="1" y2="1">
                        <stop offset="0%" stopColor="#60a5fa" />
                        <stop offset="100%" stopColor="#22d3ee" />
                      </linearGradient>
                    </defs>
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center text-sm font-semibold text-white">
                    {progress}%
                  </div>
                </div>
                <div className="mt-2 text-[11px] font-medium tracking-wide text-white/90">
                  {progress < 90 ? 'Uploading…' : progress < 100 ? 'Processing…' : 'Done'}
                </div>
                <div className="mt-1 flex items-center gap-1 text-[10px] text-white/60">
                  <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
                  <span>Securing on Meta</span>
                </div>
              </div>
            )}

            <button
              type="button"
              className="absolute -right-3 -top-3 m-2 rounded-full bg-red-700 p-1 text-white shadow-md disabled:cursor-not-allowed disabled:opacity-40"
              onClick={handleRemoveFile}
              disabled={isUploading}
              aria-label="Remove media"
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
