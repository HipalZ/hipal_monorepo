import BottomButton from "@/components/atom/bottomButton";
import Background from "@/components/atom/feildBackground";
import LoadingSpinner from "@/components/atom/loadingSpinner";
import useBusinessData from "@/components/store/useBusinessData";
import useMenuPageStore from "@/components/store/useMenuStorage";
import { storeImageAfterSave } from "@/components/utils/helper";
import { useDeleteCategory, useUpdateCategory } from "@/hooks/useCategory";
import { Switch } from "@headlessui/react";

import { memo, useCallback, type ChangeEvent } from "react";
import { BiImageAdd } from "react-icons/bi";
import LinkingCategoryComp from "./linkingCategoryComp";

const MAX_WIDTH = 500;
const MAX_HEIGHT = 500;
const MIME_TYPE = "image/jpeg";
const QUALITY = 0.9;

const MemoEditCategory = () => {
  const {
    availability,
    setAvailability,
    catId,
    imagePreview,
    setImagePreview,
    selectedFile,
    categoryStep,
    setCategoryName,
    setSelectedFile,
    categoryName,
    selectIds,
    visibility,
    setVisibility,
    idCheck,
    recommendationIds,
    removeRecommendationIds,
    isLoading,
    setIsLoading,
    isMenuManager,
    isCatDelete,
    setIsCatDelete,
  } = useMenuPageStore((s) => ({
    selectIds: s.selectedIds,
    categoryStep: s.categoryStep,
    imagePreview: s.imagePreview,
    categoryName: s.categoryName,
    availability: s.availability,
    catId: s.catId,
    visibility: s.visibility,
    setAvailability: s.setAvailability,
    setVisibility: s.setVisibility,
    setImagePreview: s.setImagePreview,
    selectedFile: s.selectedFile,
    setSelectedFile: s.setSelectedFile,
    setCategoryName: s.setCategoryName,
    idCheck: s.idCheck,
    recommendationIds: s.recommendationIds,
    removeRecommendationIds: s.removeRecommendationIds,
    isLoading: s.isLoading,
    setIsLoading: s.setIsLoading,
    isMenuManager: s.isMenuManager,
    isCatDelete: s.isCatDelete,
    setIsCatDelete: s.setIsCatDelete,
  }));

  const { mutate, isPending } = useUpdateCategory();

  const { isPending: deletePending, mutate: deleteCat } = useDeleteCategory();

  const businessData = useBusinessData((s) => s.businessData);

  const handleImageChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      compressImage(file);
    }
  };

  const compressImage = useCallback((file: File) => {
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
  }, []);

  const calculateSize = useCallback(
    (img: HTMLImageElement, maxWidth: number, maxHeight: number) => {
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
    },
    [],
  );

  const handleRemoveImage = useCallback(() => {
    setImagePreview(null);
    setSelectedFile(null);
    const inputElement = document.getElementById("cat") as HTMLInputElement;
    if (inputElement) {
      inputElement.value = "";
    }
  }, [imagePreview]);

  const getRemovedIds = (prevIds: string[], newIds: string[]) => {
    return prevIds.filter((id) => !newIds.includes(id));
  };

  const handleSave = async () => {
    let imageUrl = imagePreview || "";
    if (selectedFile) {
      imageUrl = await storeImageAfterSave(
        selectedFile,
        imagePreview,
        setIsLoading,
      );
    }
    const removedCatIds = getRemovedIds(idCheck, selectIds);
    const removeDishIds = getRemovedIds(
      removeRecommendationIds,
      recommendationIds,
    );
    const commonPayload = {
      name: categoryName,
      businessId: businessData?._id.toString() || "",
      coverImage: imageUrl,
      availability: availability,
      visibility: visibility,
      _id: catId,
    };

    const payload =
      categoryStep === "EDIT_MAIN_CATEGORY"
        ? {
            ...commonPayload,
            subCategoryIds: selectIds,
            removeSubCategoryIds: removedCatIds,
          }
        : {
            ...commonPayload,
            parentCategoryIds: selectIds || [],
            removeParentCategoryIds: removedCatIds,
            dishIds: recommendationIds,
            removeDishIds: removeDishIds,
          };
    mutate(payload);
  };

  if (isPending) {
    return (
      <div>
        <LoadingSpinner />
      </div>
    );
  }

  if (isLoading) {
    return (
      <div>
        <LoadingSpinner />
      </div>
    );
  }

  if (deletePending) {
    return (
      <div>
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <>
      <article className="mx-6 lg:flex">
        <section className="flex-1">
          <h1 className="font-semibold opacity-50"> Category Image</h1>

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
                    <BiImageAdd
                      className="text-gray-600 opacity-50"
                      size={36}
                    />
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
        {!isMenuManager && (
          <section className="flex-1">
            <article className="lg:mx-4">
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
        )}
      </article>
      <section className="gap-4 mx-6 lg:flex">
        <article className="flex justify-between px-4 py-3 my-4 bg-white rounded-full lg:flex-1 lg:mt-6">
          <h1 className="font-semibold opacity-50">Category visibility</h1>
          <Switch
            checked={visibility}
            onChange={setVisibility}
            className="group inline-flex h-6 w-11 items-center rounded-full bg-gray-200 transition data-[checked]:bg-green-400"
          >
            <span className="size-4 translate-x-1 rounded-full bg-white transition group-data-[checked]:translate-x-6" />
          </Switch>
        </article>
      </section>
      <section className="mx-6">
        <LinkingCategoryComp />
      </section>
      {isCatDelete ? (
        <BottomButton
          buttons={[
            {
              text: "Cancel",
              onClick: () => setIsCatDelete(false),
              type: "button",
            },
            {
              text: "Confirm Delete",
              onClick: () => deleteCat(catId),
              type: "button",
            },
          ]}
        />
      ) : (
        <BottomButton
          buttons={[{ text: "Update", onClick: handleSave, type: "button" }]}
        />
      )}
    </>
  );
};

const EditMainCategory = memo(MemoEditCategory);
export default EditMainCategory;
