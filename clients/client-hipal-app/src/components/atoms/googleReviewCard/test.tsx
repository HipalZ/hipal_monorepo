import { memo, useMemo, useState } from "react";
import { useLogin } from "@/components/store/useLogin";
import { usePathname } from "next/navigation";
import dynamic from "next/dynamic";
import SkeletonLoader from "../loader/skeletonLoader";
import LoadingSpinnerCircle from "../loader";
import { usePaymentStore } from "@/components/store/usePaymentStore";
import BottomPopUp from "../bottomPopUp";
import TestReviewPage from "./testReviewpage";

const ExplorePageReviewCard = dynamic(() => import("./explorePage"), {
    ssr: false,
    loading: () => <SkeletonLoader />,
});

const GoogleReviewPagePopup = dynamic(() => import("./reviewPage"), {
    ssr: false,
    loading: () => <LoadingSpinnerCircle />,
});

const MemoGoogleReviewCard = () => {
    const { setCheckLogin } = usePaymentStore()
    const [openReviewModal, setOpenReviewModal] = useState(true);

    const {
        setReviewPopup,
        isLogin,
        setDirection,
    } = useLogin((s) => ({
        setReviewPopup: s.setReviewPopup,
        isLogin: s.isLogin,
        setDirection: s.setDirection,
    }));

    const path = usePathname();
    const isReviewPage = useMemo(() => path.includes("review"), [path]);

    const signInWithGoogle = async () => {
        if (!isLogin) {
            setDirection("explore-googleReview");
            setReviewPopup(false);
            setCheckLogin(true);
            return;
        }
        // if (googleReviewCount && googleReviewCount > 1) {
        //     setReviewPopup(false);
        //     return toast.error("Review Already Submitted");
        // }
        setOpenReviewModal(true);
    };

    return (
        <>
            {isReviewPage ? (
                <GoogleReviewPagePopup signInWithGoogle={signInWithGoogle} />
            ) : (
                <ExplorePageReviewCard signInWithGoogle={signInWithGoogle} />
            )}
            {openReviewModal &&
                <BottomPopUp hide height="100dvh" onClose={() => setOpenReviewModal(false)} show={openReviewModal}>
                    <TestReviewPage />
                </BottomPopUp>
            }
        </>
    );
};

const GoogleReviewCardTest = memo(MemoGoogleReviewCard);
export default GoogleReviewCardTest;
