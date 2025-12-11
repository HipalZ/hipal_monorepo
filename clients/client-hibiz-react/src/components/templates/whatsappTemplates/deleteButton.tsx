import { Trash2 } from 'lucide-react';

const DeleteButton = ({ data }) => {
  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        data?.remove?.(data.id);
      }}
      type="button"
      className="absolute right-3 top-3 z-20 rounded-full bg-white/90 p-1.5 text-red-500 shadow-md backdrop-blur-sm transition-all hover:bg-red-50 hover:text-red-600 focus:outline-none focus:ring-2 focus:ring-red-500/50"
      aria-label="Delete this send message node"
      title="Delete node"
    >
      <Trash2 className="h-3.5 w-3.5" />
    </button>
  );
};

export default DeleteButton;
