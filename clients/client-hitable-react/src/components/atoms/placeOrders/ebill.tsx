import { useState, memo } from "react";
import { useOrderStore } from "@/components/store/useOrderData";
import type { IUserId } from "@/components/types/hiClientzData";
import { apiRpc } from "@hi/common";
import { useMutation, useQuery } from "@tanstack/react-query";
import CommonBottomButton from "../bottomButton";
import { useParams } from "react-router-dom";
import toast from "react-hot-toast";
import SpinnerMemo from "../loadingSpinner";
import { Phone, UserPlus, X } from "lucide-react";

const MemoEBill = () => {
  const selectedTable = useOrderStore((s) => s.selectedTable);
  const [phoneNumbers, setPhoneNumbers] = useState<string[]>([]);
  const [newPhoneNumber, setNewPhoneNumber] = useState("");
  const setShowEBill = useOrderStore((s) => s.setShowEBill);
  const selectedBill = useOrderStore((s) => s.selectedBill);

  const { businessId } = useParams();

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

  const handleUserSelect = (userPhone: string) => {
    if (phoneNumbers.includes(userPhone)) {
      setPhoneNumbers((prev) => prev.filter((phone) => phone !== userPhone));
    } else {
      setPhoneNumbers((prev) => {
        if (!prev.includes(userPhone)) {
          return [...prev, userPhone];
        }
        return prev;
      });
    }
  };

  const handleAddPhoneNumber = () => {
    if (
      newPhoneNumber.length === 10 &&
      !phoneNumbers.includes(newPhoneNumber)
    ) {
      setPhoneNumbers([...phoneNumbers, newPhoneNumber]);
      setNewPhoneNumber("");
    } else {
      toast.error("Please enter a valid and unique 10-digit phone number.");
    }
  };

  const handleRemovePhoneNumber = (phone: string) => {
    setPhoneNumbers((prev) => prev.filter((num) => num !== phone));
  };

  const { isPending, mutateAsync } = useMutation({
    mutationFn: async () => {

      const payload = {
        tableId:selectedTable?._id || "",
        businessId: businessId || "",
        phoneNumbers
      }
      if(selectedBill){
        payload.variantId = selectedBill?.variantId || "";
      }


      const response = await apiRpc.table.e_bill.$post({
        json: payload,
      });
      return response.json();
    },
    onSuccess: () => {
      setShowEBill(false);
      toast.success("E-Bill sent successfully");
    },
    onError: (error) => {
      toast.error("Failed to send E-Bill. Please try again.");
    },
  });

  if (isPending || isLoading) {
    return <SpinnerMemo />;
  }

  return (
    <div className="py-[5rem] pb-[15rem] md:py-[8.5rem] bg-gray-50 h-screen overflow-y-auto">
      <div className="max-w-4xl px-4 mx-auto sm:px-6 lg:px-8">
        <header className="mb-8 text-center">
          <h2 className="text-xl font-bold text-gray-900">Send E-Bill</h2>
          <p className="mt-2 text-sm text-gray-600">
            Select users or add phone numbers to send the E-Bill
          </p>
        </header>

        <div className="mb-8 overflow-hidden bg-white rounded-lg shadow-md">
          <div className="p-6">
            <h3 className="mb-4 text-lg font-semibold text-gray-900">
              Add Phone Numbers
            </h3>
            <div className="flex items-center gap-2 mb-4">
              <div className="relative flex-grow">
                <Phone className="absolute text-gray-400 transform -translate-y-1/2 left-3 top-1/2" />
                <input
                  type="text"
                  value={newPhoneNumber}
                  onChange={(e) =>
                    setNewPhoneNumber(e.target.value.replace(/\D/g, ""))
                  }
                  placeholder="Enter 10-digit phone number"
                  maxLength={10}
                  className="w-full py-2 pl-10 pr-4 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <button
                type="button"
                onClick={handleAddPhoneNumber}
                className="flex items-center px-4 py-2 text-white transition-colors duration-200 bg-blue-500 rounded-md hover:bg-blue-600"
              >
                <UserPlus className="mr-2" size={18} />
                Add
              </button>
            </div>
            {phoneNumbers.length > 0 && (
              <div className="mt-4">
                <h4 className="mb-2 text-sm font-medium text-gray-700">
                  Added Phone Numbers:
                </h4>
                <div className="flex flex-wrap gap-2">
                  {phoneNumbers.map((number, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-3 py-1 text-sm text-blue-800 bg-blue-100 rounded-full"
                    >
                      {number}
                      <button
                        type="button"
                        onClick={() => handleRemovePhoneNumber(number)}
                        className="ml-2 text-blue-600 hover:text-blue-800"
                      >
                        <X size={14} />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
        {users?.length > 0 && users && (
          <div className="mb-8 overflow-hidden bg-white rounded-lg shadow-md">
            <div className="p-6">
              <h3 className="mb-4 text-lg font-semibold text-gray-900">
                Select Users
              </h3>
              {isLoading ? (
                <p className="text-center text-gray-600">Loading users...</p>
              ) : (
                <div className="grid grid-cols-1 gap-4">
                  {users?.map((user) => (
                    <div
                      key={user._id}
                      onClick={() => handleUserSelect(user?.phone)}
                      className={`cursor-pointer p-4 rounded-md border transition-all ${
                        phoneNumbers.includes(user?.phone)
                          ? "bg-blue-50 border-blue-500"
                          : "bg-white border-gray-300 hover:border-blue-300"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <p className="text-lg font-semibold text-gray-900">
                          {user.name}
                        </p>
                        <input
                          type="checkbox"
                          checked={phoneNumbers.includes(user?.phone)}
                          onChange={() => handleUserSelect(user?.phone)}
                          className="w-5 h-5 text-blue-600 form-checkbox"
                        />
                      </div>
                      <p className="mt-1 text-sm text-gray-500">
                        {user?.phone?.slice(0, 3)}****{user?.phone?.slice(-3)}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <CommonBottomButton
        maxWidth="30rem"
        fixed={true}
        shadow
        buttons={[
          {
            text: "Send E-Bill",
            onClick: () => {
              mutateAsync();
            },
            className: "rounded-md w-full",
            disable: phoneNumbers.length === 0,
          },
        ]}
      />
    </div>
  );
};

const EBill = memo(MemoEBill);
export default EBill;
