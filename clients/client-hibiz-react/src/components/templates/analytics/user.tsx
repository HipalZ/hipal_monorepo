import useBusinessData from '@/components/store/useBusinessData';
import { apiRpc } from '@hi/common';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { memo, useState, type FC } from 'react';
import { FaChevronDown, FaPhone, FaStar, FaUser, FaUsers, FaUtensils } from 'react-icons/fa';
import CartPopup from './userCartdetails';

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
    const response = await apiRpc.cart[':businessId'].user.$get({
      param: {
        businessId: businessID || '',
      },
    });

    return response.json();
  };

  const getUSersAllCarts = async (id: string) => {
    const response = await apiRpc.cart.userAnalytics[':userId'].$get({
      param: {
        userId: id,
      },
      query: {
        businessId: businessID || '',
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
    queryKey: ['getUsers', businessID],
    queryFn: getUsers,
    enabled: !!businessID,
  });

  if (isLoading) {
    return (
      <div className="flex h-64 flex-col items-center justify-center space-y-4">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY, ease: 'linear' }}
          className="text-4xl text-amber-500"
        >
          <FaUsers />
        </motion.div>
        <p className="text-gray-600">Fetching loyal customers...</p>
      </div>
    );
  }

  if (error || !data || data.err) {
    return (
      <div className="flex h-64 flex-col items-center justify-center space-y-2 text-red-500">
        <FaUsers className="text-4xl" />
        <p>{error?.message || data?.message || 'Something went wrong'}</p>
      </div>
    );
  }

  const users = data.data || [];

  return (
    <section className="mt-16 min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50 px-4 py-8 lg:mt-4">
      {/* Header */}
      <motion.header initial={{ opacity: 0, y: -30 }} animate={{ opacity: 1, y: 0 }} className="mb-8 text-center">
        <h2 className="mb-2 flex items-center justify-center text-4xl font-extrabold text-gray-800">
          <FaUsers className="mr-3 text-5xl text-amber-600" />
          Your Customers
        </h2>
        <p className="text-lg text-gray-600">Discover who loves your menu the most</p>
        <div className="mx-auto mt-4 h-1 w-24 rounded-full bg-gradient-to-r from-amber-500 to-orange-500" />
      </motion.header>

      {/* Users Grid */}
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {users.map((user: User, index) => (
          <motion.article
            key={user._id}
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{
              delay: index * 0.1,
              duration: 0.6,
              type: 'spring',
              stiffness: 200,
              damping: 15,
            }}
            onClick={() => getUserCart(user._id)}
            className="group relative transform cursor-pointer overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-xl transition-all duration-500 hover:-translate-y-3 hover:border-amber-300 hover:shadow-2xl active:translate-y-1"
            whileHover={{ scale: 1.02, rotateX: 2 }}
            whileTap={{ scale: 0.98 }}
          >
            {/* Gradient overlay on hover */}
            <div className="absolute inset-0 bg-gradient-to-br from-amber-500/0 via-orange-500/5 to-rose-500/0 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

            {/* Decorative top-right badge */}
            <div className="absolute right-4 top-4 z-10 translate-x-4 transform opacity-0 transition-opacity duration-300 group-hover:translate-x-0 group-hover:opacity-100">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 shadow-lg">
                <FaStar className="text-sm text-white" />
              </div>
            </div>

            {/* Card Content */}
            <div className="relative z-10 p-6">
              {/* Avatar-like icon */}
              <div className="mb-4 flex items-start">
                <div className="relative mr-4 flex-shrink-0">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 shadow-lg transition-shadow duration-300 group-hover:shadow-xl">
                    <FaUser className="text-2xl text-white" />
                  </div>
                  <div className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-green-400 shadow-md">
                    <FaUtensils className="text-xs text-white" />
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="mb-1 text-xl font-bold text-gray-900">{user.name}</h3>
                </div>
              </div>

              {/* Contact Info */}
              <div className="mb-4 space-y-3">
                <p className="flex items-center rounded-xl bg-gray-50 p-3 text-gray-700 transition-colors duration-300 group-hover:bg-amber-50">
                  <FaPhone className="mr-3 text-lg text-amber-600" />
                  <span className="font-medium">{user.phone}</span>
                </p>
              </div>

              {/* Click prompt */}
              <motion.div
                className="absolute bottom-4 left-1/2 -translate-x-1/2 transform opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                initial={{ y: 10 }}
                whileHover={{ y: 0 }}
              >
                <p className="flex items-center text-xs font-medium text-amber-600">
                  View Orders <FaChevronDown className="ml-1 text-sm" />
                </p>
              </motion.div>
            </div>
          </motion.article>
        ))}
      </div>

      {/* Empty State if no users */}
      {users.length === 0 && (
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="py-16 text-center">
          <FaUsers className="mx-auto mb-4 text-6xl text-gray-300" />
          <h3 className="mb-2 text-2xl font-bold text-gray-500">No customers yet</h3>
          <p className="text-gray-400">Start serving to build your guest list</p>
        </motion.div>
      )}

      {/* Popup */}
      {openUserDetailsModel && <CartPopup cartData={userCart} onClose={() => setOpenUserDetailsModel(false)} />}
    </section>
  );
};

const UserUnique = memo(MemoUserUnique);
export default UserUnique;
