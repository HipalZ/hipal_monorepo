import { memo } from "react";
import CommonBottomButton from "../bottomButton";
import { useOrderStore } from "@/components/store/useOrderData";
import { useMutation } from "@tanstack/react-query";
import { apiRpc } from "@hi/common";
import { useLiteStore } from "@/components/store/useLiteStore";
import { useNavigate, useParams } from "react-router-dom";
import SpinnerMemo from "../loadingSpinner";
import { useHiClientZ } from "@/components/store/useHiClientzData";
import toast from "react-hot-toast";
import { AlertTriangle } from "lucide-react";
import { useError } from "@/components/store/useError";
import { NavItemTypesEnum } from "@/components/types/hiClientzData";

const MemoFreeTable = () => {
  const {
    setTransferTable,
    setTransferModal,
    setSelectedItems,
    selectedTable,
    setOpenOrderModal,
  } = useOrderStore();

  const { businessId } = useParams();
  const navigate = useNavigate();
  const { setError, setOpenErrorModal } = useError();

  const { setSelectedNavItem } = useLiteStore();
  const captainData = useHiClientZ((s) => s.captainData);

  const closeModal = () => {
    setTransferModal(false);
    setTransferTable("");
    setSelectedItems([]);
  };

  const { isPending, mutateAsync } = useMutation({
    mutationFn: async () => {
      const response = await apiRpc.table.free_table.$post({
        json: {
          tableId: selectedTable?._id || "",
          performedBy: captainData?._id || "",
        },
      });
      return response;
    },
    onSuccess: (data) => {
      if (!data?.ok) {
        setOpenErrorModal(true);
        setError("You are not authorized to perform this action");
        return toast.error("You are not authorized to perform this action");
      }
      if (data?.ok) {
        setOpenOrderModal(false);
        setSelectedNavItem(NavItemTypesEnum.TABLES);
        toast.success("Table freed successfully");
        closeModal();
        return navigate(`/${businessId}/alerts`);
      }
    },
  });

  if (isPending) {
    return <SpinnerMemo />;
  }

  return (
    <>
      <div className="p-4 pt-8 items-satrt">
        <h3 className="text-2xl font-semibold text-red-900">Important</h3>
        <p className="mt-4 opacity-70">
          <span className="font-semibold opacity-80">
            Are you sure u want to free the{" "}
          </span>
          <span className="text-xl font-semibold">{selectedTable?.name} ?</span>
        </p>
        <div className="flex items-center mt-4">
          <AlertTriangle className="w-5 h-5 mr-2 text-red-500" />
          <p className="text-red-500">This action cannot be undone</p>
        </div>
      </div>

      <CommonBottomButton
        fixed
        maxWidth="30rem"
        position="mid"
        buttons={[
          {
            text: "Cancel",
            onClick: closeModal,
            isBackButton: true,
            className: "pl-3 rounded-md",
          },
          {
            text: "Free Table",
            onClick: () => {
              mutateAsync();
            },
            className: "rounded-full",
            swipe: true,
          },
        ]}
      />
    </>
  );
};

const FreeTable = memo(MemoFreeTable);
export default FreeTable;
