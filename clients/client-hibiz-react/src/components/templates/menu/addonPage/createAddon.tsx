import Background from "@/components/atom/feildBackground";
import useMenuPageStore, {
  type Choice,
  type AddonChoice,
} from "@/components/store/useMenuStorage";
import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";
import { cn } from "@hi/common";
import { memo, useCallback, useState } from "react";
import toast from "react-hot-toast";
import { BiPlus } from "react-icons/bi";
import { FaAngleDown } from "react-icons/fa";
import { RiLinkUnlink } from "react-icons/ri";
import EditChoice from "./editChoice";
import { useSaveAddOn } from "@/hooks/useAddOn";
import useBusinessData from "@/components/store/useBusinessData";

const count = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

const MemoCreateAddon = () => {
  const {
    addOnName,
    addOnToggle,
    setAddOnName,
    setAddOnToggle,
    addOnChoice,
    maxChoices,
    minChoices,
    setAddOnChoice,
    setMaxChoices,
    setMinChoices,
    recommendationIds,
    resetChoiceFields,
    choices,
  } = useMenuPageStore((s) => ({
    addOnToggle: s.addOnToggle,
    addOnName: s.addOnName,
    addOnChoice: s.addOnChoice as AddonChoice,
    choices: s.choices,
    recommendationIds: s.recommendationIds,
    minChoices: s.minChoices,
    maxChoices: s.maxChoices,
    setAddOnToggle: s.setAddOnToggle,
    setAddOnName: s.setAddOnName,
    setMinChoices: s.setMinChoices,
    setMaxChoices: s.setMaxChoices,
    setAddOnChoice: s.setAddOnChoice,
    resetChoiceFields: s.resetChoiceFields,
  }));

  const businessData = useBusinessData((s) => s.businessData);

  const { isPending, mutate: saveAddOn } = useSaveAddOn();

  const [maxValueError, setMaxValueError] = useState<boolean>(false);

  const handleSetMinChoices = useCallback(
    (value: number) => {
      if (value > maxChoices) {
        setMaxValueError(true);
      }
      if (value <= maxChoices) {
        setMinChoices(value);
        setMaxValueError(false);
      }
    },
    [minChoices, maxChoices, maxValueError],
  );

  const handleSetMaxChoices = useCallback((value: number) => {
    if (value >= minChoices) {
      setMaxChoices(value);
    }
  }, []);

  const goToChoices = useCallback(() => {
    if (maxChoices <= 0 || addOnName.trim() === "") {
      return toast.error("Please fill all the fields");
    }
    resetChoiceFields();
    setAddOnToggle("ADD_CHOICE");
  }, [maxChoices, addOnName, addOnToggle]);

  const saveAddOnData = useCallback(() => {
    if (addOnName.trim() === "") {
      return toast.error("Addon name is required");
    }
    if (choices.length === 0) {
      return toast.error("Please add choices");
    }

    const payload = {
      name: addOnName,
      choices: choices as Choice[],
      choiceType: addOnChoice,
      addOnMaxQuantity: maxChoices,
      compulsory: minChoices,
      businessId: businessData?._id.toString() || "",
      dishIds: recommendationIds,
    };

    saveAddOn(payload);
  }, [
    addOnName,
    choices,
    addOnChoice,
    maxChoices,
    minChoices,
    businessData?._id,
  ]);

  return (
    <>
      {" "}
      <section className="flex flex-col lg:flex-row">
        <article className="flex-1 mx-6 lg:mt-6">
          <label className="font-semibold opacity-50" htmlFor="name">
            Addon Name*
          </label>
          <Background>
            <input
              type="text"
              id="name"
              placeholder="Enter Addon Name"
              value={addOnName}
              maxLength={21}
              onChange={(e) => setAddOnName(e.target.value)}
              className="w-full p-2 bg-white border border-black rounded-xl focus:ring-0 focus:bg-white focus:border-[#8C63FF]"
            />
          </Background>
        </article>
        <article className="flex-1 mx-6 mt-4 lg:mt-6">
          <label className="font-semibold opacity-50" htmlFor="name">
            Choices per Add-on
          </label>
          <Background>
            <section className="flex flex-col">
              <article className="flex w-full mb-2">
                <article className="relative">
                  <label htmlFor="min-choice">Min no. of choices</label>
                  {maxValueError && (
                    <p className="absolute text-xs text-red-500 text-nowrap">
                      Min choices should be less than max choices
                    </p>
                  )}
                </article>
                <Menu as="div" className="relative ml-auto">
                  <MenuButton className="inline-flex items-center gap-2 rounded-xl bg-white border border-black py-1.5 px-4 text-sm font-semibold text-black">
                    {minChoices}
                    <FaAngleDown className="w-4 h-4" />
                  </MenuButton>
                  <MenuItems className="absolute top-0 z-20 w-24 origin-top-right bg-white border right-16 rounded-xl">
                    {count.map((choice) => (
                      <MenuItem
                        key={choice}
                        as="button"
                        onClick={() => handleSetMinChoices(choice)}
                        className="w-full px-4 py-2 text-sm text-left text-black hover:bg-gray-100"
                      >
                        {choice}
                      </MenuItem>
                    ))}
                  </MenuItems>
                </Menu>
              </article>
              <article className="flex w-full">
                <label htmlFor="max-choice">Max no. of choices</label>
                <Menu as="div" className="relative ml-auto">
                  <MenuButton className="inline-flex items-center gap-2 rounded-xl bg-white border border-black py-1.5 px-4 text-sm font-semibold text-black">
                    {maxChoices}
                    <FaAngleDown className="w-4 h-4" />
                  </MenuButton>
                  <MenuItems className="absolute top-0 z-20 w-24 origin-top-right bg-white border right-16 rounded-xl">
                    {count.map((choice) => (
                      <MenuItem
                        key={choice}
                        as="button"
                        onClick={() => handleSetMaxChoices(choice)}
                        className="w-full px-4 py-2 text-sm text-left text-black hover:bg-gray-100"
                      >
                        {choice}
                      </MenuItem>
                    ))}
                  </MenuItems>
                </Menu>
              </article>
            </section>
          </Background>
        </article>
      </section>
      <article className="mx-6 mt-4 lg:mt-6">
        <label className="font-semibold opacity-50" htmlFor="name">
          Choice Type
        </label>
        <Background>
          <article className="bg-white rounded-xl">
            <label className="text-xs font-semibold opacity-50" htmlFor="name">
              Select one type*
            </label>
            <article className="flex w-full mt-4">
              <button
                type="button"
                className={cn(
                  "p-6 rounded-2xl flex-1 mx-2 text-left",
                  addOnChoice === "NUMBER"
                    ? "bg-[#F1E9FB] text-[#8C63FF]"
                    : "bg-[#f4f4f490]",
                )}
                onClick={() => setAddOnChoice("NUMBER")}
              >
                <button
                  type="button"
                  className="flex px-4 py-1 space-x-2 text-xs border border-black rounded-full"
                >
                  <span>-</span>
                  <span>2</span>
                  <span>+</span>
                </button>
                <h6 className="mt-2"> as Number</h6>
              </button>
              <button
                type="button"
                className={cn(
                  "p-6 rounded-2xl flex-1 mx-2 text-left",
                  addOnChoice === "CHECKBOX"
                    ? "bg-[#F1E9FB] text-[#8C63FF]"
                    : "bg-[#f4f4f490]",
                )}
                onClick={() => setAddOnChoice("CHECKBOX")}
              >
                <input
                  type="checkbox"
                  checked
                  defaultChecked
                  className="checkbox checkbox-[#8C63FF]"
                />
                <h6 className="mt-2">as Checkbox</h6>
              </button>
            </article>
          </article>
        </Background>
      </article>
      <section className="flex items-center justify-between mx-6 mt-4">
        <label className="font-semibold opacity-60" htmlFor="Mange-choice">
          Manage Choices
        </label>
        <button
          type="button"
          onClick={goToChoices}
          className="flex items-center px-4 py-2 text-xs text-white bg-black rounded-full"
        >
          <BiPlus className="mr-2" />
          Add Choices
        </button>
      </section>
      <EditChoice />
      <article className="mx-6 mt-4 lg:mt-6">
        <label className="font-semibold opacity-50" htmlFor="name">
          Recommendation ({recommendationIds?.length})
        </label>
        <Background>
          <button
            type="button"
            onClick={() => setAddOnToggle("LINK_DISHES")}
            className="bg-[#f4f4f4] w-full py-2 rounded-full flex items-center justify-center"
          >
            <RiLinkUnlink className="mr-2" /> Link Recommendation
          </button>
        </Background>
      </article>
      {choices.length > 0 && (
        <button onClick={saveAddOnData} className="bottom_btn" type="button">
          Save Addon
        </button>
      )}
    </>
  );
};
const CreateAddon = memo(MemoCreateAddon);
export default CreateAddon;
