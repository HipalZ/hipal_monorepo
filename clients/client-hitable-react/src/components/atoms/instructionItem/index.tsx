import { RiDeleteBinLine } from "react-icons/ri";
import { toast } from "react-toastify";
import { MdModeEdit } from "react-icons/md";

type InstructionItemProps = {
  deleteInstruction: (cart: any, tableId: string, dishId: string, variantId: string) => void;
  setActiveInputId: (variantId: string) => void;
  variant: any;
  cart: any;
  dishId: string;
  variantId: string;
  tableId: string;
};

const InstructionItem = ({
  deleteInstruction,
  setActiveInputId,
  variant,
  cart,
  dishId,
  variantId,
  tableId
}: InstructionItemProps) => {
  console.log("Id", variantId);
  console.log("variant", variant);
  console.log("cart", cart);
  console.log("dishId", dishId);
  console.log("tableId", tableId);
  const handleDeleteInstruction = () => {
    deleteInstruction(cart,tableId, dishId, variantId);
    toast.success("Instruction deleted successfully");
    setActiveInputId(variantId);
  };

  const handleEditInstruction = () => {
    setActiveInputId(variantId);
  };

  return (
    <div className="flex items-center mt-4 space-x-4">
      <div className="w-[80%] -mt-1 text-orange-600">{variant?.instruction}</div>
      <div className="space-x-4">
        <button
          className="text-orange-600 rounded-lg"
          onClick={handleDeleteInstruction}
        >
          <RiDeleteBinLine className="text-xl text-orange-600" />
        </button>
        <button
          className="text-orange-600 rounded-lg"
          onClick={handleEditInstruction}
        >
          <MdModeEdit />
        </button>
      </div>
    </div>
  );
};

export default InstructionItem;
