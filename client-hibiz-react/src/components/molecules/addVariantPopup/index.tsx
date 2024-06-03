import useAddOnStore from "@/components/store/useAddOn";
import React, { memo, useEffect } from "react";
import Switch from "react-switch";
import { toast } from "react-toastify";

interface VariantComponentProps {
  compulsoryQuantity: number;
  onClose: () => void;
}

const VariantComponent: React.FC<VariantComponentProps> = ({ onClose,compulsoryQuantity }) => {
  const {
    variantName,
    variantType,
    variantDescription,
    variantAvailability,
    variantVisibility,
    variantMaxQuantity,
    variantPrice,
    addOnType,
    setVariantAvailability,
    setVariantDescription,
    setVariantMaxQuantity,
    setVariantName,
    setVariantPrice,
    setVariantType,
    setVariantVisibility,
    addVariant,
    editVariant,
    currentVariant,
    setCurrentVariant,
    variants,
  } = useAddOnStore();

  const handleToggleAvailability = (checked: boolean) => {
    setVariantAvailability(checked);
  };

  const handleToggleVisibility = (checked: boolean) => {
    if(!checked && compulsoryQuantity>0){
      toast.warn('Please Change the compulsory value due to visibility off')
    }
    setVariantVisibility(checked);
  };

  const handleSaveVariant = () => {
    if (!variantName || variantName.trim() === "") {
      toast.error("Name is required");
      return;
    }
    if (!variantType) {
      toast.error("Type is required");
      return;
    }

    if (variantMaxQuantity === 0) {
      toast.error("Max Quantity is required");
      return;
    }
    const isDuplicateName = variants.some(
      (variant) =>
        variant.name.toLowerCase() === variantName.toLowerCase() &&
        variant.id !== (currentVariant?.id || "")
    );
    if (isDuplicateName) {
      toast.error("Variant already exists");
      return;
    }

    const newVariant = {
      id: currentVariant ? currentVariant.id : crypto.randomUUID(),
      name: variantName,
      ExtraType: variantType,
      description: variantDescription,
      price: variantPrice,
      maxQuantity: variantMaxQuantity,
      availability: variantAvailability,
      visibility: variantVisibility,
    };
    if (currentVariant) {
      editVariant(newVariant.id, newVariant);
    } else {
      addVariant(newVariant);
    }
    setCurrentVariant(null);
    onClose();
  };

  useEffect(() => {
    if (currentVariant) {
      setVariantName(currentVariant.name);
      setVariantType(currentVariant.ExtraType);
      setVariantDescription(currentVariant.description);
      setVariantPrice(currentVariant.price);
      setVariantMaxQuantity(currentVariant.maxQuantity);
      setVariantAvailability(currentVariant.availability);
      setVariantVisibility(currentVariant.visibility);
    } else {
      setVariantName("");
      setVariantType("");
      setVariantDescription("");
      setVariantPrice(0);
      setVariantMaxQuantity(0);
    }
    if (addOnType === "single") {
      setVariantMaxQuantity(1);
    } else {
      setVariantMaxQuantity(currentVariant?.maxQuantity || 0);
    }
  }, [
    currentVariant,
    setVariantName,
    setVariantType,
    setVariantDescription,
    setVariantPrice,
    setVariantMaxQuantity,
    setVariantAvailability,
    setVariantVisibility,
  ]);

  return (
    <>
      <div className="bg-[#f1f1f1] pt-4 min-h-auto h-auto rounded-t-3xl max-h-[70vh] pb-[7rem] overflow-auto">
        <div className="px-4 text-xl font-semibold ">Add Variant</div>
        <div className="px-2">
          <div className="px-4 mt-2 space-y-2">
            <span className="font-medium">Name of the varient</span>
            <input
              onChange={(e) => {
                setVariantName(e.target.value);
              }}
              value={variantName || ""}
              maxLength={24}
              type="text"
              id="floating_outlined"
              className="block w-full pt-2 pb-2 bg-white pl-4 pr-[7rem] mb-0 ml-0 mr-0 text-base text-gray-900 bg-transparent border-gray-800 rounded-md border dark:text-white focus:outline-none focus:ring-0 focus:border-[#2B354D] dark:border-[#2B354D] peer"
              placeholder="Name"
            />
          </div>
          <div className="px-4 mt-4 space-y-2">
            <span className="font-medium">Variant Type</span>
            <select
              onChange={(e) => setVariantType(e.target.value)}
              value={variantType || ""}
              id="variantType"
              className="block w-full pt-2 pb-2 bg-white pl-4 pr-[7rem] mb-0 ml-0 mr-0 text-base text-gray-900 bg-transparent border-gray-800 rounded-md border dark:text-white focus:outline-none focus:ring-0 focus:border-[#2B354D] dark:border-[#2B354D] peer"
            >
              <option value="">Select a variant</option>
              <option value="veg">Veg</option>
              <option value="nonveg">NonVeg</option>
              <option value="vegan">Vegan</option>
              <option value="egg">Egg</option>
              <option value="mixed">Mixed</option>
            </select>
          </div>
          <div className="px-4 mt-4 space-y-2">
            <span className="font-medium">Price</span>
            <input
              onChange={(e) => {
                const numericValue = e.target.value.replace(/[^0-9]/g, "");
                setVariantPrice(numericValue ? parseInt(numericValue, 10) : 0);
              }}
              value={variantPrice || ''}
              maxLength={4}
              type="tel"
              id="floating_outlined"
              className="block w-full pt-2 pb-2 bg-white pl-4 pr-[7rem] mb-0 ml-0 mr-0 text-base text-gray-900 bg-transparent border-gray-800 rounded-md border dark:text-white focus:outline-none focus:ring-0 focus:border-[#2B354D] dark:border-[#2B354D] peer"
              placeholder="Enter the Price"
            />
          </div>
          <div className="px-4 mt-4 space-y-2">
            <span className="font-medium">Max Quantity</span>
            <input
              onChange={(e) => {
                const numericValue = e.target.value.replace(/[^0-9.-]/g, "");
                const valueAsNumber = Math.abs(parseFloat(numericValue));
                setVariantMaxQuantity(valueAsNumber || 0);
              }}
              disabled={addOnType === "single"}
              value={variantMaxQuantity || ""}
              type="tel"
              maxLength={3}
              id="floating_outlined"
              className="block w-full pt-2 pb-2 bg-white pl-4 pr-[7rem] mb-0 ml-0 mr-0 text-base text-gray-900 bg-transparent border-gray-800 rounded-md border dark:text-white focus:outline-none focus:ring-0 focus:border-[#2B354D] dark:border-[#2B354D] peer"
              placeholder="Enter max quantity"
            />
          </div>
          <div className="mt-4 ml-4">View</div>
          <div className="space-y-4 p-2 border border-[#cacaca] rounded-md mt-2 bg-white mx-4 px-4">
            <div className="flex items-center justify-between">
              <span>Availability </span>
              <Switch
                uncheckedIcon={false}
                checkedIcon={false}
                onChange={handleToggleAvailability}
                checked={variantAvailability}
                offColor="#CACACA"
              />
            </div>

            <div className="flex items-center justify-between">
              <span>Visibility </span>
              <Switch
                uncheckedIcon={false}
                checkedIcon={false}
                onChange={handleToggleVisibility}
                checked={variantVisibility}
                offColor="#CACACA"
              />
            </div>
          </div>
        </div>
        <div
          onClick={handleSaveVariant}
          className="fixed bottom-0 w-full max-w-[27rem] p-4 outline-none cursor-pointer"
        >
          <button type="button" className="bg-[#2B354D] w-full py-2 rounded-md text-white">
            Save
          </button>
        </div>
      </div>
    </>
  );
};

export default memo(VariantComponent);
