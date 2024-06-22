import { Menu, MenuButton, MenuItems, MenuItem } from '@headlessui/react';
import avatar from "@/assets/img/avatar.png";
import { memo, startTransition } from 'react';
import { cn } from '@/components/utils/helpers';
import { useNavigate } from 'react-router-dom';
import { useParams } from 'react-router-dom';

const ProfileHeader = memo((props: { position: boolean }) => {
    const { position } = props;
    const navigate = useNavigate()
    const params = useParams();
    const businessId = params.businessId;
    const defaultClass = "group flex rounded-md items-center w-full px-2 py-2 text-base font-semibold"

    const redirectDashboard = () =>{
        startTransition(()=>{
            navigate(`/l/${businessId}/businesses`)
        })
    }

    const handleLogout = () =>{
        startTransition(()=>{
            navigate(`/l/${businessId}/login`)
        })
    }

    return (
        <Menu as="div" className="relative inline-block text-left">
            <div>
                <MenuButton className="inline-flex justify-center w-full rounded-full p-1 bg-gray-300 text-white">
                    <img src={avatar} alt="avatar" className="sm:w-10 sm:h-10 lg:h-12 lg:w-12 rounded-full" />
                </MenuButton>
            </div>
            <MenuItems className="absolute right-0 mt-2 w-56 origin-top-right bg-white divide-y divide-gray-100 rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                <div className="border-1 border-black absolute top-[-10px] right-8 w-4 h-4 bg-white rotate-45"></div>
                <div className="px-1 py-1">
                    <MenuItem>
                        {({ active }) => (
                            <button
                                disabled={position}
                                onClick={redirectDashboard}
                                className={cn(defaultClass,
                                    active ? 'bg-gray-100' : '', position ? 'opacity-50' : '')}
                            >
                                Dashboard
                            </button>
                        )}
                    </MenuItem>
                    <MenuItem>
                        {({ active }) => (
                            <button
                                onClick={handleLogout}
                                className={cn(defaultClass, active ? 'bg-gray-100' : '')}
                            >
                                Logout
                            </button>
                        )}
                    </MenuItem>
                </div>
            </MenuItems>
        </Menu>
    )
});

export default ProfileHeader;