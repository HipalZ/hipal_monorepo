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
import { useDeleteAddon, useUpdateAddon } from "@/hooks/useAddOn";
import LoadingSpinner from "@/components/atom/loadingSpinner";
import BottomButton from "@/components/atom/bottomButton";
import { RiLinkUnlink } from "react-icons/ri";
import { MdDelete } from "react-icons/md";
import { useParams } from "react-router-dom";

const count = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

const MemoEditAddon = () => {
  const availability = useMenuPageStore((s) => s.availability);
  const visibility = useMenuPageStore((s) => s.visibility);
  const addOnName = useMenuPageStore((s) => s.addOnName);
  const setAvailability = useMenuPageStore((s) => s.setAvailability);
  const setVisibility = useMenuPageStore((s) => s.setVisibility);
  const setAddOnName = useMenuPageStore((s) => s.setAddOnName);
  const maxChoices = useMenuPageStore((s) => s.maxChoices);
  const minChoices = useMenuPageStore((s) => s.minChoices);
  const setMaxChoices = useMenuPageStore((s) => s.setMaxChoices);
  const setMinChoices = useMenuPageStore((s) => s.setMinChoices);
  const resetChoiceFields = useMenuPageStore((s) => s.resetChoiceFields);
  const addOnToggle = useMenuPageStore((s) => s.addOnToggle);
  const setAddOnToggle = useMenuPageStore((s) => s.setAddOnToggle);
  const addOnChoice = useMenuPageStore((s) => s.addOnChoice);
  const choices = useMenuPageStore((s) => s.choices);
  const addOnId = useMenuPageStore((s) => s.addOnId);
  const recommendationIds = useMenuPageStore((s) => s.recommendationIds);
  const removeRecommendationIds = useMenuPageStore(
    (s) => s.removeRecommendationIds,
  );
  const [isCatDelete, setIsCatDelete] = useState<boolean>(false);

  const [maxValueError, setMaxValueError] = useState<boolean>(false);

  const { businessId, menuId } = useParams<{
    businessId?: string;
    menuId: string;
  }>();

  const { isPending, mutate: updateAddon } = useUpdateAddon();

  const { isPending: deletePending, mutate: deleteAddon } = useDeleteAddon();

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

  const getRemovedIds = (prevIds: string[], newIds: string[]) => {
    return prevIds.filter((id) => !newIds.includes(id));
  };

  const saveAddOnData = useCallback(() => {
    if (maxChoices <= 0 || addOnName.trim() === "") {
      return toast.error("Please fill all the fields");
    }

    const removeDishIds = getRemovedIds(
      removeRecommendationIds,
      recommendationIds,
    );

    const data = {
      _id: addOnId,
      businessId: businessId || "",
      menuId: menuId,
      name: addOnName,
      choices: choices,
      choiceType: addOnChoice,
      availability: availability,
      visibility: visibility,
      compulsory: minChoices,
      addOnMaxQuantity: maxChoices,
      dishIds: recommendationIds,
      removeDishIds: removeDishIds,
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
    businessId,
    menuId,
    recommendationIds,
    removeRecommendationIds,
  ]);

  if (isPending) {
    return (
      <div>
        <LoadingSpinner />
      </div>
    );
  }

  if (deletePending) {
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
          <h1 className="font-semibold opacity-50">Addon visibility</h1>
          <Switch
            checked={visibility}
            onChange={setVisibility}
            className="group inline-flex h-6 w-11 items-center rounded-full bg-gray-200 transition data-[checked]:bg-green-400"
          >
            <span className="size-4 translate-x-1 rounded-full bg-white transition group-data-[checked]:translate-x-6" />
          </Switch>
        </article>
        <article className="flex justify-between px-4 py-3 my-4 bg-white rounded-full lg:flex-1 lg:mt-6">
          <h1 className="font-semibold opacity-50">Addon Availability</h1>
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
      <section className="mx-6 mt-4 lg:mt-6">
        <label className="font-semibold opacity-50" htmlFor="name">
          Link Dishes ({recommendationIds?.length})
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
      </section>
      {!isCatDelete && (
        <section className="mx-6 mt-4 lg:mt-6">
          <label className="font-semibold opacity-50" htmlFor="name">
            Delete Category
          </label>
          <Background>
            <button
              onClick={() => setIsCatDelete(true)}
              type="button"
              className="bg-[#d32a2a] w-full py-2 rounded-full flex items-center justify-center text-white"
            >
              <MdDelete className="mr-2" /> Delete Addon
            </button>
          </Background>
        </section>
      )}
      {choices.length > 0 && (
        <>
          {isCatDelete ? (
            <BottomButton
              buttons={[
                {
                  text: "Cancel",
                  onClick: () => setIsCatDelete(false),
                  type: "button",
                },
                {
                  text: "Confirm Delete",
                  onClick: () => deleteAddon(addOnId),
                  type: "button",
                  delete: true,
                },
              ]}
            />
          ) : (
            <BottomButton
              buttons={[
                { text: "Update", onClick: saveAddOnData, type: "button" },
              ]}
            />
          )}
        </>
      )}
    </div>
  );
};

const EditAddon = memo(MemoEditAddon);

export default EditAddon;
