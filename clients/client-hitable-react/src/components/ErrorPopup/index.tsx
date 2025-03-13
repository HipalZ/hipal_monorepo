import { memo } from "react";
import BottomPopUp from "../atoms/universalPopup";
import { useError } from "../store/useError";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const MemoErrorPopup = () => {
  const { openErrorModal, error, resetErrorStates } = useError();

  const onClose = () => {
    resetErrorStates();
  };

  return (
    <BottomPopUp height="h-[30dvh]" onClose={onClose} show={openErrorModal} bottomCross hide>
      <Card className="w-full max-w-md mx-auto mt-12 text-center border-none shadow-none">
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-red-600">
            You are not authorized to this service
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">{error || "Access denied. Please contact your administrator."}</p>
        </CardContent>
      </Card>
    </BottomPopUp>
  );
};

const ErrorPopup = memo(MemoErrorPopup);
export default ErrorPopup;
