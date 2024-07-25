import BottomButton from "@/components/atom/bottomButton";
import Background from "@/components/atom/feildBackground";
import useBusinessData from "@/components/store/useBusinessData";
import useMenuPageStore from "@/components/store/useMenuStorage";
import { storeImageAfterSave } from "@/components/utils/helper";
import { useSaveCategory } from "@/hooks/useCategory";
import { memo, type ChangeEvent } from "react";
import { BiImageAdd } from "react-icons/bi";

const MAX_WIDTH = 500;
const MAX_HEIGHT = 500;
const MIME_TYPE = "image/jpeg";
const QUALITY = 0.9;

const MemoAddCatImage = () => {
  const {
    imagePreview,
    setImagePreview,
    selectedFile,
    setSelectedFile,
    setIsLoading,
    selectedCategory,
    categoryName,
    selectIds,
  } = useMenuPageStore((s) => ({
    selectedCategory: s.selectedCategory,
    setSelectedCategory: s.setSelectedCategory,
    categoryName: s.categoryName,
    setCategoryName: s.setCategoryName,
    setCategoryStep: s.setCategoryStep,
    resetStore: s.resetStore,
    selectIds: s.selectedIds,
    categoryStep: s.categoryStep,
    imagePreview: s.imagePreview,
    setImagePreview: s.setImagePreview,
    selectedFile: s.selectedFile,
    setSelectedFile: s.setSelectedFile,
    setIsLoading: s.setIsLoading,
  }));

  const { mutate: createCategory, isPending } = useSaveCategory();

  const businessData = useBusinessData((s) => s.businessData);

  const handleImageChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      compressImage(file);
    }
  };

  const compressImage = (file: File) => {
    const blobURL = URL.createObjectURL(file);
    const img = new Image();
    img.src = blobURL;
    img.onerror = () => {
      URL.revokeObjectURL(img.src);
      console.log("Cannot load image");
    };
    img.onload = () => {
      URL.revokeObjectURL(img.src);
      const [newWidth, newHeight] = calculateSize(img, MAX_WIDTH, MAX_HEIGHT);
      const canvas = document.createElement("canvas");
      canvas.width = newWidth;
      canvas.height = newHeight;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(img, 0, 0, newWidth, newHeight);
        canvas.toBlob(
          (blob) => {
            if (blob) {
              const compressedFile = new File([blob], file.name, {
                type: MIME_TYPE,
                lastModified: Date.now(),
              });
              setSelectedFile(compressedFile);
              const reader = new FileReader();
              reader.onload = () => {
                if (reader.result) {
                  setImagePreview(reader.result as string);
                }
              };
              reader.readAsDataURL(compressedFile);
            }
          },
          MIME_TYPE,
          QUALITY,
        );
      }
    };
  };

  const calculateSize = (
    img: HTMLImageElement,
    maxWidth: number,
    maxHeight: number,
  ) => {
    let width = img.width;
    let height = img.height;

    if (width > height) {
      if (width > maxWidth) {
        height = Math.round((height * maxWidth) / width);
        width = maxWidth;
      }
    } else {
      if (height > maxHeight) {
        width = Math.round((width * maxHeight) / height);
        height = maxHeight;
      }
    }
    return [width, height];
  };

  const handleRemoveImage = () => {
    setImagePreview(null);
    setSelectedFile(null);
    const inputElement = document.getElementById("cat") as HTMLInputElement;
    if (inputElement) {
      inputElement.value = "";
    }
  };

  const handleSave = async () => {
    if (selectedFile) {
      const imageUrl = await storeImageAfterSave(
        selectedFile,
        imagePreview,
        setIsLoading,
      );
      if (imageUrl) {
        const commonPayload = {
          name: categoryName,
          businessId: Object(businessData?._id) || "",
          coverImage: imageUrl,
        };

        const payload =
          selectedCategory === "MAIN_CATEGORY"
            ? {
                ...commonPayload,
                hierarchy: "PARENT",
                subCategoryIds: selectIds,
              }
            : {
                ...commonPayload,
                hierarchy: "CHILD",
                parentCategoryIds: selectIds || [],
              };

        createCategory(payload);
      } else {
        console.error("Failed to upload image");
      }
    }
  };

  return (
    <section className="mx-6">
      <label className="font-medium" htmlFor="cat">
        Category Image
      </label>
      <Background>
        <div className="flex justify-between gap-4 mx-4">
          <div className="rounded-full w-[7rem] h-[7rem]">
            {imagePreview ? (
              <img
                src={imagePreview}
                alt="Preview"
                className="w-[7rem] h-[7rem] rounded-full object-contain"
              />
            ) : (
              <div
                className="flex items-center justify-center w-full h-full rounded-full"
                style={{
                  background: "linear-gradient(45deg, #D9CCFF, #FCD6CF)",
                }}
              >
                <BiImageAdd className="text-gray-600 opacity-50" size={36} />
              </div>
            )}
          </div>
          <div className="flex flex-col items-center justify-center w-1/2">
            <input
              type="file"
              id="cat"
              className="hidden"
              onChange={handleImageChange}
            />
            <button
              type="button"
              className="w-full p-2 mb-2 text-white bg-black rounded-2xl"
              onClick={() => document.getElementById("cat")?.click()}
            >
              Add Image
            </button>
            <button
              type="button"
              className="w-full p-2 text-black bg-white border border-black rounded-2xl"
              onClick={handleRemoveImage}
            >
              Remove
            </button>
          </div>
        </div>
      </Background>
      <BottomButton text="Save" onClick={handleSave} />
    </section>
  );
};

const AddCatImage = memo(MemoAddCatImage);
export default AddCatImage;
