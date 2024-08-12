import LoadingSpinner from "@/components/atom/loadingSpinner";
import ReactCropper, { cropImage } from "@/components/cropper";
import useHiPeopleStore from "@/components/store/useHipeopleStore";
import {
  cn,
  compressImage,
  handleClick,
  storeImageAfterSave,
} from "@/components/utils/helper";
import { useUpdateNotes } from "@/hooks/useHipeople";
import {
  type ChangeEvent,
  lazy,
  memo,
  useCallback,
  useEffect,
  useRef,
} from "react";
import toast from "react-hot-toast";
import { CiEdit } from "react-icons/ci";
import { useParams } from "react-router-dom";

const BottomButton = lazy(() => import("@/components/atom/bottomButton"));
const PlusButton = lazy(() => import("@/components/atom/plusButton"));
const CropperPopup = lazy(() => import("@/components/common/cropperPopup"));
const MemoEditNotes = () => {
  const { businessId, userId } = useParams<{
    businessId: string;
    userId: string;
  }>();
  const {
    userDashboardDetails,
    cropping,
    setCropping,
    imageFiles,
    setImageFiles,
    setShowCropper,
    img,
    setImg,
    showCropper,
    titleNotes,
    setTitleNotes,
    descriptionNotes,
    setDescriptionNotes,
    setIsLoading,
    setOpenAddNotes,
    isLoading,
    singleNotesData,
  } = useHiPeopleStore((s) => ({
    userDashboardDetails: s.userDashboardDetails,
    cropping: s.cropping,
    setCropping: s.setCropping,
    imageFiles: s.imageFiles,
    setImageFiles: s.setImageFiles,
    setShowCropper: s.setShowCropper,
    img: s.img,
    setImg: s.setImg,
    showCropper: s.showCropper,
    titleNotes: s.titleNotes,
    setTitleNotes: s.setTitleNotes,
    descriptionNotes: s.descriptionNotes,
    setDescriptionNotes: s.setDescriptionNotes,
    setIsLoading: s.setIsLoading,
    setOpenAddNotes: s.setOpenAddNotes,
    isLoading: s.isLoading,
    singleNotesData: s.singleNotesData,
  }));

  const { mutate } = useUpdateNotes();

  useEffect(() => {
    if (singleNotesData) {
      setTitleNotes(singleNotesData?.noteTitle);
      setDescriptionNotes(singleNotesData?.noteDescription);
      setImg({ logo: singleNotesData?.noteUrl });
    }
  }, []);

  const cropperRef = useRef(null);
  const logoInputRef = useRef<HTMLInputElement>(null);

  const handleImageChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      const type = event?.target?.dataset?.type;
      const file = event?.target?.files?.[0];
      if (file) {
        compressImage(file, (compressedFile) => {
          const reader = new FileReader();
          reader.readAsDataURL(compressedFile);
          reader.onloadend = () => {
            setCropping({ image: reader.result, type });
            setShowCropper(true);
            setImageFiles({ [type]: compressedFile });
          };
        });
      }
    },
    [imageFiles],
  );

  const handleCrop = async () => {
    console.log("cropping", cropping);
    const { image, type } = cropping;
    const cropper = cropperRef.current;

    if (cropper && image && type) {
      const coordinates = cropper?.getCoordinates();
      if (coordinates) {
        try {
          const croppedDataUrl = await cropImage(image, coordinates);
          if (typeof croppedDataUrl === "string") {
            const blob = await (await fetch(croppedDataUrl)).blob();
            const croppedFile = new File([blob], imageFiles[type]?.name, {
              type: "image/png",
            });
            const reader = new FileReader();
            reader.onloadend = () => {
              setImg((prev) => ({ ...prev, [type]: reader.result }));
              setImageFiles((prev) => ({ ...prev, [type]: croppedFile }));
              setShowCropper(false);
            };
            reader.readAsDataURL(croppedFile);
          }
        } catch (err) {
          console.error(err);
        }
      }
    }
    setShowCropper(false);
  };

  const handleNotes = async () => {
    let imageUrl = "";

    if (titleNotes.length === 0) {
      return toast.error("Please enter the title");
    }
    if (descriptionNotes.length === 0) {
      return toast.error("Please enter the description");
    }
    if (imageFiles?.logo && imageUrl.length === 0) {
      imageUrl = await storeImageAfterSave(
        imageFiles?.logo,
        img?.logo,
        setIsLoading,
      );
    }
    if (imageUrl.length === 0 && img?.logo?.length === 0) {
      return toast.error("Please upload the image");
    }
    const payload = {
      businessId: businessId,
      userId: userId,
      noteTitle: titleNotes || singleNotesData?.noteTitle,
      noteDescription: descriptionNotes || singleNotesData?.noteDescription,
      noteUrl: imageUrl || singleNotesData?.noteUrl,
      tagIds: [],
    };
    mutate(payload);
    setOpenAddNotes(false);
  };

  return (
    <>
      <section className="h-[80dvh] overflow-y-auto pb-[5rem] bg-white rounded-t-3xl">
        {showCropper ? (
          <section>
            <ReactCropper image={cropping.image} ref={cropperRef} />
            <BottomButton
              buttons={[
                {
                  text: "Crop",
                  onClick: handleCrop,
                },
              ]}
            />
          </section>
        ) : (
          <>
            <center className="my-4">
              <h1 className="px-4 py-1 text-3xl text-[#6F649B] bg-opacity-50 rounded-xl">
                Edit Notes
              </h1>
              <span className="text-[#6F649B]">
                For :- {userDashboardDetails?.name}
              </span>
            </center>
            <article
              className={cn(
                "shrink-0 relative rounded-xl h-[8rem] w-[8rem] mx-6",
                img?.logo?.length > 0
                  ? ""
                  : " border-dashed border-2 inline-block border-[#8C63FF]",
              )}
            >
              <input
                ref={logoInputRef}
                onClick={(e) => handleClick(e, logoInputRef)}
                type="file"
                id="logoInput"
                style={{ display: "none" }}
                onChange={handleImageChange}
                data-type="logo"
              />
              <label
                htmlFor="logoInput"
                className="flex items-center justify-center w-full h-full overflow-hidden cursor-pointer rounded-xl"
              >
                {img?.logo ? (
                  <div className="relative w-full h-full">
                    <figure className="w-full h-full">
                      <img
                        src={img?.logo}
                        alt="Logo"
                        className="object-cover w-full h-full rounded-xl"
                      />
                    </figure>
                    <CiEdit className="absolute top-0 right-0 w-6 h-6 p-1 text-black bg-white rounded-full cursor-pointer" />
                  </div>
                ) : (
                  <PlusButton />
                )}
              </label>
            </article>
            <div className="relative mx-6 mt-4">
              <input
                type="text"
                value={titleNotes}
                minLength={4}
                maxLength={30}
                onChange={(e) => setTitleNotes(e.target.value)}
                placeholder="Enter the title..."
                className="w-full p-2 pr-14 bg-white border border-[#8C63FF] rounded-xl focus:ring-0 focus:bg-white focus:border-[#8C63FF]"
              />
              <small className="absolute bottom-2 right-4">
                {titleNotes?.length || titleNotes?.length}/{30}
              </small>
            </div>
            <div className="relative mx-6 mt-4">
              <textarea
                value={descriptionNotes}
                minLength={4}
                maxLength={200}
                onChange={(e) => setDescriptionNotes(e.target.value)}
                placeholder="Enter the Note..."
                className="resize-none h-48 w-full p-2 pr-14 bg-white border border-[#8C63FF] rounded-xl focus:ring-0 focus:bg-white focus:border-[#8C63FF]"
              />
              <small className="absolute bottom-2 right-4">
                {descriptionNotes?.length || descriptionNotes?.length}/{200}
              </small>
            </div>
            {isLoading ? <LoadingSpinner /> : null}
            <BottomButton
              buttons={[
                {
                  text: "Update Notes",
                  onClick: handleNotes,
                },
              ]}
            />
          </>
        )}
      </section>
    </>
  );
};

const EditNotes = memo(MemoEditNotes);
export default EditNotes;
