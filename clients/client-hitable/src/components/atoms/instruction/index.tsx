import { HiX } from 'react-icons/hi';

const InstructionInput = ({ instruction, setInstruction, activeInputId, setActiveInputId, addInstruction, cart, dishId, variantId, tableId }) => {
  const handleAddInstruction = () => {
    addInstruction(cart, tableId, dishId, variantId, instruction);
    setInstruction('');
  };

  return (
    <div className="mt-4 flex">
      <HiX className="text-2xl text-orange-600" onClick={() => setActiveInputId(null)} />
      <input
        type="text"
        value={instruction}
        className="mx-2 w-full border-b border-b-orange-600 focus:outline-none"
        onChange={(e) => setInstruction(e.target.value)}
        minLength={2}
        maxLength={50}
      />
      <button
        className="rounded-lg border border-orange-600 px-4 text-orange-600"
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
