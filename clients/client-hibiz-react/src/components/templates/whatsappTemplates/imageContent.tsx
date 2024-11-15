import useWhatsapp, { HeaderInterface } from "@/components/store/useWhatsapp";
import { cn } from "@/components/utils/helper";
import { type ChangeEvent, memo, useCallback, useRef } from "react";
import toast from "react-hot-toast";
import { BiPlus, BiX } from "react-icons/bi";

const MemoImageContent = () => {
  const {
    setHeaderType,
    imagePreview,
    setImageFiles,
    setShowCropper,
    setImagePreview,
    setCropping,
  } = useWhatsapp((s) => ({
    setHeaderType: s.setHeaderType,
    imagePreview: s.imagePreview,
    setImageFiles: s.setImageFiles,
    setShowCropper: s.setShowCropper,
    setImagePreview: s.setImagePreview,
    setCropping: s.setCropping,
  }));
  const templateImageRef = useRef<HTMLInputElement | null>(null);
  const handleImageChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      const file = event?.target?.files?.[0];
      console.log("file", file);
      if (file) {
        const maxSizeInBytes = 2 * 1024 * 1024; // 2MB in bytes
        if (file.size > maxSizeInBytes) {
          toast.error("File size exceeds 2MB. Please select a smaller file.");
          return;
        }
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onloadend = () => {
          setCropping({ image: reader.result, type: file.type });
          setShowCropper(true);
          setImageFiles(file);
        };
      }
    },
    [setImageFiles, setShowCropper, setCropping],
  );

  const handleRemoveImage = useCallback(() => {
    setImagePreview("");
    setHeaderType(HeaderInterface.Image);
  }, [setHeaderType, setImagePreview]);

  return (
    <>
      <label className="block mb-1 text-base font-bold text-black">
        Choose Image or Gif
      </label>
      <div
        className={cn(
          "relative w-64 mb-4 bg-white rounded-lg h-56",
          imagePreview ? "" : "border-2 border-gray-300 border-dashed",
        )}
      >
        <input
          ref={templateImageRef}
          type="file"
          id="headerImage"
          className="absolute inset-0 z-10 w-full h-full opacity-0 cursor-pointer"
          accept="image/jpeg, image/png, image/jpg"
          onChange={handleImageChange}
        />
        {imagePreview ? (
          <div className="relative w-full h-full">
            <img
              src={imagePreview}
              alt="Header preview"
              className="object-cover w-full h-full rounded-lg"
            />
            <button
              type="button"
              className="absolute p-1 m-2 text-white bg-gray-700 rounded-full -top-4 -right-4 hover:bg-gray-700"
              onClick={handleRemoveImage}
            >
              <BiX className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="absolute inset-0 w-full mt-16 transform -translate-x-1/2 -translate-y-1/2 min-h-56 left-1/2 top-1/2">
            <BiPlus className="w-12 h-12 mx-auto text-gray-400" />
            <p className="mt-2 text-sm text-center text-gray-600">
              Click to upload image
            </p>
          </div>
        )}
      </div>
    </>
  );
};

const ImageContent = memo(MemoImageContent);
export default ImageContent;
