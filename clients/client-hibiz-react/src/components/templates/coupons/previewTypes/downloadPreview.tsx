import { memo, useRef } from "react";
import StorySize from "./storySize";
import BottomButton from "@/components/atom/bottomButton";
import useCouponsStore from "@/components/store/useCouponsStore";
import { toPng } from "html-to-image";
import InfoSocialMedia from "./infoSocialMedia";

const MemoDownloadPreview = () => {
  const { resetCouponState, setDownloadPreviewModal, setSelectedPage } =
    useCouponsStore((s) => ({
      setDownloadPreviewModal: s.setDownloadPreviewModal,
      resetCouponState: s.resetCouponState,
      setSelectedPage: s.setSelectedPage,
    }));

  const socialMediaRef = useRef(null);
  const storySizeRef = useRef(null);

  const goInManagePage = () => {
    setDownloadPreviewModal(false);
    setSelectedPage("MANAGE");
    resetCouponState();
  };

  const handleDownload = async () => {
    const downloadImage = async (node, fileName) => {
      try {
        const dataUrl = await toPng(node, { cacheBust: true });
        const link = document.createElement("a");
        link.download = `${fileName}.png`;
        link.href = dataUrl;
        link.click();
      } catch (error) {
        console.error(`Failed to download ${fileName}:`, error);
      }
    };

    const downloadPromises = [];

    if (socialMediaRef.current) {
      downloadPromises.push(
        downloadImage(socialMediaRef.current, "social_media_preview"),
      );
    }

    if (storySizeRef.current) {
      downloadPromises.push(
        downloadImage(storySizeRef.current, "story_size_preview"),
      );
    }

    await Promise.all(downloadPromises);
  };

  return (
    <>
      <section className="flex flex-col gap-4 px-4 lg:flex-row">
        <div ref={socialMediaRef}>
          <InfoSocialMedia />
        </div>
        <div className="mt-3" ref={storySizeRef}>
          <StorySize />
        </div>
      </section>
      <BottomButton
        fixed
        buttons={[
          {
            text: "Close",
            onClick: goInManagePage,
          },
          {
            text: "Download",
            onClick: handleDownload,
          },
        ]}
      />
    </>
  );
};

const DownloadPreview = memo(MemoDownloadPreview);
export default DownloadPreview;
