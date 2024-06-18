import axios from '@/axios';
import LoadingSpinner from '@/components/atom/loadingSpinner';
import ErrorComponent from '@/components/errorComponent';
import type { UserProfile } from '@/components/types/businessData';
import { useQuery } from '@tanstack/react-query';
import React, { memo, useState } from 'react';
import Switch from 'react-switch';
import { toast } from 'react-toastify';

interface IAddStaff {
  businessId: string;
  onClose: () => void;
  staffDetails: UserProfile[];
  getStaff: () => void;
}
interface IRole {
  _id: string;
  id: string;
  name: string;
  permissions: string[];
  businessId: string;
}
const AddStaffPopup: React.FC<IAddStaff> = ({ businessId, onClose, staffDetails, getStaff }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [selectedRole, setSelectedRole] = useState<IRole | null>(null);
  const [errors, setErrors] = useState({
    name: false,
    email: false,
    phone: false,
    role: false,
  });
  const [toggleHiBizSwitch, setToggleHiBizSwitch] = useState(false);
  const [toggleHiTableSwitch, setToggleHiTableSwitch] = useState(false);
  const [hibizSubServices, setHibizSubServices] = useState({
    addAndDeleteItems: {
      label: 'Add and Delete Items',
      value: false,
    },
    addAndDeleteStaff: {
      label: 'Add & Delete Staff',
      value: false,
    },
    LoyaltyManagement: {
      label: 'Loyalty Management',
      value: false,
    },
    salesModules: {
      label: 'Sales Modules',
      value: false,
    },
    reports: {
      label: 'Reports',
      value: false,
    },
    addAndDeleteTablesOrZones: {
      label: 'Add & Delete Tables or Zones',
      value: false,
    },
  });

  const style = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  };
  const validateForm = () => {
    const newErrors = {
      name: !name,
      email: !email,
      phone: phone.length !== 10,
      role: !selectedRole,
    };
    setErrors(newErrors);

    let isValid = true;
    (Object.keys(newErrors) as (keyof typeof newErrors)[]).forEach((key) => {
      if (newErrors[key]) {
        toast.error(`Please fill the ${key} field.`);
        isValid = false;
      }
    });

    return isValid;
  };

  const generatePassword = () => {
    return Math.floor(1000 + Math.random() * 9000);
  };
  const handleSubmit = async () => {
    const staffExists = staffDetails.some((staff) => staff.name.toLowerCase() === name.toLowerCase() || staff.phone === phone);

    if (staffExists) {
      toast.error('Staff member with this name or phone number already exists');
      return;
    }
    if (!validateForm()) {
      return;
    }
    const password = generatePassword();
    const payload = {
      name,
      email,
      phone,
      password,
      role: 'RESTAURANT_MANAGER',
      customRole: selectedRole
        ? {
            businessId: businessId,
            customRoleId: selectedRole._id,
            permissions: selectedRole.permissions,
            roleName: selectedRole.name,
          }
        : null,
      accessControl: {
        dish: hibizSubServices.addAndDeleteItems.value,
        staff: hibizSubServices.addAndDeleteStaff.value,
        loyalty: hibizSubServices.LoyaltyManagement.value,
        sale: hibizSubServices.salesModules.value,
        reports: hibizSubServices.reports.value,
        zones_tables: hibizSubServices.addAndDeleteTablesOrZones.value,
      },
    };

    try {
      await axios.post('/v1/users?action=signup&clientRole=user', payload);
      getStaff();
      onClose();
      toast.success('Staff added sucessfully');
    } catch (error) {
      console.log('error:', error);
    }
  };

  const getAllRoles = async () => {
    try {
      const roles = await axios.get(`/v1/businesses/${businessId}/roles`);
      return roles.data;
    } catch (error) {
      console.log('error:', error);
    }
  };

  const {
    isLoading,
    error,
    data: roles,
    refetch,
  } = useQuery({
    queryKey: ['roles', businessId],
    queryFn: getAllRoles,
    enabled: !!businessId,
  });

  if (error) return <ErrorComponent refetch={refetch} />;

  return (
    <>
      {isLoading && <LoadingSpinner />}
      <div className="min-h-auto h-auto max-h-[85vh] overflow-auto rounded-t-3xl bg-[#f1f1f1] pb-[7rem] pt-4">
        <div className="px-4 text-xl font-semibold ">Add Staff</div>
        <div className="px-2 text-sm">
          <div className="mt-2 space-y-2 px-4">
            <span className="font-medium">Name of the Staff {errors.name && <span className="text-red-500">*</span>}</span>
            <input
              onChange={(e) => setName(e.target.value)}
              maxLength={24}
              value={name}
              type="text"
              className="peer mb-0 ml-0 mr-0 block w-full rounded-md border border-gray-800 bg-transparent bg-white pb-2 pl-4 pr-[7rem] pt-2 text-base text-gray-900 focus:border-[#000000] focus:outline-none focus:ring-0 dark:border-[#000000] dark:text-white"
              placeholder="Name"
            />
          </div>

          <div className="mt-4 space-y-2 px-4">
            <span className="font-medium">Email {errors.name && <span className="text-red-500">*</span>}</span>
            <input
              onChange={(e) => setEmail(e.target.value)}
              maxLength={50}
              value={email}
              type="email"
              className="peer mb-0 ml-0 mr-0 block w-full rounded-md border border-gray-800 bg-transparent bg-white pb-2 pl-4 pr-[7rem] pt-2 text-base text-gray-900 focus:border-[#000000] focus:outline-none focus:ring-0 dark:border-[#000000] dark:text-white"
              placeholder="Enter Email"
            />
          </div>
          <div className="mt-4 space-y-2 px-4">
            <span className="font-medium">Phone {errors.name && <span className="text-red-500">*</span>}</span>
            <input
              maxLength={10}
              onChange={(e) => {
                const value = e.target.value;
                // Allow only digits and limit to 10 digits
                if (value.length <= 10 && /^[0-9]*$/.test(value)) {
                  setPhone(value);
                }
              }}
              value={phone}
              type="tel"
              className="peer mb-0 ml-0 mr-0 block w-full rounded-md border border-gray-800 bg-transparent bg-white pb-2 pl-4 pr-[7rem] pt-2 text-base text-gray-900 focus:border-[#000000] focus:outline-none focus:ring-0 dark:border-[#000000] dark:text-white"
              placeholder="Enter Phone"
            />
          </div>
          <div className="mt-4 space-y-2 rounded-md px-4">
            <span className="font-medium">Role {errors.name && <span className="text-red-500">*</span>}</span>
            <select
              onChange={(e) => {
                const selectedRoleId = e.target.value;
                const role = roles.find((r: IRole) => r._id === selectedRoleId);
                setSelectedRole(role ?? null);
              }}
              className="block w-full rounded-md"
            >
              <option value="">Select Role</option>
              {roles?.map((role: IRole) => (
                <option key={role?._id} value={role?._id}>
                  {role?.name}
                </option>
              ))}
            </select>
          </div>
          <div className="p-4">
            <div className="pb-4 text-xl font-semibold">Access to Services</div>
            <div className="space-y-4">
              <div className="rounded-md border border-[#cacaca] bg-white p-4">
                <div style={style}>
                  <div className="flex-col-1 space-y-2 text-sm">
                    <div className="font-semibold">Hi-Biz</div>
                    <div className="opacity-60">Owners App</div>
                  </div>
                  <div className="flex items-center">
                    <Switch
                      uncheckedIcon={false}
                      checkedIcon={false}
                      onChange={() => setToggleHiBizSwitch(!toggleHiBizSwitch)}
                      checked={toggleHiBizSwitch}
                      offColor="#CACACA"
                    />
                  </div>
                </div>
                <hr className="my-4" />
                {toggleHiBizSwitch &&
                  (Object.keys(hibizSubServices) as Array<keyof typeof hibizSubServices>).map((serviceKey) => (
                    <div key={serviceKey} style={style} className="pb-4">
                      <label>{hibizSubServices[serviceKey].label}</label>
                      <input
                        className="h-5 w-5 rounded-md outline-none focus:ring-0"
                        type="checkbox"
                        checked={hibizSubServices[serviceKey].value}
                        onChange={() => {
                          setHibizSubServices({
                            ...hibizSubServices,
                            [serviceKey]: {
                              ...hibizSubServices[serviceKey],
                              value: !hibizSubServices[serviceKey].value,
                            },
                          });
                        }}
                      />
                    </div>
                  ))}
              </div>
              <div className="rounded-md border border-[#cacaca] bg-white p-4 opacity-50">
                <div style={style}>
                  <div className="flex-col-1 space-y-2 text-sm">
                    <div className="font-semibold">Hi-Table</div>
                    <div className="opacity-60">Owners App</div>
                  </div>
                  <div className="flex items-center">
                    <Switch
                      uncheckedIcon={false}
                      checkedIcon={false}
                      onChange={() => setToggleHiTableSwitch(!toggleHiTableSwitch)}
                      checked={toggleHiTableSwitch}
                      offColor="#CACACA"
                      disabled
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="fixed bottom-0 w-full max-w-[30rem] cursor-pointer p-4 outline-none">
          <button type="button" onClick={handleSubmit} className="w-full max-w-[30rem] rounded-md bg-[#000000] py-2 text-white">
            Add Staff
          </button>
        </div>
      </div>
    </>
  );
};
export default memo(AddStaffPopup);
