import { MdModeEdit } from 'react-icons/md';
import { RiDeleteBinLine } from 'react-icons/ri';
import { toast } from 'react-toastify';

const InstructionItem = ({ deleteInstruction, setActiveInputId, variant, cart, dishId, variantId, tableId }) => {
  const handleDeleteInstruction = () => {
    deleteInstruction(cart, tableId, dishId, variantId);
    toast.success('Instruction deleted successfully');
    setActiveInputId(variantId);
  };

  const handleEditInstruction = () => {
    setActiveInputId(variantId);
  };

  return (
    <div className="mt-4 flex items-center space-x-4">
      <div className="-mt-1 w-[80%] text-orange-600">{variant?.instruction}</div>
      <div className="space-x-4">
        <button className="rounded-lg text-orange-600" onClick={handleDeleteInstruction}>
          <RiDeleteBinLine className="text-xl text-orange-600" />
        </button>
        <button className="rounded-lg text-orange-600" onClick={handleEditInstruction}>
          <MdModeEdit />
        </button>
      </div>
    </div>
  );
};

export default InstructionItem;
