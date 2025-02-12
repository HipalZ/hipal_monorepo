import { memo } from "react";
import { useError } from "../store/useError";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import PopUp from "../atom/popUp";

const MemoErrorPopup = () => {
  const { openErrorModal, error, resetErrorStates } = useError();

  const onClose = () => {
    resetErrorStates();
  };

  return (
    <PopUp height="h-[30dvh]" onClose={onClose} show={openErrorModal}>
      <Card className="w-full max-w-md mx-auto mt-12 text-center border-none shadow-none">
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-red-600">
            {error}
          </CardTitle>
        </CardHeader>
       
      </Card>
    </PopUp>
  );
};

const ErrorPopup = memo(MemoErrorPopup);
export default ErrorPopup;
