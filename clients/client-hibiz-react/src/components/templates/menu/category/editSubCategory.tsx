import Background from "@/components/atom/feildBackground";
import useBusinessData from "@/components/store/useBusinessData";
import useMenuPageStore from "@/components/store/useMenuStorage";
import { storeImageAfterSave } from "@/components/utils/helper";
import { useSaveCategory } from "@/hooks/useCategory";
import { memo, type ChangeEvent } from "react";
import { BiImageAdd } from "react-icons/bi";
import { RiLinkUnlink } from "react-icons/ri";

const MAX_WIDTH = 500;
const MAX_HEIGHT = 500;
const MIME_TYPE = "image/jpeg";
const QUALITY = 0.9;

const MemoEditSubCategory = () => {
  const {
    availability,
    setAvailability,
    setVisibility,
    visibility,
    imagePreview,
    setImagePreview,
    selectedFile,
    categoryStep,
    resetStore,
    setCategoryName,
    setCategoryStep,
    setSelectedCategory,
    setSelectedFile,
    selectedCategory,
    categoryName,
    selectIds,
  } = useMenuPageStore((s) => ({
    selectedCategory: s.selectedCategory,
    selectIds: s.selectedIds,
    categoryStep: s.categoryStep,
    imagePreview: s.imagePreview,
    categoryName: s.categoryName,
    visibility: s.catVisibility,
    availability: s.availability,
    setVisibility: s.setVisibility,
    setAvailability: s.setAvailability,
    setSelectedCategory: s.setSelectedCategory,
    setCategoryStep: s.setCategoryStep,
    resetStore: s.resetStore,
    setImagePreview: s.setImagePreview,
    selectedFile: s.selectedFile,
    setSelectedFile: s.setSelectedFile,
    setCategoryName: s.setCategoryName,
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
      const imageUrl = await storeImageAfterSave(selectedFile, imagePreview);
      if (imageUrl) {
        const commonPayload = {
          name: categoryName,
          businessId: businessData?._id.toString() || "",
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
      <section>
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
                  className="w-[7rem] h-[7rem] rounded-full object-cover"
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
      </section>
      <section>
        <article className="lg:mx-10 lg:mt-6">
          <label className="font-semibold opacity-50" htmlFor="name">
            Category Name*
          </label>
          <Background>
            <input
              type="text"
              id="name"
              placeholder="Enter Category Name"
              value={categoryName}
              maxLength={21}
              onChange={(e) => setCategoryName(e.target.value)}
              className="w-full p-2 bg-white border border-black rounded-xl focus:ring-0 focus:bg-white focus:border-[#8C63FF]"
            />
          </Background>
        </article>
      </section>
      <section className="lg:mx-10 lg:mt-6">
        <Background>
          <div className="flex items-center">
            <input
              type="checkbox"
              id="visibility"
              checked={visibility}
              onChange={() => setVisibility(!visibility)}
              className="mr-2"
            />
            <span>Visible</span>
          </div>
          <div className="flex items-center">
            <input
              type="checkbox"
              id="availability"
              checked={availability}
              onChange={() => setAvailability(!availability)}
              className="mr-2"
            />
            <span>Available</span>
          </div>
        </Background>
      </section>
      {selectedCategory === "MAIN_CATEGORY" && (
        <section className="mx-6 mt-4 lg:mx-16 lg:mt-6">
          <label className="font-semibold opacity-50" htmlFor="name">
            Link Sub-Categories({selectIds?.length})
          </label>
          <Background>
            <button
              onClick={() => setCategoryStep("LINK_SUB_CATEGORY")}
              type="button"
              className="bg-[#f4f4f4] w-full py-2 rounded-full flex items-center justify-center"
            >
              <RiLinkUnlink className="mr-2" /> Link Sub Categories
            </button>
          </Background>
        </section>
      )}

      {selectedCategory === "SUB_CATEGORY" && (
        <>
          <section className="mx-6 mt-4 lg:mx-16 lg:mt-6">
            <label className="font-semibold opacity-50" htmlFor="name">
              Link Main Categories({selectIds?.length})
            </label>
            <Background>
              <button
                onClick={() => setCategoryStep("LINK_MAIN_CATEGORY")}
                type="button"
                className="bg-[#f4f4f4] w-full py-2 rounded-full flex items-center justify-center"
              >
                <RiLinkUnlink className="mr-2" /> Link Main Categories
              </button>
            </Background>
          </section>

          <section className="mx-6 mt-4 lg:mx-16 lg:mt-6">
            <label className="font-semibold opacity-50" htmlFor="name">
              Link Dishes
            </label>
            <Background>
              <button
                type="button"
                className="bg-[#f4f4f4] w-full py-2 rounded-full flex items-center justify-center"
              >
                <RiLinkUnlink className="mr-2" /> Link Dishes
              </button>
            </Background>
          </section>
        </>
      )}
      <button type="button" className="bottom_btn" onClick={handleSave}>
        Save
      </button>
    </section>
  );
};

const EditSubCategory = memo(MemoEditSubCategory);
export default EditSubCategory;
