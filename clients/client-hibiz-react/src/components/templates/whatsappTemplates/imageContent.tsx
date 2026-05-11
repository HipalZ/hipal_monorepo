import useWhatsapp, { HeaderInterface } from '@/components/store/useWhatsapp';
import { cn } from '@/components/utils/helper';
import { type ChangeEvent, memo, useCallback, useRef } from 'react';
import toast from 'react-hot-toast';
import { BiPlus, BiX } from 'react-icons/bi';

const MAX_IMAGE_BYTES = 10 * 1024 * 1024; // 10 MB frontend cap (Meta's hard limit is 5 MB; over that returns a Meta error to the popup)

const MemoImageContent = () => {
  const setHeaderType = useWhatsapp((s) => s.setHeaderType);
  const imagePreview = useWhatsapp((s) => s.imagePreview);
  const setImageFiles = useWhatsapp((s) => s.setImageFiles);
  const setImagePreview = useWhatsapp((s) => s.setImagePreview);
  const setCropping = useWhatsapp((s) => s.setCropping);
  const setTemplateError = useWhatsapp((s) => s.setTemplateError);
  const templateImageRef = useRef<HTMLInputElement | null>(null);

  const handleImageChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      const file = event?.target?.files?.[0];
      if (!file) return;

      if (file.size > MAX_IMAGE_BYTES) {
        const mb = (file.size / 1024 / 1024).toFixed(1);
        setTemplateError(
          `This image is ${mb} MB — over the 10 MB limit. Please pick a smaller image.`,
        );
        if (templateImageRef.current) templateImageRef.current.value = '';
        return;
      }

      // Blob URL — small token string, no localStorage bloat. Works as both
      // the cropper source and the preview <img src>.
      if (imagePreview && imagePreview.startsWith('blob:')) {
        try {
          URL.revokeObjectURL(imagePreview);
        } catch {}
      }
      const blobUrl = URL.createObjectURL(file);
      setCropping({ image: blobUrl, type: file.type });
      setImagePreview(blobUrl);
      setImageFiles(file);
    },
    [setImageFiles, setImagePreview, setCropping, setTemplateError, imagePreview],
  );

  const handleRemoveImage = useCallback(() => {
    if (imagePreview && imagePreview.startsWith('blob:')) {
      try {
        URL.revokeObjectURL(imagePreview);
      } catch {}
    }
    setImagePreview('');
    setImageFiles(null);
    setHeaderType(HeaderInterface.Image);
  }, [imagePreview, setHeaderType, setImagePreview, setImageFiles]);

  return (
    <>
      <label htmlFor="headerImage" className="mb-1 block text-base font-bold text-black">
        Choose Image or Gif
      </label>
      <div className={cn('relative mb-4 h-56 w-64 rounded-lg bg-white', imagePreview ? '' : 'border-2 border-dashed border-gray-300')}>
        <input
          ref={templateImageRef}
          type="file"
          id="headerImage"
          className="absolute inset-0 z-10 h-full w-full cursor-pointer opacity-0"
          accept="image/jpeg, image/png, image/jpg"
          onChange={handleImageChange}
        />
        {imagePreview ? (
          <div className="relative h-full w-full">
            <img src={imagePreview} alt="Header preview" className="h-full w-full rounded-lg object-cover" />
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

const ImageContent = memo(MemoImageContent);
export default ImageContent;
