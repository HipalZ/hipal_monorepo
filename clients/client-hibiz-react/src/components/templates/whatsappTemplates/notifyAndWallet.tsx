import useBusinessData from "@/components/store/useBusinessData";
import useWhatsapp, { Step } from "@/components/store/useWhatsapp";
import { cn } from "@/components/utils/helper";
import { useWalletBalance } from "@/hooks/useTemplates";
import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";
import { useQuery } from "@tanstack/react-query";
import { memo, useCallback } from "react";
import { BsWallet2 } from "react-icons/bs";
import { GrHistory } from "react-icons/gr";

const MemoNotifyAndWallet = () => {
  const { walletBalance, step, setStep } = useWhatsapp((s) => ({
    walletBalance: s.walletBalance,
    step: s.step,
    setStep: s.setStep,
  }));
  const businessData = useBusinessData((s) => s.businessData);
  const { getWalletBalance, getWalletHistory } = useWalletBalance();

  const handleWallethistory = useCallback(() => {
    if (step === Step.WALLET_HISTORY) {
      setStep(Step.SETUP);
    } else {
      setStep(Step.WALLET_HISTORY);
    }
  }, [setStep, step]);

  const handleRecharge = useCallback(() => {
    if (step === Step.TRANSACTIONS) {
      setStep(Step.SETUP);
    } else {
      setStep(Step.TRANSACTIONS);
    }
  }, [setStep, step]);

  useQuery({
    queryKey: ["walletBalance", businessData?._id],
    queryFn: getWalletBalance,
    enabled: !!businessData?._id,
  });

  useQuery({
    queryKey: ["walletHistory", businessData?._id, Step.WALLET_HISTORY],
    queryFn: getWalletHistory,
    enabled: !!businessData?._id && step === Step.WALLET_HISTORY,
  });

  return (
    <div className="flex items-center justify-end gap-2 -mr-4 lg:gap-4 md:mr-0">
      {/* Notifications */}
      {step === Step.SETUP && (
        <>
          <div className="relative flex items-center">
            <button
              title="Wallet History"
              onClick={handleWallethistory}
              type="button"
              className="p-2 rounded-full on_active_bounce"
            >
              <GrHistory size={22} />
            </button>
          </div>
          {/* Wallet */}
          <div
            title="Balance"
            onClick={handleRecharge}
            onKeyDown={handleRecharge}
            className="flex items-center gap-2 px-3 py-1 bg-white rounded-full shadow on_active_bounce"
          >
            <BsWallet2 className="text-lg" />
            <span className="font-semibold">{walletBalance}</span>
          </div>
        </>
      )}
    </div>
  );
};

const NotifyAndWallet = memo(MemoNotifyAndWallet);
export default NotifyAndWallet;
