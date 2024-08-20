import { memo, useCallback } from "react";
import MemoizedHeader from "@/components/molecules/header";
import Hi from "@/assets/svg/hi.svg";
import { FaArrowLeft } from "react-icons/fa";
import useMenuPageStore from "@/components/store/useMenuStorage";
import CreateAddon from "./createAddon";
import CreateChoice from "./addChoice";
import LinkItems from "../dish/[editDish]/linkItems";
import EditAddon from "./editAddon";

const MemoAddonForm = () => {
  const { addOnToggle, setAddOnToggle, setOpenMenu, addOnId } =
    useMenuPageStore((s) => ({
      addOnToggle: s.addOnToggle,
      setAddOnToggle: s.setAddOnToggle,
      setOpenMenu: s.setOpenMenu,
      addOnId: s.addOnId,
    }));

  const goBack = useCallback(() => {
    if (addOnId !== "") {
      setAddOnToggle("EDIT_ADDON");
      return;
    }
    switch (addOnToggle) {
      case "ADD_ON":
        setOpenMenu(false);
        break;
      case "ADD_CHOICE":
        setAddOnToggle("ADD_ON");
        break;
      case "LINK_DISHES":
        setAddOnToggle("ADD_ON");
        break;
      case "EDIT_ADDON":
        setOpenMenu(false);
        break;
      default:
        break;
    }
  }, [addOnToggle]);
  return (
    <>
      {" "}
      <header className="sticky top-0 z-10 w-full rounded-t-2xl bg-base-100">
        <MemoizedHeader
          title={addOnId !== "" ? "Edit Addon" : "Create Addon"}
          onBack={goBack}
          leftIcon={<FaArrowLeft />}
          rightImage={Hi}
          isIconBusinessShow={false}
        />
      </header>
      {addOnToggle === "ADD_ON" && <CreateAddon />}
      {addOnToggle === "ADD_CHOICE" && <CreateChoice />}
      {addOnToggle === "LINK_DISHES" && <LinkItems />}
      {addOnToggle === "EDIT_ADDON" && <EditAddon />}
    </>
  );
};
const AddOnForm = memo(MemoAddonForm);

export default AddOnForm;
