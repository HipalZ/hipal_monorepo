import useWhatsapp from "@/components/store/useWhatsapp";
import { useCallback, useMemo } from "react";
import { BsBell, BsWallet2 } from "react-icons/bs";

const NotifyAndWallet = () => {
  const {
    notifications,
    setNotifications,
    showNotifications,
    setShowNotifications,
    walletBalance,
  } = useWhatsapp((s) => ({
    notifications: s.notifications,
    setNotifications: s.setNotifications,
    walletBalance: s.walletBalance,
    showNotifications: s.showNotifications,
    setShowNotifications: s.setShowNotifications,
  }));

  const unreadCount = useMemo(
    () => notifications.filter((n) => !n.isRead).length,
    [notifications],
  );

  const handleNotificationClick = useCallback(() => {
    setShowNotifications(!showNotifications);
    if (showNotifications) {
      setNotifications(notifications.map((n) => ({ ...n, isRead: true })));
    }
  }, [
    setShowNotifications,
    showNotifications,
    notifications,
    setNotifications,
  ]);

  return (
    <div className="flex items-center justify-end gap-2 -mr-4 lg:gap-4 md:mr-0">
      {/* Notifications */}
      <div className="relative">
        <button
          type="button"
          className="relative p-2 rounded-full hover:bg-gray-100"
          onClick={handleNotificationClick}
        >
          <BsBell className="text-xl" />
          {unreadCount > 0 && (
            <span className="absolute flex items-center justify-center w-4 h-4 text-xs text-white bg-red-500 rounded-full -top-1 -right-1">
              {unreadCount}
            </span>
          )}
        </button>

        {showNotifications && (
          <div className="absolute right-0 z-10 w-64 p-2 mt-2 bg-white rounded-lg shadow-lg">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`p-2 text-sm ${
                  notification.isRead
                    ? "text-gray-500"
                    : "text-black font-medium"
                }`}
              >
                {notification.message}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Wallet */}
      <div className="flex items-center gap-2 px-3 py-1 bg-white rounded-full shadow">
        <BsWallet2 className="text-lg" />
        <span className="font-semibold">{walletBalance}</span>
      </div>
    </div>
  );
};

export default NotifyAndWallet;
