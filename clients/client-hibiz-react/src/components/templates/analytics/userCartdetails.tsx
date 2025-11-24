import BottomButton from '@/components/atom/bottomButton';
import PopUp from '@/components/atom/popUp';
import MemoizedHeader from '@/components/molecules/header';
import { AnimatePresence, motion } from 'framer-motion';
import { memo, useState, type FC } from 'react';
import { BiRupee } from 'react-icons/bi';
import {
  FaArrowLeft,
  FaBrain,
  FaChartLine, // New
  FaCheckCircle, // New
  FaChevronDown,
  FaClock,
  FaExclamationCircle, // New
  FaSyncAlt, // New
  FaUtensils,
} from 'react-icons/fa';
import { MdAddIcCall, MdRestaurantMenu } from 'react-icons/md';
import MemoFoodType from '../../atom/FoodType';

// ... (CartItem and UserCart interfaces remain the same) ...
interface CartItem {
  _id: string;
  dish: {
    name: string;
    price: number;
    description: string;
    images: string[];
    dishTypes?: string[];
  };
  portion: {
    name: string;
    price: number;
  } | null;
  quantity: number;
}

interface UserCart {
  _id: string;
  userId: { name: string; phone: string };
  tableName: string;
  cart: CartItem[];
  date: number;
}

// --- NEW: Structured User Profile Interface ---
interface UserProfile {
  totalRevenue: number;
  avgOrderValue: number;
  totalOrders: number;
  loyaltyType: 'Loyal' | 'Regular' | 'Occasional' | 'New';
  spenderType: 'Premium' | 'Mid-range' | 'Value';
  valueAdd: 'High-value' | 'Solid' | 'Growing';
  topType: string;
  daysSinceLast: number;

  // --- NEW: Professional Report Structure ---
  headline: string;
  bulletPoints: { icon: 'value' | 'avg' | 'freq' | 'status'; text: string }[];
}

// --- REFACTORED: generateUserProfile to output a professional report ---
const generateUserProfile = (cartData: UserCart[]): UserProfile => {
  const totalOrders = cartData.length;

  // --- Base case for new user ---
  if (totalOrders === 0) {
    return {
      totalRevenue: 0,
      avgOrderValue: 0,
      totalOrders: 0,
      loyaltyType: 'New',
      spenderType: 'Value',
      valueAdd: 'Growing',
      topType: 'N/A',
      daysSinceLast: 0,
      headline: 'New customer with no order history.',
      bulletPoints: [],
    };
  }

  // --- All calculations remain the same ---
  const sortedCarts = [...cartData].sort((a, b) => a.date - b.date);
  const totalRevenue = sortedCarts.reduce((sum, cart) => {
    return sum + cart.cart.reduce((s, item) => s + (item.portion?.price || item.dish.price) * item.quantity, 0);
  }, 0);
  const avgOrderValue = totalRevenue / totalOrders;
  const lastOrderDate = new Date(sortedCarts[sortedCarts.length - 1].date);
  const timeSpanDays = (lastOrderDate.getTime() - new Date(sortedCarts[0].date).getTime()) / (1000 * 60 * 60 * 24);
  const daysSinceLast = Math.floor((Date.now() - lastOrderDate.getTime()) / (1000 * 60 * 60 * 24));
  const orderFreq = totalOrders > 1 ? (timeSpanDays / (totalOrders - 1)).toFixed(0) : 'N/A';

  const allItems = sortedCarts.flatMap((c) => c.cart);
  const allDishTypes = allItems.flatMap((item) => item.dish.dishTypes || []);
  const typeCounts: Record<string, number> = {};
  allDishTypes.forEach((type) => {
    const normalizedType = type.toLowerCase().trim();
    typeCounts[normalizedType] = (typeCounts[normalizedType] || 0) + 1;
  });
  const topType = Object.entries(typeCounts).sort(([, a], [, b]) => b - a)[0]?.[0] || 'Varied';

  const spenderType = avgOrderValue > 400 ? 'Premium' : avgOrderValue > 200 ? 'Mid-range' : 'Value';
  const loyaltyType = totalOrders > 5 ? 'Loyal' : totalOrders > 2 ? 'Regular' : 'Occasional';
  const valueAdd = totalRevenue > 2000 ? 'High-value' : totalRevenue > 500 ? 'Solid' : 'Growing';

  // --- NEW: Professional Headline & Bullets ---
  const headline = `A ${loyaltyType}, ${spenderType.toLowerCase()} diner with a preference for ${
    topType.charAt(0).toUpperCase() + topType.slice(1)
  } dishes.`;

  const bulletPoints: UserProfile['bulletPoints'] = [];

  // 1. Total Value
  bulletPoints.push({
    icon: 'value',
    text: `Total Value:** ₹${totalRevenue.toFixed(0)} (${valueAdd} Contributor)`,
  });

  // 2. Avg. Order
  bulletPoints.push({
    icon: 'avg',
    text: `Avg. Order:** ₹${avgOrderValue.toFixed(0)}`,
  });

  // 3. Frequency
  const freqText = orderFreq === 'N/A' ? 'Only 1 visit' : `Every ${orderFreq} days`;
  bulletPoints.push({
    icon: 'freq',
    text: `Visit Frequency:** ${freqText}`,
  });

  // 4. Activity Status (Actionable)
  const statusText = daysSinceLast === 0 ? `Status:** Active Today` : `Status:** Last visit ${daysSinceLast} days ago`;

  const statusIcon = daysSinceLast > 30 ? 'status' : 'status';

  bulletPoints.push({
    icon: statusIcon,
    text: statusText,
  });

  return {
    totalRevenue,
    avgOrderValue,
    totalOrders,
    loyaltyType,
    spenderType,
    valueAdd,
    topType: topType.charAt(0).toUpperCase() + topType.slice(1),
    daysSinceLast,
    headline,
    bulletPoints,
  };
};

