import useWhatsapp, { HeaderInterface } from "@/components/store/useWhatsapp";
import { memo, useCallback } from "react";
import { BiPlus } from "react-icons/bi";

const MemoImageContent = () => {
  const { setHeaderType, imagePreview, setImagePreview } = useWhatsapp((s) => ({
    setHeaderType: s.setHeaderType,
    imagePreview: s.imagePreview,
    setImagePreview: s.setImagePreview,
  }));

  const handleImageUpload = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setHeaderType(HeaderInterface.Image);
          setImagePreview(reader.result as string);
        };
        reader.readAsDataURL(file);
      }
    },
    [],
  );
  return (
    <div className="mb-4">
      <label
        htmlFor="headerImage"
        className="block mb-1 text-sm font-medium text-gray-700"
      >
        Choose Image/Gif (optional)
      </label>
      <div className="relative h-40 overflow-hidden border-2 border-gray-300 border-dashed rounded-lg w-80">
        <input
          type="file"
          id="headerImage"
          className="absolute inset-0 z-10 w-full h-full opacity-0 cursor-pointer"
          accept="image/*"
          onChange={handleImageUpload}
        />
        {imagePreview ? (
          <img
            src={imagePreview}
            alt="Header preview"
            className="object-cover w-full h-40"
          />
        ) : (
          <div className="flex items-center justify-center w-full h-full">
            <div className="text-center">
              <BiPlus className="w-12 h-12 mx-auto text-gray-400" />
              <p className="mt-2 text-sm text-gray-600">
                Click to upload image
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const ImageContent = memo(MemoImageContent);
export default ImageContent;
