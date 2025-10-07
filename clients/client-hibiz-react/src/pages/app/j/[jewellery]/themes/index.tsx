import { lazy } from "react";
import Header from "@/components/molecules/header";

const JewellerySetting = lazy(
  () => import("@/components/jewellery/JewellerySetting.tsx"),
);

const MemoMainBusinessPage = () => {
  return (
    <main className="business_control_background">
      <div className="linear_gradient_background">
        <Header title="Themes" />
      </div>
      <JewellerySetting />
    </main>
  );
};

const MainBusinessPage = MemoMainBusinessPage;
export default MainBusinessPage;
