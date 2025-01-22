import { memo } from "react"
import CommonBottomButton from "../bottomButton";
import { useOrderStore } from "@/components/store/useOrderData";
import { useMutation } from "@tanstack/react-query";
import { apiRpc } from "@hi/common";
import { useLiteStore } from "@/components/store/useLiteStore";
import { useNavigate, useParams } from "react-router-dom";
import SpinnerMemo from "../loadingSpinner";

const MemoKickUser = () => {
    const {
        setTransferTable,
        setTransferModal,
        setSelectedItems,
        selectedTable,
        setOpenOrderModal
    } = useOrderStore();

    const { businessId } = useParams();
    const navigate = useNavigate();

    const { setSelectedNavItem } = useLiteStore()


    const closeModal = () => {
        setTransferModal(false);
        setTransferTable("");
        setSelectedItems([]);
    };

    const { isPending, mutateAsync } = useMutation({
        mutationFn: async () => {
            const response = await apiRpc.table.kick_user.$post({
                json: {
                    tableId: selectedTable?._id || "",
                },
            })
            const res = await response.json()
        },
        onSuccess: () => {
            setOpenOrderModal(false)
            setSelectedNavItem("Tables")
            return navigate(`/${businessId}/alerts`)
        },
    });

    if (isPending) {
        return <SpinnerMemo />
    }


    return (
        <div> <CommonBottomButton
            fixed
            maxWidth="48rem"
            buttons={[
                {
                    text: "Cancel",
                    onClick: closeModal,
                    isBackButton: true,
                    className: "pl-3 rounded-md",
                },
                {
                    text: "Free Table",
                    onClick: () => { mutateAsync(); },
                    className: "rounded-full",
                    swipe: true,
                },
            ]}
        /></div>
    )
}

const KickUser = memo(MemoKickUser)
export default KickUser