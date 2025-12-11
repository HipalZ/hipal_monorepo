import { memo, useState } from "react";
import useMenuPageStore from "@/components/store/useMenuStorage";
import {
  DishTypeEnum,
  type DishTypeEnumType,
} from "@hi/db-models/src/validators";
import veg from "@/assets/dishTypes/veg.png";
import nonVeg from "@/assets/dishTypes/non_veg.png";
import egg from "@/assets/dishTypes/egg.png";
import vegan from "@/assets/dishTypes/vegan.png";
import { cn } from "@hi/common";
import toast from "react-hot-toast";

// shadcn
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import AdvancedBottomButton from "@/components/atom/bottomButton/advancedBottomButton";
import { Plus, X } from "lucide-react";

export const foodTypes = [
  { name: DishTypeEnum[0], icon: veg },
  { name: DishTypeEnum[1], icon: nonVeg },
  { name: DishTypeEnum[2], icon: egg },
  { name: DishTypeEnum[3], icon: vegan },
];

const MAX_CHOICES_COUNT = 50;

// ---- Helper you can reuse everywhere ----
export const getChoiceValidity = (choice: {
  name?: string;
  choiceDishType?: DishTypeEnumType[];
}) => {
  const hasName =
    typeof choice.name === "string" && choice.name.trim().length > 0;
  const hasTypes =
    Array.isArray(choice.choiceDishType) && choice.choiceDishType.length > 0;

  return {
    isValid: hasName && hasTypes,
    hasName,
    hasTypes,
  };
};

