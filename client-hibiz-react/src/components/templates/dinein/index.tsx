import { memo, startTransition, useEffect, useMemo } from "react";
import { BsChevronLeft } from "react-icons/bs";
import Header from "@/components/molecules/header";
import Hi from "@/assets/svg/hi.svg";
import SubheaderButtonList from "@/components/atom/subHeaderBtn";
import { BsBoundingBoxCircles } from "react-icons/bs";
import { useSelectedButtonStore } from "@/components/store/useSelectBtn";
import Zones from "@/components/molecules/zones";
import DineInDashboard from "@/components/molecules/dineInDashboard";
import { MdOutlineTableBar } from "react-icons/md";
import Tables from "@/components/molecules/tables";
import { useSelectedIcon } from "@/components/store/useSelectedIcon";
import { useNavigate, useParams } from "react-router-dom";
import { routeToDashboard } from "@/components/utils/routes";

const classCard = {
  text: "text-xl",
  background: "bg-[#2B354D]",
  font: "text-4xl",
  bg: "bg-[#2F80ED]/10",
  color: "text-white",
};
const buttons = [
  {
    Icon: BsBoundingBoxCircles,
    text: "Zones",
    class: classCard,
  },
  {
    text: "Tables",
    Icon: MdOutlineTableBar,
    class: classCard,
  },
];
type ComponentMapType = {
  [key in
  | "Dashboard"
  | "Zones"
  | "Kitchens"
  | "Settings"
  | "Tables"
  | "Items"]: JSX.Element;
};

function useDineInBusinessLogic() {
  const { businessId } = useParams<{ businessId: string }>();
  const { setSelectedButton, selectedButton } = useSelectedButtonStore();

  const handleClick = (text: string) => {
    setSelectedButton(text);
  };

  return { businessId, selectedButton, handleClick };
}

const DineIn = memo(() =>{
  const { setSelectedIcon, selectedSubIcon } = useSelectedIcon();
  const { selectedButton, handleClick ,businessId} = useDineInBusinessLogic();
  const { setSelectedButton } = useSelectedButtonStore();

  const ComponentToRender = useMemo(() => {
    const componentsMap: ComponentMapType = {
      Dashboard: (
        <DineInDashboard buttons={buttons} handleClick={handleClick} />
      ),
      Zones: <Zones />,
      Tables: <Tables />,
    };

    return componentsMap[selectedButton] || null;
  }, [selectedButton, handleClick]);

  useEffect(() => {
    setSelectedButton("Zones");
  }, []);

  const navigate = useNavigate();

  const handleBack = () => {
    startTransition(() => {
      navigate(routeToDashboard(businessId as string));
    })
    setSelectedIcon("")
  }

  return (
    <>
      {selectedSubIcon !== "addZones" && <div className="bg-[#f5f5f5] sticky z-20 top-0">
        <Header
          title="Dine In"
          onBack={handleBack}
          leftIcon={<BsChevronLeft />}
          centerImage={Hi}
          rightImage={Hi}
          isIconBusinessShow={true}
        />
        <SubheaderButtonList buttons={buttons} />
        <div className="flex justify-between items-center mt-2 px-6 pb-4 border-b border-[#cacaca]">
          <span className="flex text-2xl">{selectedButton}</span>
        </div>
      </div>}
      {ComponentToRender}
    </>
  );
})

export default DineIn

