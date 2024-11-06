import { useState, useRef, memo, Suspense, lazy } from "react";
import useCouponsStore from "@/components/store/useCouponsStore";
import { cn } from "@hi/common";
import { toPng } from "html-to-image";
import LoadingSpinner from "@/components/atom/loadingSpinner";

const AfterGrabbingCoupon = lazy(
  () => import("./previewTypes/afterGrabbingCard"),
);
const BeforeGrabbingCoupon = lazy(
  () => import("./previewTypes/beforeGrabbing"),
);
const SmallCoupon = lazy(() => import("./previewTypes/smallCoupon"));
const SocialMedia = lazy(() => import("./previewTypes/socialMedia"));
const StorySize = lazy(() => import("./previewTypes/storySize"));
const Background = lazy(() => import("@/components/atom/feildBackground"));
const BottomButton = lazy(() => import("@/components/atom/bottomButton"));

const buttonData = [
  { id: "beforeGrabbing", label: "Before Grabbing" },
  { id: "afterGrabbing", label: "After Grabbing" },
  { id: "smallCoupon", label: "Home Page" },
  { id: "socialMedia", label: "Social Media" },
  { id: "storySize", label: "Story Size" },
];
const MemoCustom = () => {
  const {
    promoteOnBill,
    promote,
    cashbackAvailable,
    setPromoteOnBill,
    setPromote,
    setCashbackAvailable,
    setSelectedPage,
    selectFlow,
  } = useCouponsStore((s) => ({
    promoteOnBill: s.promoteOnBill,
    promote: s.promote,
    cashbackAvailable: s.cashbackAvailable,
    setPromoteOnBill: s.setPromoteOnBill,
    setPromote: s.setPromote,
    setCashbackAvailable: s.setCashbackAvailable,
    setSelectedPage: s.setSelectedPage,
    selectFlow: s.selectFlow,
  }));

  const [selectedPreview, setSelectedPreview] = useState("beforeGrabbing");
  const previewRef = useRef<HTMLDivElement>(null);

  const handleDownload = async () => {
    if (previewRef.current === null) {
      return;
    }

    const previewElement = previewRef.current as HTMLDivElement;
    const originalBackgroundColor = previewElement.style.backgroundColor;

    try {
      const dataUrl = await toPng(previewElement);

      const link = document.createElement("a");
      link.download = `${selectedPreview}.png`;
      link.href = dataUrl;
      link.click();
    } catch (error) {
      console.error("Failed to capture the preview:", error);
    } finally {
      previewElement.style.backgroundColor = originalBackgroundColor;
    }
  };

  return (
    <Suspense fallback={<LoadingSpinner />}>
      <section className="flex flex-col gap-6 lg:flex-row pb-[7rem]">
        <div className="flex-1 p-2 rounded-2xl">
          <div className="p-4 rounded-xl" ref={previewRef}>
            {selectedPreview === "beforeGrabbing" && <BeforeGrabbingCoupon />}
            {selectedPreview === "afterGrabbing" && <AfterGrabbingCoupon />}
            {selectedPreview === "smallCoupon" && <SmallCoupon />}
            {selectedPreview === "socialMedia" && <SocialMedia />}
            {selectedPreview === "storySize" && <StorySize />}
          </div>
          {selectedPreview === "storySize" ||
          selectedPreview === "socialMedia" ? (
            <div className="w-[92%] mx-auto text-center bg-[#8C63FF50] border border-[#ffffff70] rounded-2xl px-2 py-2 mt-6">
              <button
                type="button"
                onClick={handleDownload}
                className="flex-1 w-full px-2 py-2 text-sm text-black bg-[#8C63FF] text-white rounded-full"
              >
                Download Preview
              </button>
            </div>
          ) : null}
        </div>

        <Background className="">
          <div className="flex flex-wrap flex-1 gap-4 mb-6 text-sm ">
            {buttonData.map(({ id, label }) => (
              <button
                key={id}
                type="button"
                className={cn(
                  "px-4 py-2 rounded-full text-nowrap",
                  selectedPreview === id
                    ? "bg-[#E3CDFE] text-[#8C63FF]"
                    : "border",
                )}
                onClick={() => setSelectedPreview(id)}
              >
                {label}
              </button>
            ))}
          </div>

          <div className="flex flex-col gap-4 px-4">
            {selectFlow === "GRAB" && (
              <>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="promoteOnBill"
                    checked={promoteOnBill}
                    className="text-black rounded"
                    onChange={(e) => setPromoteOnBill(e.target.checked)}
                  />
                  <label htmlFor="promoteOnBill">
                    Promote this after every payment bill
                  </label>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="promote"
                    checked={promote}
                    className="text-black rounded"
                    onChange={(e) => setPromote(e.target.checked)}
                  />
                  <label htmlFor="promote">Promote this in explore page</label>
                </div>
              </>
            )}

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="cashbackAvailable"
                checked={cashbackAvailable}
                className="text-black rounded"
                onChange={(e) => setCashbackAvailable(e.target.checked)}
              />
              <label htmlFor="cashbackAvailable">
                This coupon will have cashback
              </label>
            </div>
          </div>
        </Background>

        <BottomButton
          fixed
          buttons={[
            {
              text: "Back",
              onClick: () => setSelectedPage("PREVIEW"),
            },
            {
              text: "Save & Next",
              onClick: () => setSelectedPage("Terms"),
            },
          ]}
        />
      </section>
    </Suspense>
  );
};

const Custom = memo(MemoCustom);
export default Custom;
