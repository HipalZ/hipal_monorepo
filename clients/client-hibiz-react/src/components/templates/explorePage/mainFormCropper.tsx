import BottomButton from "@/components/atom/bottomButton";
import PopUp from "@/components/atom/popUp";
import type { CropperRef } from "@/components/types/businessData";
import { memo, useRef } from "react";
import { useExploreStore } from "@/components/store/useExploreStore";
import EasyReactCropper from "@/components/cropper/cropper";
import { useCroppedImg } from "@/components/helpers/explorePageHelpers";

const MemoMainFormCropper = () => {
  const { handleCrop } = useCroppedImg();
  const cropperRef = useRef<CropperRef>(null);
  const { cropping, setShowCropper, showCropper } = useExploreStore((s) => ({
    showCropper: s.showCropper,
    setShowCropper: s.setShowCropper,
    cropping: s.cropping,
  }));

  // if no showCropper then not rendering the jsx
  if (!showCropper) return null;

  return (
    <PopUp show={showCropper} onClose={() => setShowCropper(false)}>
      <section className="my-[10rem]">
        <EasyReactCropper
          image={cropping.image}
          ref={cropperRef}
          width={400}
          height={400}
        />
      </section>
      <BottomButton
        buttons={[
          {
            text: "Crop",
            onClick: () => handleCrop(cropperRef),
          },
        ]}
      />
    </PopUp>
  );
};

const MainFormCropper = memo(MemoMainFormCropper);
export default MainFormCropper;
