import useMenuPageStore, { DishSteps } from "@/components/store/useMenuStorage";
import { memo } from "react";
import { AiFillExclamationCircle } from "react-icons/ai";

type Props = {
  handleDelete: () => void;
};

const MemoDeleteDish = ({ handleDelete }: Props) => {
  const { setShowDeleteDish, setDishStep } = useMenuPageStore((s) => ({
    setShowDeleteDish: s.setShowDeleteDish,
    setDishStep: s.setDishStep,
  }));

  const handleCancel = () => {
    setShowDeleteDish(false);
    setDishStep(DishSteps.DISH_STEP_1);
  };

  return (
    <div className="flex items-center justify-center m-6 bg-gray-100">
      <div className="w-full max-w-md p-8 bg-white shadow-lg rounded-3xl">
        <div className="flex flex-col items-center">
          <AiFillExclamationCircle className="mb-4 text-5xl text-red-500" />
          <h1 className="mb-2 text-3xl font-bold text-gray-800">Delete !</h1>
          <p className="mb-6 text-sm text-gray-500">
            This action cannot be undone.
          </p>
          <p className="mb-8 text-lg text-center text-gray-700">
            Are you sure you want to delete this?
          </p>
          <div className="flex w-full space-x-4">
            <button
              type="button"
              className="flex-1 px-6 py-3 text-gray-800 transition duration-300 ease-in-out bg-gray-200 rounded-full hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400"
              onClick={handleCancel}
            >
              Cancel
            </button>
            <button
              type="button"
              className="flex-1 px-6 py-3 text-white transition duration-300 ease-in-out bg-red-500 rounded-full hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500"
              onClick={handleDelete}
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const DeleteDish = memo(MemoDeleteDish);
export default DeleteDish;
