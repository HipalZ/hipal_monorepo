"use client";
import { memo } from "react";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { useError } from "@/components/store/useError";
import BottomPopUp from "../bottomPopUp";

const MemoErrorPopup = () => {
    const { openErrorModal, error, resetErrorStates } = useError();
    const onClose = () => {
        resetErrorStates();
    };

    return (
        <BottomPopUp height="h-[30dvh]" onClose={onClose} show={openErrorModal} bottomCross hide>
            <Card className="w-full max-w-md mx-auto pt-[1rem] pb-[3rem] text-center border-none shadow-none">
                <CardHeader>
                    <CardTitle className="text-xl font-semibold text-red-600">
                        {error}
                    </CardTitle>
                </CardHeader>
            </Card>
        </BottomPopUp>
    );
};

const ErrorPopup = memo(MemoErrorPopup);
export default ErrorPopup;
