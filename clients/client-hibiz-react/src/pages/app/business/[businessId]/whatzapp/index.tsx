import MainFormWhatzApp from "@/components/templates/whatsappTemplates/mainFormWhatzApp";
import { memo } from "react";

const MemoWhatzapp = () => {
  return (
    <main className="min-h-[100dvh]">
      <MainFormWhatzApp />
    </main>
  );
};

const Whatzapp = memo(MemoWhatzapp);
export default Whatzapp;