const getBadgeColor = (type: 'loyalty' | 'spender' | 'value') => {
  switch (type) {
    case 'loyalty':
      return 'bg-green-100 text-green-800 ring-green-200';
    case 'spender':
      return 'bg-purple-100 text-purple-800 ring-purple-200';
    case 'value':
      return 'bg-indigo-100 text-indigo-800 ring-indigo-200';
    default:
      return 'bg-gray-100 text-gray-800 ring-gray-200';
  }
};

const BulletIcon: FC<{ icon: string; daysSinceLast: number }> = ({ icon, daysSinceLast }) => {
  const commonClasses = 'mr-3 text-lg flex-shrink-0 mt-0.5';
  switch (icon) {
    case 'value':
      return <FaChartLine className={`${commonClasses} text-indigo-600`} />;
    case 'avg':
      return <BiRupee className={`${commonClasses} text-green-600`} />;
    case 'freq':
      return <FaSyncAlt className={`${commonClasses} text-blue-600`} />;
    case 'status':
      return daysSinceLast > 30 ? (
        <FaExclamationCircle className={`${commonClasses} text-red-600`} />
      ) : (
        <FaCheckCircle className={`${commonClasses} text-amber-600`} />
      );
    default:
      return null;
  }
};

const MemoCartPopup: FC<{ cartData: UserCart[]; onClose: () => void }> = ({ cartData, onClose }) => {
  const [expanded, setExpanded] = useState<string | null>(null);
  const userProfile = generateUserProfile(cartData);

  const toggleAccordion = (id: string) => {
    setExpanded(expanded === id ? null : id);
  };

  return (
    <PopUp show={true} onClose={onClose} width="w-full" height="h-[100dvh] lg:h-[90dvh]" hide>
      <div className="h-[85lvh] overflow-auto bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50 pb-[7rem]">
        {/* Sticky Header */}
        <article className="sticky top-0 z-50 border-b border-amber-200 bg-white/95 shadow-sm backdrop-blur-md">
          <MemoizedHeader onBack={onClose} title="Customer Profile" leftIcon={<FaArrowLeft className="text-amber-600" />} />
          <div className="border-t border-amber-200 bg-gradient-to-r from-amber-100 to-orange-100 px-6 py-3">
            <div className="flex items-center justify-between text-sm font-bold text-gray-700">
              <span className="flex items-center">Total Value: ₹ {userProfile.totalRevenue.toFixed(0)}</span>
              <span className="flex items-center">
                <FaUtensils className="mr-1 text-amber-600" />
                {userProfile.totalOrders} Order{userProfile.totalOrders !== 1 ? 's' : ''}
              </span>
            </div>
          </div>
        </article>

        {cartData.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mx-6 mt-4">
            <div className="relative overflow-hidden rounded-2xl bg-white p-6 shadow-lg ring-1 ring-amber-200/50">
              <div className="absolute inset-0 bg-gradient-to-r from-amber-50/50 to-orange-50/50" />
              <div className="relative z-10 space-y-4">
                <h3 className="flex items-center text-lg font-bold text-gray-800">
                  <FaBrain className="mr-2 text-amber-600" />
                  AI Customer Insights
                </h3>

                {/* VISUAL BADGES (These are great) */}
                <div className="flex flex-wrap gap-2">
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold ring-1 ${getBadgeColor('loyalty')}`}>{userProfile.loyaltyType}</span>
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold ring-1 ${getBadgeColor('spender')}`}>{userProfile.spenderType}</span>
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold ring-1 ${getBadgeColor('value')}`}>{userProfile.valueAdd}</span>
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold ring-1 ${getBadgeColor('value')}`}>
                    Favors: {userProfile.topType}
                  </span>
                </div>

                <div className="border-t border-gray-200 pt-4">
                  {/* Headline */}
                  <p className="mb-4 text-base font-medium text-gray-800">{userProfile.headline}</p>

                  {/* Bulleted List */}
                  <ul className="space-y-2.5">
                    {userProfile.bulletPoints.map((item, idx) => {
                      const parts = item.text.split(':**'); // Split on ':**'
                      const label = parts[0] + ':';
                      const value = parts[1];

                      return (
                        <li key={idx} className="flex items-start text-sm">
                          <BulletIcon icon={item.icon} daysSinceLast={userProfile.daysSinceLast} />
                          <span className="text-gray-700">
                            <span className="font-semibold text-gray-900">{label}</span>
                            {value}
                          </span>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Order History Title */}
        <h4 className="px-6 pb-2 pt-6 text-base font-bold text-gray-600">Order History</h4>

        <div className="grid grid-cols-3 gap-4 px-6 py-4">
          {cartData.map((cart, index) => {
            const cartTotal = cart.cart.reduce((sum, item) => sum + (item.portion?.price || item.dish.price) * item.quantity, 0);
            return (
              <motion.section
                key={cart._id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05, type: 'spring', stiffness: 300 }}
                className="w-full"
              >
                {/* Accordion Header */}
                <motion.div
                  onClick={() => toggleAccordion(cart._id)}
                  className="group relative flex cursor-pointer items-center justify-between overflow-hidden rounded-2xl border border-gray-200 bg-white p-5 shadow-lg transition-all duration-300 hover:scale-[1.01] hover:border-amber-300 hover:shadow-xl active:scale-[0.99]"
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="relative z-10 flex-1">
                    <div className="mb-1 flex items-center">
                      <div className="mr-3 h-3 w-3 rounded-full bg-amber-500 shadow-sm" />
                      <h3 className="text-lg font-bold text-gray-900">{cart.tableName}</h3>
                    </div>
                    <p className="flex items-center text-sm text-gray-600">
                      <MdAddIcCall className="mr-2 text-amber-600" />
                      {cart.userId.phone}
                    </p>
                    <p className="mt-0.5 flex items-center text-xs text-gray-500">
                      <FaClock className="mr-1 text-gray-400" />
                      {new Date(cart.date).toLocaleString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                  <div className="relative z-10 ml-4 flex flex-col items-end">
                    <p className="mb-1 text-lg font-bold text-amber-600">₹{cartTotal.toFixed(2)}</p>
                    <p className="text-sm text-gray-500">
                      {cart.cart.length} item{cart.cart.length !== 1 ? 's' : ''}
                    </p>
                    <motion.div className="mt-2" animate={{ rotate: expanded === cart._id ? 180 : 0 }} transition={{ duration: 0.3 }}>
                      <FaChevronDown
                        className={`text-xl transition-colors duration-200 ${expanded === cart._id ? 'text-amber-600' : 'text-gray-400 group-hover:text-amber-600'}`}
                      />
                    </motion.div>
                  </div>
                </motion.div>

                {/* Expanded Content */}
                <AnimatePresence>
                  {expanded === cart._id && (
                    <motion.div
                      initial={{ opacity: 0, height: 0, scaleY: 0.95 }}
                      animate={{ opacity: 1, height: 'auto', scaleY: 1 }}
                      exit={{ opacity: 0, height: 0, scaleY: 0.95 }}
                      transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
                      className="mt-2 overflow-hidden"
                    >
                      <div className="space-y-3 rounded-2xl border border-gray-200 bg-gray-50 p-4">
                        {cart.cart.length === 0 ? (
                          <div className="py-6 text-center text-gray-500">
                            <FaUtensils className="mx-auto mb-2 text-3xl text-gray-300" />
                            <p className="text-sm">No dishes in this order</p>
                          </div>
                        ) : (
                          cart.cart.map((item, itemIndex) => {
                            const itemPrice = (item.portion?.price || item.dish.price).toFixed(2);
                            const itemTotal = (Number.parseFloat(itemPrice) * item.quantity).toFixed(2);
                            return (
                              <motion.div
                                key={item._id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: itemIndex * 0.1, duration: 0.3 }}
                                className="group flex items-start overflow-hidden rounded-xl border border-gray-100 bg-white p-4 shadow-sm transition-all duration-200 hover:border-amber-200 hover:shadow-md"
                              >
                                {/* Image with quantity badge */}
                                <div className="relative mr-4 flex-shrink-0">
                                  {item?.dish?.images?.length > 0 ? (
                                    <img
                                      src={item.dish.images[0] || '/placeholder-dish.jpg'}
                                      alt={item.dish.name}
                                      className="h-20 w-20 rounded-xl object-cover shadow-md"
                                    />
                                  ) : (
                                    <div className="h-20 w-20 rounded-xl bg-gray-200" />
                                  )}
                                  <div className="absolute -right-1 -top-1 rounded-full bg-amber-500 px-2 py-0.5 text-xs font-bold text-white shadow-lg">
                                    ×{item.quantity}
                                  </div>
                                </div>

                                {/* Details */}
                                <div className="min-w-0 flex-1">
                                  <div className="mb-1 flex items-center justify-between">
                                    <h4 className="flex items-center text-base font-bold leading-tight text-gray-900">
                                      <MdRestaurantMenu className="mr-2 text-lg text-amber-600" />
                                      {item.dish.name}
                                    </h4>
                                    <MemoFoodType types={item.dish?.dishTypes} />
                                  </div>
                                  <p className="mb-2 line-clamp-2 text-sm text-gray-600">{item.dish.description}</p>
                                  {item.portion && (
                                    <p className="mb-1 inline-block rounded-md bg-amber-100 px-2 py-1 text-xs text-amber-800">{item.portion.name}</p>
                                  )}
                                  <div className="flex items-end justify-between">
                                    <div className="space-y-0.5">
                                      <p className="text-sm font-medium text-gray-900">₹{itemTotal}</p>
                                      <p className="text-xs text-gray-500">@{itemPrice} each</p>
                                    </div>
                                  </div>
                                </div>

                                {/* Hover accent line */}
                                <div className="absolute bottom-0 left-0 h-0.5 w-full origin-left scale-x-0 bg-gradient-to-r from-amber-500 to-orange-500 transition-transform duration-300 group-hover:scale-x-100" />
                              </motion.div>
                            );
                          })
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.section>
            );
          })}
        </div>

        {/* Bottom Button */}
        <BottomButton
          buttons={[
            {
              text: 'Close',
              onClick: onClose,
            },
          ]}
        />
      </div>
    </PopUp>
  );
};

const CartPopup = memo(MemoCartPopup);
export default CartPopup;
