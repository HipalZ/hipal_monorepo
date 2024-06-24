import { HiX } from "react-icons/hi";

interface InstructionInputProps {
  instruction: string;
  setInstruction: (value: string) => void;
  activeInputId: string | null;
  setActiveInputId: (id: string | null) => void;
  addInstruction: (cart: any, tableId: string, dishId: string, variantId: string, instruction: string) => void;
  cart: any;
  dishId: string;
  variantId: string;
  tableId: string;
}

const InstructionInput = ({
  instruction,
  setInstruction,
  setActiveInputId,
  addInstruction,
  cart,
  dishId,
  variantId,
  tableId
}: InstructionInputProps) => {
  

  const handleAddInstruction = () => {
    addInstruction(cart,tableId, dishId, variantId, instruction);
    setInstruction("");
  };
 

  return (
    <div className="flex mt-4">
      <HiX
        className="text-2xl text-orange-600"
        onClick={() => setActiveInputId('')}
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
          setActiveInputId('');
        }}
      >
        Add
      </button>
    </div>
  );
};

export default InstructionInput;
