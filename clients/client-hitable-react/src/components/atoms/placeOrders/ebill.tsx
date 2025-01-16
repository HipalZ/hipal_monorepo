import { useState, memo } from "react";
import { useOrderStore } from "@/components/store/useOrderData";
import type { IUserId } from "@/components/types/hiClientzData";
import { apiRpc } from "@hi/common";
import { useMutation, useQuery } from "@tanstack/react-query";
import CommonBottomButton from "../bottomButton";
import { useScreenSize } from "@/hooks/useScreenSize";
import { useParams } from "react-router-dom";
import toast from "react-hot-toast";
import SpinnerMemo from "../loadingSpinner";

const MemoEbill = () => {
    const screenSize = useScreenSize();
    const { selectedTable, setOpenOrderModal } = useOrderStore();
    const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
    const { businessId } = useParams()

    // Fetch all users associated with the table
    const getAllUser = async () => {
        const response = await apiRpc.table.kot_users.$post({
            json: {
                userIds: selectedTable?.userIds || [],
            },
        });
        const res = await response.json();
        return res?.data as IUserId[];
    };

    const { isLoading, data: users } = useQuery({
        queryKey: ["getCustomerInformation", selectedTable?.userIds],
        queryFn: getAllUser,
        enabled: !!selectedTable?.userIds?.length,
    });

    // Toggle user selection
    const handleUserSelect = (userId: string) => {
        setSelectedUsers((prev) =>
            prev.includes(userId)
                ? prev.filter((id) => id !== userId)
                : [...prev, userId]
        );
    };

    const { isPending, mutateAsync } = useMutation({
        mutationFn: async () => {
            const response = await apiRpc.table.e_bill.$post({
                json: {
                    userIds: selectedUsers,
                    tableId: selectedTable?._id || "",
                    businessId: businessId || "",
                },
            });
            return response.json();
        },
        onSuccess: () => {
            setOpenOrderModal(false)
            toast.success("E-Bill sent successfully");
        },
        onError: (error) => {
            console.error("Error sending E-Bill:", error);
        },
    })

    if (isPending || isLoading) {
        return <SpinnerMemo />
    }


    return (
        <div className="pt-[7rem] md:pt-[8.5rem]">
            <h2 className="mb-6 text-2xl font-bold text-center">Select Users to Send E-Bill</h2>

            {/* Users List */}
            <div className="grid grid-cols-1 gap-4 mx-4 md:grid-cols-2 lg:grid-cols-3 pb-[10rem]">
                {isLoading ? (
                    <p>Loading users...</p>
                ) : (
                    users?.map((user) => (
                        <div
                            key={user._id}
                            onClick={() => handleUserSelect(user._id)}
                            className={`cursor-pointer p-4 rounded-md border transition-all ${selectedUsers.includes(user._id)
                                ? "bg-blue-100 border-blue-500"
                                : "bg-white border-gray-300"
                                }`}
                        >
                            <div className="flex items-center justify-between">
                                <p className="text-lg font-semibold">{user.name}</p>
                                <input
                                    type="checkbox"
                                    checked={selectedUsers.includes(user._id)}
                                    onChange={() => handleUserSelect(user._id)}
                                    className="w-5 h-5 text-blue-600 form-checkbox"
                                />
                            </div>
                            <p className="text-gray-500">{user?.phone.slice(0, 3)}****{user?.phone.slice(-3)}</p>
                        </div>
                    ))
                )}
            </div>

            {/* Bottom Button */}
            <CommonBottomButton
                maxWidth="48rem"
                position="mid"
                fixed
                shadow
                offset={screenSize === "xs" || screenSize === "md" ? "5rem" : "0rem"}
                buttons={[
                    {
                        text: "Send E-Bill",
                        onClick: () => {
                            mutateAsync()
                        },
                        className: "rounded-md shadow-md w-full",
                        disable: selectedUsers.length === 0,
                    },
                ]}
            />
        </div>
    );
};

const Ebill = memo(MemoEbill);
export default Ebill;
