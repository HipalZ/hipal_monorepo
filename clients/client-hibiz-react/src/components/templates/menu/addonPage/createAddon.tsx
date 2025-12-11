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
import { useSaveAddOn } from "@/hooks/useAddOn";
import BottomButton from "@/components/atom/bottomButton";
import LoadingSpinner from "@/components/atom/loadingSpinner";
import { useParams } from "react-router-dom";
import EditChoice from "./editChoice";
import { getChoiceValidity } from "./addChoice"; // 👈 helper from choices page

const count = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

const MemoCreateAddon = () => {
  const addOnName = useMenuPageStore((s) => s.addOnName);
  const setAddOnName = useMenuPageStore((s) => s.setAddOnName);
  const addOnChoice = useMenuPageStore((s) => s.addOnChoice as AddonChoice);
  const choices = useMenuPageStore((s) => s.choices);
  const recommendationIds = useMenuPageStore((s) => s.recommendationIds);
  const minChoices = useMenuPageStore((s) => s.minChoices);
  const maxChoices = useMenuPageStore((s) => s.maxChoices);
  const setAddOnChoice = useMenuPageStore((s) => s.setAddOnChoice);
  const setMaxChoices = useMenuPageStore((s) => s.setMaxChoices);
  const setMinChoices = useMenuPageStore((s) => s.setMinChoices);
  const setAddOnToggle = useMenuPageStore((s) => s.setAddOnToggle);
  const resetChoiceFields = useMenuPageStore((s) => s.resetChoiceFields);

  const { businessId, menuId } = useParams<{
    businessId?: string;
    menuId: string;
  }>();

  const { isPending, mutate: saveAddOn } = useSaveAddOn();

  const [maxValueError, setMaxValueError] = useState(false);

  const handleSetMinChoices = useCallback(
    (value: number) => {
      if (value > maxChoices) {
        setMaxValueError(true);
        return;
      }
      setMinChoices(value);
      setMaxValueError(false);
    },
    [maxChoices, setMinChoices],
  );

  const handleSetMaxChoices = useCallback(
    (value: number) => {
      if (value >= minChoices) {
        setMaxChoices(value);
        setMaxValueError(false);
      } else {
        setMaxValueError(true);
      }
    },
    [minChoices, setMaxChoices],
  );

  const goToChoices = useCallback(() => {
    if (addOnName.trim() === "") {
      toast.error("Addon name is required");
      return;
    }
    if (maxChoices === 0) {
      toast.error("Please set max choices");
      return;
    }
    resetChoiceFields();
    setAddOnToggle("ADD_CHOICE");
  }, [addOnName, maxChoices, resetChoiceFields, setAddOnToggle]);

  const saveAddOnData = useCallback(() => {
    if (addOnName.trim() === "") {
      toast.error("Addon name is required");
      return;
    }

    if (maxChoices === 0) {
      toast.error("Please set max choices");
      return;
    }

    if (minChoices > maxChoices) {
      toast.error("Min choices cannot be greater than max choices");
      setMaxValueError(true);
      return;
    }

    if (choices.length === 0) {
      toast.error("Please add choices");
      return;
    }

    const invalidChoice = choices.find((c) => !getChoiceValidity(c).isValid);
    if (invalidChoice) {
      toast.error("Some choices are incomplete. Please fix them first.");
      return;
    }

    const payload = {
      name: addOnName,
      choices: choices as Choice[],
      choiceType: addOnChoice,
      addOnMaxQuantity: maxChoices,
      compulsory: minChoices,
      businessId: businessId || "",
      menuId,
      dishIds: recommendationIds,
    };
    saveAddOn(payload);
  }, [
    addOnName,
    maxChoices,
    minChoices,
    choices,
    addOnChoice,
    businessId,
    menuId,
    recommendationIds,
    saveAddOn,
  ]);

  if (isPending) {
    return (
      <div>
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <>
      {/* Addon name + choices per add-on */}
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
              maxLength={50}
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
              {/* Max */}
              <article className="flex w-full mb-2 items-center">
                <label htmlFor="max-choice" className="font-medium">
                  Max no. of choices
                </label>
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

              {/* Min */}
              <article className="flex w-full items-center">
                <article className="relative">
                  <label htmlFor="min-choice" className="font-medium">
                    Min no. of choices
                  </label>
                  {maxValueError && (
                    <p className="absolute text-xs text-red-500 text-nowrap">
                      Min choices should be ≤ max choices
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
            </section>
          </Background>
        </article>
      </section>

      {/* Choice type */}
      <article className="mx-6 mt-4 lg:mt-6">
        <label className="font-semibold opacity-50" htmlFor="name">
          Choice Type
        </label>
        <Background>
          <article className="bg-white rounded-xl p-3">
            <label className="text-xs font-semibold opacity-50" htmlFor="name">
              Select one type*
            </label>
            <article className="flex w-full mt-4">
              <button
                type="button"
                className={cn(
                  "p-4 rounded-2xl flex-1 mx-2 text-left",
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
                <h6 className="mt-2 text-sm font-semibold">as Number</h6>
              </button>

              <button
                type="button"
                className={cn(
                  "p-4 rounded-2xl flex-1 mx-2 text-left",
                  addOnChoice === "CHECKBOX"
                    ? "bg-[#F1E9FB] text-[#8C63FF]"
                    : "bg-[#f4f4f490]",
                )}
                onClick={() => setAddOnChoice("CHECKBOX")}
              >
                <input
                  type="checkbox"
                  checked={addOnChoice === "CHECKBOX"}
                  readOnly
                  className="checkbox checkbox-[#8C63FF]"
                />
                <h6 className="mt-2 text-sm font-semibold">as Checkbox</h6>
              </button>
            </article>
          </article>
        </Background>
      </article>

      {/* Manage choices */}
      <section className="flex items-center justify-between mx-6 mt-4">
        <label className="font-semibold opacity-60" htmlFor="Mange-choice">
          Manage Choices ({choices.length})
        </label>
        <button
          type="button"
          onClick={goToChoices}
          className="flex items-center px-4 py-2 text-white bg-black rounded-full"
        >
          <BiPlus className="mr-2" />
          Add / Edit Choices
        </button>
      </section>

      {/* Small preview list */}
      <EditChoice />

      {/* Dishes link */}
      <article className="mx-6 mt-4 lg:mt-6">
        <label className="font-semibold opacity-50" htmlFor="name">
          Dishes ({recommendationIds?.length})
        </label>
        <Background>
          <button
            type="button"
            onClick={() => setAddOnToggle("LINK_DISHES")}
            className="bg-[#f4f4f4] w-full py-2 rounded-full flex items-center justify-center"
          >
            <RiLinkUnlink className="mr-2" /> Link Dishes
          </button>
        </Background>
      </article>

      {/* Save */}
      <BottomButton
        buttons={[
          {
            disable: choices?.length === 0,
            text: "Save",
            onClick: saveAddOnData,
            type: "button",
          },
        ]}
      />
    </>
  );
};

const CreateAddon = memo(MemoCreateAddon);
export default CreateAddon;
