import React  from "react";
import { HiX } from "react-icons/hi";

const InstructionInput = ({
  instruction,
  setInstruction,
  activeInputId,
  setActiveInputId,
  addInstruction,
  cart,
  dishId,
  variantId,
  tableId
}) => {
  

  const handleAddInstruction = () => {
    addInstruction(cart,tableId, dishId, variantId, instruction);
    setInstruction("");
  };
 

  return (
    <div className="flex mt-4">
      <HiX
        className="text-2xl text-orange-600"
        onClick={() => setActiveInputId(null)}
      />
      <input
        type="text"
        value={instruction}
        className="w-full mx-2 border-b border-b-orange-600 focus:outline-none"
        onChange={(e) => setInstruction(e.target.value)}
        minLength={2}
        maxLength={50}
      />
      <button
        className="px-4 text-orange-600 border border-orange-600 rounded-lg"
        onClick={() => {
          handleAddInstruction();
          setActiveInputId(null);
        }}
      >
        Add
      </button>
    </div>
  );
};

export default InstructionInput;
