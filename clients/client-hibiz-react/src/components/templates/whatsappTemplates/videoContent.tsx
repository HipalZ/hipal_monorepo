import useWhatsapp, { HeaderInterface } from '@/components/store/useWhatsapp';
import { cn } from '@/components/utils/helper';
import { type ChangeEvent, memo, useCallback, useRef } from 'react';
import toast from 'react-hot-toast';
import { BiPlus, BiX } from 'react-icons/bi';

const MemoVideoContent = () => {
  const setHeaderType = useWhatsapp((s) => s.setHeaderType);
  const imagePreview = useWhatsapp((s) => s.imagePreview);
  const setImageFiles = useWhatsapp((s) => s.setImageFiles);
  const setImagePreview = useWhatsapp((s) => s.setImagePreview);
  const templateImageRef = useRef<HTMLInputElement | null>(null);
  const handleImageChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      const file = event?.target?.files?.[0];
      if (file) {
        const maxSizeInBytes = 2 * 1024 * 1024;
        if (file.size > maxSizeInBytes) {
          toast.error('File size exceeds 2MB. Please select a smaller file.');
          return;
        }
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onloadend = () => {
          setImagePreview(reader.result as string);
          setImageFiles(file);
        };
      }
    },
    [setImageFiles, setImagePreview],
  );

  const handleRemoveImage = useCallback(() => {
    setImagePreview('');
    setHeaderType(HeaderInterface.Video);
  }, [setHeaderType, setImagePreview]);

  return (
    <>
      <label htmlFor="headerVideo" className="mb-1 block text-base font-bold text-black">
        Choose Video or Gif
      </label>
      <div className={cn('relative mb-4 h-56 w-64 rounded-lg bg-white', imagePreview ? '' : 'border-2 border-dashed border-gray-300')}>
        <input
          ref={templateImageRef}
          type="file"
          id="headerVideo"
          className="absolute inset-0 z-10 h-full w-full cursor-pointer opacity-0"
          accept="video/mp4"
          onChange={handleImageChange}
        />
        {imagePreview ? (
          <div className="relative h-full w-full">
            <video autoPlay muted loop playsInline controls className="h-full w-full rounded-lg object-cover">
              <source src={imagePreview} type="video/mp4" />
            </video>

            <button
              type="button"
              className="absolute -right-4 -top-4 m-2 rounded-full bg-gray-700 p-1 text-white hover:bg-gray-700"
              onClick={handleRemoveImage}
            >
              <BiX className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <div className="absolute inset-0 left-1/2 top-1/2 mt-16 min-h-56 w-full -translate-x-1/2 -translate-y-1/2 transform">
            <BiPlus className="mx-auto h-12 w-12 text-gray-400" />
            <p className="mt-2 text-center text-sm text-gray-600">Click to upload image</p>
          </div>
        )}
      </div>
    </>
  );
};

const VideoContent = memo(MemoVideoContent);
export default VideoContent;
