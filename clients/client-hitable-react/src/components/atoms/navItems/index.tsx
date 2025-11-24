import useBusinessData from '@/components/store/useBusinessData';
import { useLiteStore } from '@/components/store/useLiteStore';
import { NavItemTypesEnum, type NavItemTypes } from '@/components/types/hiClientzData';
import useNavItems from '@/hooks/useNavItems';
import { AnimatePresence, motion } from 'framer-motion';
import { memo, useCallback } from 'react';

const MemoNavItems = () => {
  const selectedNavItem = useLiteStore((s) => s.selectedNavItem);
  const setSelectedNavItem = useLiteStore((s) => s.setSelectedNavItem);
  const onlineCount = useLiteStore((s) => s.onlineCount);
  const offlineCount = useLiteStore((s) => s.offlineCount);
  const cartCount = useLiteStore((s) => s.cartCount);

  const outletInfo = useBusinessData((s) => s.outletInfo);

  const handleNavItemClick = useCallback(
    (type: NavItemTypes) => {
      setSelectedNavItem(type);
    },
    [setSelectedNavItem],
  );

  const handleCount = useCallback(
    (type: string) => {
      if (type === NavItemTypesEnum.ALERTS && onlineCount > 0) {
        return onlineCount + offlineCount;
      }
      if (type === NavItemTypesEnum.CART && cartCount > 0) {
        return cartCount;
      }
      return null;
    },
    [offlineCount, onlineCount, cartCount],
  );

  const navItems = useNavItems(outletInfo?.isPosEnabled);

  return (
    <>
      {navItems.map(({ type, icon: Icon }) => {
        return (
          <motion.button
            key={type}
            onClick={() => handleNavItemClick(type)}
            className={`flex w-full max-w-[24rem] items-center justify-center rounded-full px-4 py-2 ${
              selectedNavItem === type ? 'bg-purple-100 text-purple-600' : 'text-gray-500 hover:bg-gray-200'
            } relative`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 400, damping: 17 }}
          >
            <Icon
              size={24}
              className={` ${
                selectedNavItem === type ? 'text-purple-600' : 'text-gray-500 group-hover:text-gray-700'
              } transition-colors duration-300`}
            />
            <AnimatePresence>
              {selectedNavItem === type && (
                <motion.span
                  className="ml-2 overflow-hidden whitespace-nowrap font-medium"
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: 'auto' }}
                  exit={{ opacity: 0, width: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  {type}
                </motion.span>
              )}
            </AnimatePresence>

            {handleCount(type) !== null && (
              <motion.span
                className="absolute -top-2 right-1 z-50 rounded-full bg-red-500 px-2 py-1 text-xs font-bold text-white"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 500, damping: 25 }}
              >
                {handleCount(type)}
              </motion.span>
            )}
          </motion.button>
        );
      })}
    </>
  );
};

const NavItems = memo(MemoNavItems);
export default NavItems;
