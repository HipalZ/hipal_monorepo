import { IThemes } from "@/components/types/businessData";
import { memo } from "react";

type Props = {
    setIsHiCodeModalOpen: (value: boolean) => void;
    themes: IThemes | undefined;
}

const RedeemButton = (props: Props) => {
    const { setIsHiCodeModalOpen } = props;

    return (
        <div className="fixed w-[100%] max-w-[30rem] bottom-0 z-20 flex items-center justify-between px-6 py-4 space-x-4 shadow-2xl bg-base-100 shadow-base-100">
            <button
                type="button"
                onClick={() => setIsHiCodeModalOpen(true)}
                className="w-full px-4 py-3 bg-primary text-primary-content rounded-2xl"
            >
                Redeem
            </button>
        </div>
    )
};

const MemoRedeemButton = memo(RedeemButton);
export default MemoRedeemButton;