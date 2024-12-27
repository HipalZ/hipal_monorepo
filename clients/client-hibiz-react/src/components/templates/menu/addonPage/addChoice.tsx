import Background from "@/components/atom/feildBackground";
import useMenuPageStore, { Choice } from "@/components/store/useMenuStorage";
import {
  DishTypeEnum,
  type DishTypeEnumType,
} from "@hi/db-models/src/validators";
import { memo } from "react";
import veg from "@/assets/dishTypes/veg.png";
import nonVeg from "@/assets/dishTypes/non_veg.png";
import egg from "@/assets/dishTypes/egg.png";
import vegan from "@/assets/dishTypes/vegan.png";
import { cn } from "@hi/common";
import toast from "react-hot-toast";
import BottomButton from "@/components/atom/bottomButton";

export const foodTypes = [
  { name: DishTypeEnum[0], icon: veg },
  { name: DishTypeEnum[1], icon: nonVeg },
  { name: DishTypeEnum[2], icon: egg },
  { name: DishTypeEnum[3], icon: vegan },
];

const MemoCreateChoice = () => {
  const {
    choiceName,
    choicePrice,
    dishTypes,
    setChoiceName,
    setChoicePrice,
    setDishTypes,
    choices,
    addChoice,
    resetChoiceFields,
    maxChoices,
    setAddOnToggle,
    editChoiceId,
    setEditChoiceId,
    updateChoice,
    addOnId,
  } = useMenuPageStore((s) => ({
    choiceName: s.choiceName,
    choicePrice: s.choicePrice,
    dishTypes: s.dishTypes,
    setChoiceName: s.setChoiceName,
    setChoicePrice: s.setChoicePrice,
    setDishTypes: s.setDishTypes,
    choices: s.choices,
    addChoice: s.addChoice,
    resetChoiceFields: s.resetChoiceFields,
    maxChoices: s.maxChoices,
    setAddOnToggle: s.setAddOnToggle,
    editChoiceId: s.editChoiceId,
    setEditChoiceId: s.setEditChoiceId,
    updateChoice: s.updateChoice,
    addOnId: s.addOnId,
  }));

  const toggleSelection = (type: DishTypeEnumType) => {
    const isSelected = dishTypes.includes(type);
    const newSelectedTypes = isSelected
      ? dishTypes.filter((t) => t !== type)
      : [...dishTypes, type];

    setDishTypes(newSelectedTypes);
  };

  const handleSaveChoice = () => {
    const isEdit = editChoiceId !== "";
    const choiceExists = choices.find((c) => c.uuid === editChoiceId);

    const nameExists = choices.some(
      (c) => c.name === choiceName && c.uuid !== editChoiceId,
    );

    if (nameExists) {
      toast.error("Choice name already exists");
      return;
    }

    if (choiceName === "" || dishTypes.length <= 0) {
      console.log(choiceName, dishTypes.length);
      toast.error("Please fill all the fields");
      return;
    }

    const newChoice = {
      uuid: isEdit && choiceExists ? choiceExists.uuid : crypto.randomUUID(),
      name: choiceName,
      price: choicePrice || 0,
      description: "",
      visibility: true,
      availability: true,
      choiceMaxQuantity: maxChoices,
      choiceDishType: dishTypes,
    };

    if (isEdit) {
      updateChoice(newChoice);
      setEditChoiceId("");
    } else {
      addChoice(newChoice);
    }
    if (addOnId !== "") {
      setAddOnToggle("EDIT_ADDON");
    } else {
      setAddOnToggle("ADD_ON");
    }
    resetChoiceFields();
  };

  return (
    <>
      {" "}
      <section className="flex flex-col lg:flex-row">
        <article className="flex-1 mx-6 lg:mt-6">
          <label className="font-semibold opacity-50" htmlFor="name">
            Choice Name*
          </label>
          <Background>
            <input
              type="text"
              id="name"
              placeholder="Enter choice Name"
              value={choiceName}
              maxLength={50}
              onChange={(e) => setChoiceName(e.target.value)}
              className="w-full p-2 bg-white border border-black rounded-xl focus:ring-0 focus:bg-white focus:border-[#8C63FF]"
            />
          </Background>
        </article>
        <article className="mx-6 lg:mt-6">
          <label className="font-semibold opacity-50" htmlFor="type">
            Dish Type*
          </label>
          <Background>
            <p className="text-sm text-gray-500">Choose Minimum 1 type</p>
            <section className="flex flex-wrap gap-2 mt-2">
              {foodTypes?.map((type) => {
                const isSelected = dishTypes.includes(type?.name);
                return (
                  <button
                    type="button"
                    onClick={() => toggleSelection(type?.name)}
                    key={type?.name}
                    className={cn(
                      "capitalize flex justify-between items-center px-4 py-2 rounded-full gap-1 border border-[#CACACA]",
                      `${isSelected ? "bg-blue-200" : ""}`,
                    )}
                  >
                    <img src={type?.icon} loading="lazy" alt={type?.name} />
                    <p>{type?.name.replace(/_/g, " ").toLowerCase()}</p>
                  </button>
                );
              })}
            </section>
          </Background>
        </article>
      </section>
      <article className="mx-6 mt-4 lg:mt-6">
        <label className="font-semibold opacity-50" htmlFor="name">
          Additional Price
        </label>
        <Background>
          <input
            type="tel"
            id="name"
            placeholder="Enter choice Price"
            maxLength={10}
            value={choicePrice}
            onChange={(e) => {
              const value = e.target.value;
              if (/^\d*$/.test(value)) {
                setChoicePrice(Number(value));
              }
            }}
            inputMode="numeric"
            pattern="[0-9]*"
            className="w-full p-2 bg-white border border-black rounded-xl focus:no-outline focus:right-0 focus:border-black focus:bg-white"
          />
        </Background>
      </article>
      <BottomButton
        buttons={[{ text: "Save", onClick: handleSaveChoice, type: "button" }]}
      />
    </>
  );
};
const CreateChoice = memo(MemoCreateChoice);
export default CreateChoice;
