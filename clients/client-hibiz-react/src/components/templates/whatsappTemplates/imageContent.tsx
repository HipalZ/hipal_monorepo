import useWhatsapp, { HeaderInterface } from "@/components/store/useWhatsapp";
import { memo, useCallback } from "react";
import { BiPlus, BiX } from "react-icons/bi";

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
    [setHeaderType, setImagePreview],
  );

  const handleRemoveImage = useCallback(() => {
    setImagePreview("");
    setHeaderType(HeaderInterface.Image);
  }, [setHeaderType, setImagePreview]);

  return (
    <div className="relative w-64 h-56 mb-4 bg-white border-2 border-gray-300 border-dashed rounded-lg">
      <input
        type="file"
        id="headerImage"
        className="absolute inset-0 z-10 w-full h-full opacity-0 cursor-pointer"
        accept="image/*"
        onChange={handleImageUpload}
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
            className="absolute p-1 m-2 text-white bg-black rounded-full -top-4 -right-4 hover:bg-gray-700"
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
  );
};

const ImageContent = memo(MemoImageContent);
export default ImageContent;
