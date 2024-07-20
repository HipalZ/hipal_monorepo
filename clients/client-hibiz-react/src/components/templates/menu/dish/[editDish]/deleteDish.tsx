import useMenuPageStore, { DishSteps } from "@/components/store/useMenuStorage";

type Props = {
  handleDelete: () => void;
};
const DeleteDish = (props: Props) => {
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
    <center className="mx-6 lg:mx-24 mt-[20dvh]">
      <h1 className="text-lg font-semibold text-gray-900">
        Are you sure you want to delete this dish?
      </h1>
      <p className="mt-2 text-sm text-gray-600">
        This action cannot be undone.
      </p>
      <div className="flex justify-center mt-4 space-x-4">
        <button
          onClick={handleCancel}
          type="button"
          className="px-4 py-2 text-gray-800 bg-gray-200 rounded hover:bg-gray-300"
        >
          Cancel
        </button>
        <button
          onClick={handleDelete}
          type="button"
          className="px-4 py-2 text-white bg-red-600 rounded hover:bg-red-700"
        >
          Delete
        </button>
      </div>
    </center>
  );
};

export default DeleteDish;
