import {
  type ChangeEvent,
  type FormEvent,
  memo,
  useCallback,
  useRef,
} from "react";
import { RiLinkUnlink } from "react-icons/ri";
import useMenuPageStore, { DishSteps } from "@/components/store/useMenuStorage";
import Background from "@/components/atom/feildBackground";
import { filterPayload, updateImage } from "@/components/utils/helper";
import type { DishType } from "@hi/db-models/src/validators";
import useErrorToasts from "@/hooks/useError";
import { putDishData } from "@/hooks/useDish";
import { useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { Switch } from "@headlessui/react";
import { useQueryClient } from "@tanstack/react-query";
import BottomButton from "@/components/atom/bottomButton";
import type { DishPermissionData } from "@/hooks/usePosHook";
import DishImages from "./dishImages";
import { compressImage } from "@/components/utils/helper";
import MemoizedHeader from "@/components/molecules/header";
import { FaArrowLeft } from "react-icons/fa";
import Hi from "@/assets/svg/hi.svg";
import LinkItems from "./linkItems";
import EasyReactCropper from "@/components/cropper/cropper";
import { handleCrop } from "@/components/utils/helper";
import SectionLoader from "@/components/atom/sectionLoader";
import type { Area } from "react-easy-crop";

interface CropperRef {
  getCroppedAreaPixels: () => Area | null;
}

interface RestrictedEditDishProps {
  posPermission: DishPermissionData;
}

const RestrictedEditDish = memo(
  ({ posPermission }: RestrictedEditDishProps) => {
    const { businessId, menuId } = useParams<{
      businessId?: string;
      menuId?: string;
    }>();
    const queryClient = useQueryClient();
    const errorToasts = useErrorToasts();
    const cropperRef = useRef<CropperRef>(null);

    const {
      setDishStep,
      dishDescription,
      recommendationIds,
      removeRecommendationIds,
      visibility,
      setVisibility,
      setAvailability,
      availability,
      resetStore,
      setEditOpenMenu,
      editDish,
      resetDishStore,
      imageFiles,
      imagePreviews,
      isLoading,
      setIsLoading,
      setOpenMenu,
      setDishDescription,
      setCropping,
      cropping,
      setImageFiles,
      setImagePreviews,
      dishStep,
    } = useMenuPageStore((s) => ({
      setOpenMenu: s.setOpenMenu,
      setDishStep: s.setDishStep,
      dishDescription: s.dishDescription,
      recommendationIds: s.recommendationIds,
      visibility: s.visibility,
      setVisibility: s.setVisibility,
      availability: s.availability,
      setAvailability: s.setAvailability,
      selectedCatIds: s.selectedCatIds,
      resetStore: s.resetStore,
      editDish: s.editDish,
      setEditOpenMenu: s.setEditOpenMenu,
      removeRecommendationIds: s.removeRecommendationIds,
      resetDishStore: s.resetDishStore,
      imageFiles: s.imageFiles,
      imagePreviews: s.imagePreviews,
      isLoading: s.isLoading,
      setIsLoading: s.setIsLoading,
      setDishDescription: s.setDishDescription,
      setCropping: s.setCropping,
      cropping: s.cropping,
      showCropper: s.showCropper,
      setImageFiles: s.setImageFiles,
      setImagePreviews: s.setImagePreviews,
      dishStep: s.dishStep,
    }));

    const closeEditMenu = useCallback(() => {
      setEditOpenMenu(false);
    }, [setEditOpenMenu]);

    const handleDescription = useCallback(
      (e: ChangeEvent<HTMLTextAreaElement>) => {
        if (!posPermission.description) return;
        if (e.target.value.length > 350) return;
        setDishDescription(e.target.value);
      },
      [setDishDescription, posPermission.description],
    );

    const handleImageChange = (event: ChangeEvent<HTMLInputElement>) => {
      if (!posPermission.images) return;
      const type = event?.target?.dataset?.type;
      const file = event?.target?.files?.[0];
      if (file) {
        compressImage(file, (compressedFile) => {
          const reader = new FileReader();
          reader.readAsDataURL(compressedFile);
          reader.onloadend = () => {
            setCropping({ image: reader.result, type });
            setDishStep(DishSteps.SHOW_CROPPER);
          };
        });
      }
    };

    const handleSaveCropper = () => {
      handleCrop(
        cropping,
        cropperRef,
        imageFiles,
        setImageFiles,
        setImagePreviews,
        setDishStep,
      );
    };

    const handleSubmitDish = async (e?: FormEvent<HTMLFormElement>) => {
      e?.preventDefault();

      setIsLoading(true);

      let firstImage: string = editDish?.images?.[0] ?? "";
      let secondImage: string = editDish?.images?.[1] ?? "";
      let thirdImage: string = editDish?.images?.[2] ?? "";

      if (posPermission.images) {
        firstImage = (await updateImage(
          imageFiles?.first as File,
          imagePreviews?.first as string,
          firstImage,
        )) as string;
        secondImage = (await updateImage(
          imageFiles?.second as File,
          imagePreviews?.second as string,
          secondImage,
        )) as string;
        thirdImage = (await updateImage(
          imageFiles?.third as File,
          imagePreviews?.third as string,
          thirdImage,
        )) as string;
      }

      const images: string[] = [firstImage, secondImage, thirdImage].filter(
        Boolean,
      );

      const payload: DishType = {
        _id: editDish?._id,
        businessId: Object(businessId),
        menuId: Object(menuId),
        visibility: visibility,
        availability: availability,
        description: dishDescription,
        recommendationIds: Object(recommendationIds),
        removeRecommendationIds: Object(removeRecommendationIds),
        images: images,
      };

      const filteredPayload = filterPayload(payload);
      const { data, dishResponse } = await putDishData(filteredPayload);

      if (dishResponse?.status === 200) {
        resetStore();
        resetDishStore();
        setEditOpenMenu(false);
        setIsLoading(false);
        setOpenMenu(false);
        queryClient.invalidateQueries({ queryKey: ["getAllDishes"]});
        queryClient.invalidateQueries({ queryKey: ["linkedDishes"]});
        toast.success(data?.message);
        return;
      }

      setIsLoading(false);
      if (dishResponse?.status === 400 && Array.isArray(data?.error?.issues)) {
        errorToasts(data?.error);
      }
      if (dishResponse?.status === 400 || data?.message) {
        toast.error(data?.message);
      }
    };

    const handleVisibility = useCallback(() => {
      if (!posPermission.visibility) return;
      setVisibility(!visibility);
    }, [visibility, setVisibility, posPermission.visibility]);

    // Handle linking to recommendations if allowed
    const handleRecommendationLink = useCallback(() => {
      if (!posPermission.recommendationIds) return;
      setDishStep(DishSteps.LINK_RECOMMENDATION_STEP);
    }, [setDishStep, posPermission.recommendationIds]);

    // If we're in a linking step, show the appropriate component
    if (
      dishStep === DishSteps.LINK_RECOMMENDATION_STEP &&
      posPermission.recommendationIds
    ) {
      return (
        <>
          <header className="sticky top-0 z-10 w-full rounded-t-2xl bg-base-100">
            <MemoizedHeader
              title={`${editDish?.name}'s Recommendations`}
              onBack={() => setDishStep(DishSteps.DISH_STEP_1)}
              leftIcon={<FaArrowLeft />}
              rightImage={Hi}
              isIconBusinessShow={false}
            />
          </header>
          <LinkItems />
        </>
      );
    }

    // If we're in cropper mode, show the cropper
    if (dishStep === DishSteps.SHOW_CROPPER && posPermission.images) {
      return (
        <>
          <EasyReactCropper
            image={cropping.image}
            ref={cropperRef}
            width={400}
            height={400}
          />
          <footer className="absolute bottom-4 flex w-[92%] lg:w-[96%] gap-4 mx-4">
            <button
              type="button"
              onClick={handleSaveCropper}
              className="w-full py-3 text-white rounded-full bg-[#7D68FE]"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <SectionLoader />
                  Loading...
                </div>
              ) : (
                "Save"
              )}
            </button>
          </footer>
        </>
      );
    }

    return (
      <>
        <header className="sticky top-0 z-10 w-full rounded-t-2xl bg-base-100">
          <MemoizedHeader
            title={`${editDish?.name || "Edit Dish"} (Restricted)`}
            onBack={closeEditMenu}
            leftIcon={<FaArrowLeft />}
            rightImage={Hi}
            isIconBusinessShow={false}
          />
        </header>

        <div className="p-4 mb-4 bg-yellow-50 border border-yellow-200 rounded-lg mx-6">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">
                Restricted Editing Mode
              </h3>
              <div className="mt-2 text-sm text-yellow-700">
                <p>
                  You can only edit the following fields based on your POS
                  configuration:
                </p>
                <ul className="list-disc list-inside mt-1">
                  {posPermission.description && <li> Description</li>}
                  {posPermission.images && <li>Images</li>}
                  {posPermission.visibility && <li>Visibility</li>}
                  {posPermission.recommendationIds && <li>Recommendations</li>}
                </ul>
              </div>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmitDish}>
          {/* Visibility Toggle - Only if visibility permission is true */}

          <section className="flex flex-col md:flex-row md:gap-4 my-4">
            {posPermission.visibility && (
              <article className="flex flex-1 justify-between px-4 py-3 mx-4 bg-white rounded-full lg:mx-16 lg:mt-6">
                <h1 className="font-semibold opacity-50">Hide Dish</h1>
                <Switch
                  checked={visibility}
                  onChange={handleVisibility}
                  className="group inline-flex h-6 w-11 items-center rounded-full bg-gray-200 transition data-[checked]:bg-green-400"
                >
                  <span className="size-4 translate-x-1 rounded-full bg-white transition group-data-[checked]:translate-x-6" />
                </Switch>
              </article>
            )}

            {/* Availability Toggle - Always available */}
            <article className="flex flex-1 justify-between px-4 py-3 mx-4 bg-white rounded-full lg:mx-16 lg:mt-6">
              <h1 className="font-semibold opacity-50">Dish Availability</h1>
              <Switch
                checked={availability}
                onChange={setAvailability}
                className="group inline-flex h-6 w-11 items-center rounded-full bg-gray-200 transition data-[checked]:bg-green-400"
              >
                <span className="size-4 translate-x-1 rounded-full bg-white transition group-data-[checked]:translate-x-6" />
              </Switch>
            </article>
          </section>

          {/* Images - Only if images permission is true */}
          {posPermission.images && (
            <article className="mx-6 mb-4 lg:mx-16 lg:mt-6">
              <label className="font-semibold opacity-50">Dish Images</label>
              <Background>
                <DishImages
                  handleImageChange={handleImageChange}
                  img={imagePreviews}
                />
              </Background>
            </article>
          )}

          {/* Description - Only if description permission is true */}
          {posPermission.description && (
            <article className="mx-6 lg:mx-16 lg:mt-6">
              <label className="font-semibold opacity-50" htmlFor="type">
                Dish Description
              </label>
              <div className="relative p-3 my-2 bg-white rounded-2xl">
                <textarea
                  value={dishDescription}
                  onChange={handleDescription}
                  className="w-full resize-none rounded-2xl h-[8rem]"
                  placeholder="Add description"
                />
                <small className="absolute bottom-6 right-6">
                  {dishDescription.length}/350
                </small>
              </div>
            </article>
          )}

          {/* Recommendations - Only if recommendation permission is true */}
          {posPermission.recommendationIds && (
            <section className="mx-6 lg:mx-16 lg:mt-6">
              <label className="font-semibold opacity-50">
                Recommendation ({recommendationIds.length})
              </label>
              <Background>
                <button
                  type="button"
                  onClick={handleRecommendationLink}
                  className="bg-[#f4f4f4] w-full py-2 rounded-full flex items-center justify-center"
                >
                  <RiLinkUnlink className="mr-2" /> Link Recommendation
                </button>
              </Background>
            </section>
          )}

          <BottomButton
            buttons={[
              {
                text: "Save Changes",
                isLoading: isLoading,
                type: "submit",
              },
            ]}
          />
        </form>
      </>
    );
  },
);

RestrictedEditDish.displayName = "RestrictedEditDish";
export default RestrictedEditDish;