const MemoCreateChoice = () => {
  const choices = useMenuPageStore((s) => s.choices);
  const addChoice = useMenuPageStore((s) => s.addChoice);
  const updateChoice = useMenuPageStore((s) => s.updateChoice);
  const deleteChoice = useMenuPageStore((s) => s.deleteChoice);
  const maxChoices = useMenuPageStore((s) => s.maxChoices);
  const setAddOnToggle = useMenuPageStore((s) => s.setAddOnToggle);
  const addOnId = useMenuPageStore((s) => s.addOnId);

  // showErrors = true only after user clicks Done
  const [showErrors, setShowErrors] = useState(false);

  // ---- helpers ----

  const validateAllChoices = () => {
    if (choices.length === 0) {
      toast.error("Add at least one choice.");
      return false;
    }

    const invalid = choices.find((c) => !getChoiceValidity(c).isValid);
    if (invalid) {
      toast.error("Please fill all required fields marked in red.");
      return false;
    }

    return true;
  };

  const handleChangeName = (uuid: string, name: string) => {
    const target = choices.find((c) => c.uuid === uuid);
    if (!target) return;

    // avoid duplicate names (soft warning)
    const nameExists = choices.some(
      (c) => c.uuid !== uuid && c.name === name.trim(),
    );
    if (nameExists) {
      toast.error("Choice name already exists");
    }

    updateChoice({
      ...target,
      name,
    });
  };

  const handleChangePrice = (uuid: string, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const target = choices.find((c) => c.uuid === uuid);
    if (!target) return;

    updateChoice({
      ...target,
      price: value ? Number(value) : 0,
    });
  };

  const handleToggleType = (uuid: string, type: DishTypeEnumType) => {
    const target = choices.find((c) => c.uuid === uuid);
    if (!target) return;

    const currentTypes = Array.isArray(target.choiceDishType)
      ? target.choiceDishType
      : [];

    const isSelected = currentTypes.includes(type);
    const updatedTypes = isSelected
      ? currentTypes.filter((t: DishTypeEnumType) => t !== type)
      : [...currentTypes, type];

    updateChoice({
      ...target,
      choiceDishType: updatedTypes,
    });
  };

  const handleAddChoiceRow = () => {
    if (choices.length >= MAX_CHOICES_COUNT) {
      toast.error(`You can add up to ${MAX_CHOICES_COUNT} choices only.`);
      return;
    }
    setShowErrors(false);

    const newChoice = {
      uuid: crypto.randomUUID(),
      name: "",
      price: 0,
      description: "",
      visibility: true,
      availability: true,
      choiceMaxQuantity: maxChoices,
      choiceDishType: [] as DishTypeEnumType[],
    };

    addChoice(newChoice);
  };

  const handleRemoveChoice = (uuid: string) => {
    deleteChoice(uuid);
  };

  const handleDone = () => {
    // From now on, show red errors for invalid fields
    setShowErrors(true);

    if (!validateAllChoices()) return;

    if (addOnId !== "") {
      setAddOnToggle("EDIT_ADDON");
    } else {
      setAddOnToggle("ADD_ON");
    }
  };

  return (
    <div className="flex flex-col gap-4 px-4 pb-20 pt-4">
      {/* Heading + subheading */}
      <div>
        <h1 className="text-xl font-bold">Choices</h1>
        <p className="mt-1 text-sm font-bold opacity-80">
          Add all choices for this add-on in one go. Example: Extra cheese,
          Olives, Jalapeños.
        </p>
      </div>

      {/* List of choice blocks */}
      {choices.length === 0 ? (
        <Card>
          <CardContent className="py-6 text-sm text-muted-foreground">
            No choices added yet. Click{" "}
            <span className="font-semibold">“Add choice”</span> to start.
          </CardContent>
        </Card>
      ) : (
        choices.map((choice, index) => {
          const { hasName, hasTypes } = getChoiceValidity(choice);

          const nameError = showErrors && !hasName;
          const typeError = showErrors && !hasTypes;

          return (
            <Card key={choice.uuid}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-bold">
                  Choice {index + 1}
                </CardTitle>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 p-0"
                  onClick={() => handleRemoveChoice(choice.uuid)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Name */}
                <div className="space-y-1">
                  <Label
                    className={cn("font-semibold", nameError && "text-red-500")}
                  >
                    Choice name*
                  </Label>
                  <Input
                    placeholder="Eg: Extra cheese"
                    value={choice.name}
                    maxLength={50}
                    onChange={(e) =>
                      handleChangeName(choice.uuid, e.target.value)
                    }
                    className={cn(
                      nameError &&
                        "border-red-500 focus-visible:ring-red-500 focus-visible:ring-1",
                    )}
                  />
                  {nameError && (
                    <p className="text-xs text-red-500">
                      Name is required for this choice.
                    </p>
                  )}
                </div>

                {/* Dish type */}
                <div className="space-y-1">
                  <Label
                    className={cn("font-semibold", typeError && "text-red-500")}
                  >
                    Dish type*
                  </Label>
                  <div
                    className={cn(
                      "flex flex-wrap gap-2 mt-1 rounded-xl p-1",
                      typeError && "ring-1 ring-red-500",
                    )}
                  >
                    {foodTypes.map((type) => {
                      const isSelected =
                        Array.isArray(choice.choiceDishType) &&
                        choice.choiceDishType.includes(type.name);
                      return (
                        <button
                          type="button"
                          key={type.name}
                          onClick={() =>
                            handleToggleType(choice.uuid, type.name)
                          }
                          className={cn(
                            "capitalize flex items-center gap-1 rounded-full border px-3 py-1 text-xs",
                            isSelected
                              ? "bg-primary/10 border-primary"
                              : "border-[#CACACA] bg-white",
                          )}
                        >
                          <img
                            src={type.icon}
                            loading="lazy"
                            alt={type.name}
                            className="h-4 w-4"
                          />
                          <span>
                            {type.name.replace(/_/g, " ").toLowerCase()}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                  {typeError && (
                    <p className="text-xs text-red-500">
                      Select at least one type.
                    </p>
                  )}
                </div>

                {/* Additional price */}
                <div className="space-y-1">
                  <Label className="font-semibold">
                    Additional price (optional)
                  </Label>
                  <Input
                    type="tel"
                    placeholder="Eg: 20"
                    maxLength={10}
                    value={
                      !choice.price || choice.price === 0
                        ? ""
                        : String(choice.price)
                    }
                    onChange={(e) =>
                      handleChangePrice(choice.uuid, e.target.value)
                    }
                    inputMode="numeric"
                    pattern="[0-9]*"
                  />
                </div>
              </CardContent>
            </Card>
          );
        })
      )}

      {/* Add choice button */}
      <div className="flex justify-start">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleAddChoiceRow}
        >
          <Plus className="h-4 w-4 mr-1" />
          Add choice
        </Button>
      </div>

      {/* Done button at bottom */}
      <AdvancedBottomButton
        fixed={true}
        maxWidth="30rem"
        buttons={[
          {
            text: "Done",
            onClick: handleDone,
            disable: choices.length === 0,
          },
        ]}
      />
    </div>
  );
};

const CreateChoice = memo(MemoCreateChoice);
export default CreateChoice;
