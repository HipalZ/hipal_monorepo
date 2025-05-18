import { memo, useState, type FC } from "react";
import { useQuery } from "@tanstack/react-query";
import { FaUsers, FaUser, FaPhone } from "react-icons/fa";
import useBusinessData from "@/components/store/useBusinessData";
import { apiRpc } from "@hi/common";
import CartPopup from "./userCartdetails";

export interface User {
  _id: string;
  name: string;
  phone: string;
}

export interface ApiResponse {
  err: boolean;
  data: User[];
  message: string;
}

const MemoUserUnique: FC = () => {
  const businessID = useBusinessData((state) => state.businessData?._id);
  const [openUserDetailsModel, setOpenUserDetailsModel] = useState(false);
  const [userCart, setUserCart] = useState([]);

  const getUsers = async (): Promise<ApiResponse> => {
    const response = await apiRpc.cart[":businessId"].user.$get({
      param: {
        businessId: businessID || "",
      },
    });

    return response.json();
  };

  const getUSersAllCarts = async (id: string) => {
    const response = await apiRpc.cart.userAnalytics[":userId"].$get({
      param: {
        userId: id,
      },
      query: {
        businessId: businessID || "",
      },
    });

    const res = await response.json();
    setUserCart(res.data || []);
  };

  const getUserCart = async (id: string) => {
    setOpenUserDetailsModel(true);
    await getUSersAllCarts(id);
  };

  const { isLoading, data, error } = useQuery<ApiResponse, Error>({
    queryKey: ["getUsers", businessID],
    queryFn: getUsers,
    enabled: !!businessID,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">Loading...</div>
    );
  }

  if (error || !data || data.err) {
    return (
      <div className="flex items-center justify-center h-64 text-red-500">
        {error?.message || data?.message || "Unknown error"}
      </div>
    );
  }

  const users = data.data || [];

  return (
    <section className="px-4 mt-16 lg:mt-4">
      <h2 className="flex items-center mb-4 text-2xl font-semibold">
        <FaUsers className="mr-2" /> Users
      </h2>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {users.map((user: User) => (
          <div
            onClick={() => getUserCart(user._id)}
            key={user._id}
            className="p-4 bg-white rounded-lg shadow-md cursor-pointer hover:shadow-lg"
          >
            <h3 className="flex items-center mb-2 text-lg font-semibold">
              <FaUser className="mr-2" /> {user?.name}
            </h3>
            <p className="flex items-center text-gray-600">
              <FaPhone className="mr-2" /> {user?.phone}
            </p>
          </div>
        ))}
      </div>
      {openUserDetailsModel && (
        <CartPopup
          cartData={userCart}
          onClose={() => setOpenUserDetailsModel(false)}
        />
      )}
    </section>
  );
};

const UserUnique = memo(MemoUserUnique);
export default UserUnique;
