import { Menu, MenuButton, MenuItems, MenuItem } from "@headlessui/react";
import avatar from "@/assets/img/avatar.png";
import { memo, useCallback } from "react";
import { cn } from "@/components/utils/helpers";
import { useNavigate } from "react-router-dom";
import { FiDownload } from "react-icons/fi";

const ProfileHeader = (props: { position: boolean }) => {
  const { position } = props;
  const navigate = useNavigate();
  const defaultClass =
    "group flex rounded-md items-center w-full px-2 py-2 text-base font-semibold";

  const redirectDashboard = useCallback(() => {
    navigate("/businesses");
  }, [navigate]);

  const handleLogout = useCallback(() => {
    localStorage.clear();
    navigate("/");
  }, []);

  return (
    <Menu as="div" className="relative inline-block text-left">
      <div>
        <MenuButton className="inline-flex justify-center w-full p-1 text-white bg-gray-300 rounded-full">
          <img
            src={avatar}
            alt="avatar"
            className="rounded-full sm:w-10 sm:h-10 lg:h-12 lg:w-12"
          />
        </MenuButton>
      </div>
      <MenuItems className="absolute right-0 w-56 mt-2 origin-top-right bg-white divide-y divide-gray-100 rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
        <div className="border-1 border-black absolute top-[-10px] right-8 w-4 h-4 bg-white rotate-45" />
        <div className="px-1 py-1">
          <MenuItem>
            {({ active }) => (
              <a
                href="https://t-static.blr1.digitaloceanspaces.com/hiclient_v1.apk"
                className={cn(
                  defaultClass,
                  active ? "bg-gray-100" : "",
                  "text-blue-500",
                )}
              >
                <FiDownload className="mr-4" size={20} /> Download App
              </a>
            )}
          </MenuItem>
          <MenuItem>
            {({ active }) => (
              <button
                type="button"
                disabled={position}
                onClick={redirectDashboard}
                className={cn(
                  defaultClass,
                  active ? "bg-gray-100" : "",
                  position ? "opacity-50" : "",
                )}
              >
                Dashboard
              </button>
            )}
          </MenuItem>
          <MenuItem>
            {({ active }) => (
              <button
                type="button"
                onClick={handleLogout}
                className={cn(defaultClass, active ? "bg-gray-100" : "")}
              >
                Logout
              </button>
            )}
          </MenuItem>
        </div>
      </MenuItems>
    </Menu>
  );
};

const MemoProfileHeader = memo(ProfileHeader);
export default MemoProfileHeader;
