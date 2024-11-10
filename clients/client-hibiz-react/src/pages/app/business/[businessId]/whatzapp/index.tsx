import MainFormWhatzApp from "@/components/templates/whatsappTemplates/mainFormWhatzApp";
import { memo } from "react";

const MemoWhatzapp = () => {
  return (
    <main>
      <MainFormWhatzApp />
    </main>
  );
};

const Whatzapp = memo(MemoWhatzapp);
export default Whatzapp;
