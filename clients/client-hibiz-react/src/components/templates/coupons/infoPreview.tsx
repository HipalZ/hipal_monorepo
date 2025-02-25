import LoadingSpinner from "@/components/atom/loadingSpinner";
import { memo, lazy, Suspense, useState, useRef } from "react";
import { motion } from "framer-motion";
import { cn } from "@hi/common";
import { toPng } from "html-to-image";

const buttonData = [
  { id: "storySize", label: "Story Size" },
  { id: "socialMedia", label: "Social Media" },
  { id: "beforeGrabbing", label: "Before Grabbing" },
  { id: "afterGrabbing", label: "After Grabbing" },
  { id: "smallCoupon", label: "Home Page" },
];

const BeforeGrabbingCoupon = lazy(
  () => import("./previewTypes/beforeGrabbing"),
);
const InfoSocialMedia = lazy(() => import("./previewTypes/infoSocialMedia"));
const StorySize = lazy(() => import("./previewTypes/storySize"));
const AfterGrabbingCoupon = lazy(
  () => import("./previewTypes/afterGrabbingCard"),
);
const SmallCoupon = lazy(() => import("./previewTypes/smallCoupon"));

const previews = [
  { id: "storySize", component: <StorySize key="storySize" /> },
  { id: "socialMedia", component: <InfoSocialMedia key="socialMedia" /> },
  {
    id: "beforeGrabbing",
    component: <BeforeGrabbingCoupon key="beforeGrabbing" />,
  },
  {
    id: "afterGrabbing",
    component: <AfterGrabbingCoupon key="afterGrabbing" />,
  },
  { id: "smallCoupon", component: <SmallCoupon key="smallCoupon" /> },
];

const MemoInfoPreview = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const previewRef = useRef<HTMLDivElement>(null);

  const handlePreviewChange = (index: number) => {
    setCurrentIndex(index);
  };

  const handleDownload = async () => {
    if (previewRef.current === null) {
      return;
    }

    try {
      const dataUrl = await toPng(previewRef.current);

      const link = document.createElement("a");
      link.download = `${buttonData[currentIndex].id}.png`;
      link.href = dataUrl;
      link.click();
    } catch (error) {
      console.error("Failed to capture the preview:", error);
    }
  };

  return (
    <Suspense fallback={<LoadingSpinner />}>
      <section className="relative flex h-[38rem] lg:h-[38rem] flex-col items-center gap-4 overflow-hidden">
        <motion.div
          key={currentIndex}
          className="p-4 rounded-xl"
          initial={{ opacity: 0, x: 100 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -100 }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
          ref={previewRef}
        >
          {previews[currentIndex].component}
        </motion.div>

        <div className="absolute flex flex-wrap items-center justify-center flex-1 gap-4 pb-4 mx-4 text-sm -bottom-2">
          {buttonData.map(({ id, label }, index) => (
            <button
              key={id}
              type="button"
              className={cn(
                "px-4 py-2 rounded-full text-nowrap",
                currentIndex === index
                  ? "bg-[#E3CDFE] text-[#8C63FF]"
                  : "border bg-white",
              )}
              onClick={() => handlePreviewChange(index)}
            >
              {label}
            </button>
          ))}
        </div>

        {(buttonData[currentIndex].id === "socialMedia" ||
          buttonData[currentIndex].id === "storySize") && (
          <div className="w-[92%] mx-auto text-center bg-[#E3CDFE] border border-[#E3CDFE] rounded-2xl px-2 py-2 absolute bottom-[10rem] scale-75">
            <button
              type="button"
              onClick={handleDownload}
              className="flex-1 w-full px-2 py-2 text-sm bg-[#8C63FF90] rounded-full text-white"
            >
              Download Preview
            </button>
          </div>
        )}
      </section>
    </Suspense>
  );
};

const InfoPreview = memo(MemoInfoPreview);

export default InfoPreview;
