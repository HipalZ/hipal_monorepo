import { memo } from "react";
import { useError } from "../store/useError";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const MemoErrorPopup = () => {
  const openErrorModal = useError((s) => s.openErrorModal);
  const error = useError((s) => s.error);
  const resetErrorStates = useError((s) => s.resetErrorStates);

  const onClose = () => {
    resetErrorStates();
  };

  return (
    <Dialog open={openErrorModal} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md min-h-[10rem]">
        <DialogHeader>
          <DialogTitle className="text-xl mt-6 font-semibold text-red-600">
            {error || "Access denied. Please contact your administrator."}
          </DialogTitle>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
};

const ErrorPopup = memo(MemoErrorPopup);
export default ErrorPopup;
