import useWhatsapp, { whastappSteps } from "@/components/store/useWhatsapp";
import MainFormWhatzApp from "@/components/templates/whatsappTemplates/mainFormWhatzApp";
import { memo } from "react";

const MemoWhatzapp = () => {
  const { whatzAppSteps } = useWhatsapp((s) => ({
    whatzAppSteps: s.whatzAppSteps,
  }));
  return (
    <main className="min-h-[100dvh]">
      {whatzAppSteps === whastappSteps.MainForm && <MainFormWhatzApp />}
    </main>
  );
};

const Whatzapp = memo(MemoWhatzapp);
export default Whatzapp;
