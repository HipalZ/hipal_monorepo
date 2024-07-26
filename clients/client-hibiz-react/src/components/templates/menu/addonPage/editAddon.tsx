import Background from "@/components/atom/feildBackground";
import useMenuPageStore from "@/components/store/useMenuStorage";
import {
  Menu,
  MenuButton,
  MenuItem,
  MenuItems,
  Switch,
} from "@headlessui/react";
import { memo, useCallback, useState } from "react";
import { BiPlus } from "react-icons/bi";
import { FaAngleDown } from "react-icons/fa";
import EditChoice from "./editChoice";
import toast from "react-hot-toast";
import { useUpdateAddon } from "@/hooks/useAddOn";
import useBusinessData from "@/components/store/useBusinessData";
import LoadingSpinner from "@/components/atom/loadingSpinner";
import BottomButton from "@/components/atom/bottomButton";

const count = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

const MemoEditAddon = () => {
  const {
    availability,
    visibility,
    addOnName,
    setAvailability,
    setVisibility,
    setAddOnName,
    maxChoices,
    minChoices,
    setMaxChoices,
    setMinChoices,
    setAddOnToggle,
    resetChoiceFields,
    addOnToggle,
    choices,
    addOnId,
    addOnChoice,
  } = useMenuPageStore((s) => ({
    availability: s.availability,
    visibility: s.visibility,
    addOnName: s.addOnName,
    minChoices: s.minChoices,
    maxChoices: s.maxChoices,
    setAvailability: s.setAvailability,
    setVisibility: s.setVisibility,
    setAddOnName: s.setAddOnName,
    setMinChoices: s.setMinChoices,
    setMaxChoices: s.setMaxChoices,
    setAddOnToggle: s.setAddOnToggle,
    resetChoiceFields: s.resetChoiceFields,
    addOnToggle: s.addOnToggle,
    choices: s.choices,
    addOnId: s.addOnId,
    addOnChoice: s.addOnChoice,
  }));

  const [maxValueError, setMaxValueError] = useState<boolean>(false);

  const businessData = useBusinessData((s) => s.businessData);

  const { isPending, mutate: updateAddon } = useUpdateAddon();

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
    if (maxChoices <= 0 || addOnName.trim() === "") {
      return toast.error("Please fill all the fields");
    }
    const data = {
      _id: addOnId,
      businessId: businessData?._id,
      name: addOnName,
      choices: choices,
      choiceType: addOnChoice,
      availability: availability,
      visibility: visibility,
      compulsory: minChoices,
      addOnMaxQuantity: maxChoices,
    };
    updateAddon(data);
  }, [
    addOnName,
    choices,
    availability,
    visibility,
    addOnChoice,
    minChoices,
    maxChoices,
    addOnId,
    businessData,
  ]);

  if (isPending) {
    return (
      <div>
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div>
      {" "}
      <section className="gap-4 mx-6 lg:flex lf:mx-0">
        <article className="flex justify-between px-4 py-3 my-4 bg-white rounded-full lg:flex-1 lg:mt-6">
          <h1 className="font-semibold opacity-50">Category visibility</h1>
          <Switch
            checked={visibility}
            onChange={setVisibility}
            className="group inline-flex h-6 w-11 items-center rounded-full bg-gray-200 transition data-[checked]:bg-green-400"
          >
            <span className="size-4 translate-x-1 rounded-full bg-white transition group-data-[checked]:translate-x-6" />
          </Switch>
        </article>
        <article className="flex justify-between px-4 py-3 my-4 bg-white rounded-full lg:flex-1 lg:mt-6">
          <h1 className="font-semibold opacity-50">Category Availability</h1>
          <Switch
            checked={availability}
            onChange={setAvailability}
            className="group inline-flex h-6 w-11 items-center rounded-full bg-gray-200 transition data-[checked]:bg-green-400"
          >
            <span className="size-4 translate-x-1 rounded-full bg-white transition group-data-[checked]:translate-x-6" />
          </Switch>
        </article>
      </section>
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
      {choices.length > 0 && (
        <BottomButton
          buttons={[{ text: "Update", onClick: saveAddOnData, type: "button" }]}
        />
      )}
    </div>
  );
};

const EditAddon = memo(MemoEditAddon);

export default EditAddon;
