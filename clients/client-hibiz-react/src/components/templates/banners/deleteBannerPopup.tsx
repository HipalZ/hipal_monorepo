import { useModalOperations } from "@/components/helpers/allBannersHelper";
import { useBannerTemp } from "@/components/store/useBannerTemp";
import { apiRpc } from "@hi/common";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { lazy, memo } from "react";
import toast from "react-hot-toast";

const MiddlePopUp = lazy(() => import("@/components/atom/middlePopUp"));

const MemoDeleteConfirmPopup = () => {
  // modal operations
  const { closeModal } = useModalOperations();
  const { isModalOpen, selectedBannerId } = useBannerTemp((s) => ({
    isModalOpen: s.isModalOpen,
    selectedBannerId: s.selectedBannerId,
  }));
  // Define the queryClient
  const queryClient = useQueryClient();
  // Define the mutation function for deleting a banner
  const deleteBanner = async (id: string) => {
    const response = await apiRpc.settings.banners[":bannerId"].$delete({
      param: {
        bannerId: id,
      },
      json: {},
    });
    if (!response.ok) {
      throw new Error("Failed to delete banner");
    }
    return response.json();
  };

  // Use the useMutation hook to handle the delete mutation
  const { mutateAsync: deleteBannerMutation } = useMutation({
    mutationFn: deleteBanner,
    onSuccess: () => {
      toast.success("Banner deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["banners"] });
    },
    onError: (error) => {
      toast.error("Failed to delete banner");
      console.error("Error deleting banner:", error);
    },
  });

  // Function to handle deleting a banner
  const handleDelete = async () => {
    if (selectedBannerId !== null) {
      try {
        await deleteBannerMutation(selectedBannerId);
        closeModal();
      } catch (error) {
        console.error("Error in handleDelete:", error);
      }
    }
  };
  return (
    <MiddlePopUp show={isModalOpen} onClose={closeModal} onlyPopUp={true}>
      <section className="h-[15rem] space-y-16 p-6">
        <h1 className="text-2xl">
          Are you sure you want to delete this banner?
        </h1>
        <div className="flex justify-between">
          <button
            type="button"
            className="px-4 py-2 mr-2 bg-gray-300 rounded"
            onClick={closeModal}
          >
            Cancel
          </button>
          <button
            type="button"
            className="px-4 py-2 text-white bg-red-600 rounded"
            onClick={handleDelete}
          >
            Delete
          </button>
        </div>
      </section>
    </MiddlePopUp>
  );
};

const DeleteConfirmPopup = memo(MemoDeleteConfirmPopup);
export default DeleteConfirmPopup;
