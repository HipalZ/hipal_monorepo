import useMenuPageStore, { DishSteps } from "@/components/store/useMenuStorage";
import { memo } from "react";
import { AiFillAlert } from "react-icons/ai";

type Props = {
  handleDelete: () => void;
};
const MemoDeleteDish = (props: Props) => {
  const { handleDelete } = props;
  const { setShowDeleteDish, setDishStep } = useMenuPageStore((s) => ({
    setShowDeleteDish: s.setShowDeleteDish,
    setDishStep: s.setDishStep,
  }));
  const handleCancel = () => {
    setShowDeleteDish(false);
    setDishStep(DishSteps.DISH_STEP_1);
  };
  return (
    <div className="flex justify-center my-6">
      <section className="h-[20rem] w-[20rem] border-1 border rounded-2xl p-6">
        <AiFillAlert color="red" size="28" />
        <h1 className="mt-2 mb-6 text-2xl font-bold">Delete Dish!</h1>
        <p className="text-sm text-[#CACACA] mb-4">
          This action cannot be undone.
        </p>
        <p className="text-xl">Do you want to cancel the Delete?</p>
        <center className="mt-10 space-x-24">
          <button
            type="button"
            className="px-4 py-2 mr-2 bg-gray-300 rounded-full"
            onClick={handleCancel}
          >
            Cancel
          </button>
          <button
            type="button"
            className="px-4 py-2 text-white bg-red-600 rounded-full"
            onClick={handleDelete}
          >
            Delete
          </button>
        </center>
      </section>
    </div>
  );
};

const DeleteDish = memo(MemoDeleteDish);
export default DeleteDish;
