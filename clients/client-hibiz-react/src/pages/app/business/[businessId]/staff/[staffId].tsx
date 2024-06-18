import Hi from '@/assets/svg/hi.svg';
import axios from '@/axios';
import ChangePasswordModal from '@/components/atom/changePasswordModal';
import DeleteConfirmationModal from '@/components/atom/deleteUser';
import PopUp from '@/components/atom/popUp';
import ErrorComponent from '@/components/errorComponent';
import Header from '@/components/molecules/header';
import type { UserProfile } from '@/components/types/businessData';
import { useQuery } from '@tanstack/react-query';
import { memo, startTransition, useEffect, useState } from 'react';
import { FaArrowLeft } from 'react-icons/fa';
import { useNavigate, useParams } from 'react-router-dom';
import Switch from 'react-switch';
import { toast } from 'react-toastify';

interface IAccessControl {
  dish: boolean;
  staff: boolean;
  loyalty: boolean;
  sale: boolean;
  reports: boolean;
  zones_tables: boolean;
}
interface IHibizSubServices {
  addAndDeleteItems: { label: string; value: boolean };
  addAndDeleteStaff: { label: string; value: boolean };
  LoyaltyManagement: { label: string; value: boolean };
  salesModules: { label: string; value: boolean };
  reports: { label: string; value: boolean };
  addAndDeleteTablesOrZones: { label: string; value: boolean };
}

function StaffDetails() {
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [manage, setManage] = useState(false);
  const [toggleHiBizSwitch, setToggleHiBizSwitch] = useState(false);
  const [toggleHiTableSwitch, setToggleHiTableSwitch] = useState(false);
  const [hibizSubServices, setHibizSubServices] = useState<IHibizSubServices>({
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
  const [pass, setPass] = useState('');
  const { staffId } = useParams<{
    staffId: string;
  }>();
  const style = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  };
  const mapAccessControlToSubServices = (accessControl: IAccessControl) => {
    return {
      addAndDeleteItems: {
        ...hibizSubServices.addAndDeleteItems,
        value: accessControl?.dish,
      },
      addAndDeleteStaff: {
        ...hibizSubServices.addAndDeleteStaff,
        value: accessControl?.staff,
      },
      LoyaltyManagement: {
        ...hibizSubServices.LoyaltyManagement,
        value: accessControl?.loyalty,
      },
      salesModules: {
        ...hibizSubServices.salesModules,
        value: accessControl?.sale,
      },
      reports: { ...hibizSubServices?.reports, value: accessControl?.reports },
      addAndDeleteTablesOrZones: {
        ...hibizSubServices?.addAndDeleteTablesOrZones,
        value: accessControl?.zones_tables,
      },
    };
  };

  const isAnyServiceEnabled = (services: IHibizSubServices): boolean => {
    return Object.values(services).some((service) => service.value);
  };

  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const handlePasswordChange = (newPassword: string) => {
    setPass(newPassword);
  };

  const deleteStaff = async () => {
    try {
      await axios.get(`/v1/users/staff/Single?remove=true&staffId=${staffId}`);
      toast.success('User deleted successfully');
      startTransition(() => {
        navigate(-1);
      });
    } catch (error) {
      toast.error('Error deleting user');
    }
  };

  const updateAccessControl = async () => {
    try {
      const response = await axios.put(`/v1/users/${staffId}/updateUser`, {
        accessControl: {
          dish: hibizSubServices.addAndDeleteItems.value,
          staff: hibizSubServices.addAndDeleteStaff.value,
          loyalty: hibizSubServices.LoyaltyManagement.value,
          sale: hibizSubServices.salesModules.value,
          reports: hibizSubServices.reports.value,
          zones_tables: hibizSubServices.addAndDeleteTablesOrZones.value,
        },
      });
      if (response.status) {
        toast.success('Access control updated successfully');
        setManage(false);
      }
    } catch (error) {
      toast.error('Error updating access control');
    }
  };
  const getUserDetails = async () => {
    try {
      const response = await axios.get(`/v1/users/staff/Single?staffId=${staffId}`);
      setUserProfile(response.data);
      setPass(response.data.password);
      const updatedSubServices = mapAccessControlToSubServices(response.data.accessControl);
      setHibizSubServices(updatedSubServices);
      return response.data;
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {}, [pass]);

  const { isLoading, error, data, refetch } = useQuery({
    queryKey: ['staff', staffId],
    queryFn: getUserDetails,
    enabled: !!staffId,
  });

  if (error) return <ErrorComponent refetch={refetch} />;

  return (
    <div className="bg-white">
      <div className="sticky top-0 z-50 w-full linear_gradient_background">
        <Header title="Staff" leftIcon={<FaArrowLeft />} centerImage={Hi} rightImage={Hi} isIconBusinessShow={true} />
        <div className="mx-6 mt-6 flex items-center justify-start rounded-lg bg-[#204D42] py-4 text-white">
          <div className="mx-4 rounded-full bg-white px-4 py-2 text-xl font-semibold text-[#204D42]">{userProfile?.name[0]}</div>
          <div className="ml-2 text-xl font-normal">{userProfile?.name}</div>
        </div>
        <div className="mx-6 mt-6 rounded-lg pb-4 text-2xl font-normal text-[#000000]">Staff Info</div>
      </div>
      <div className="on_active_bounce mx-6 mt-6 rounded-lg border border-[#cacaca] bg-white font-medium capitalize text-[#000000]">
        <div className="flex items-center px-4 py-2">
          <span>Mobile Number</span>
        </div>
        <div className="flex items-center justify-between px-4 py-2">
          <span className="text-sm opacity-60">{userProfile?.phone}</span>
        </div>
      </div>
      <div
        onKeyDown={openModal}
        onClick={openModal}
        className="on_active_bounce mx-6 mt-6 rounded-lg border border-[#cacaca] bg-white font-medium capitalize text-[#000000]"
      >
        <div className="flex items-center px-4 py-2">
          <span>Password</span>
        </div>
        <div className="flex items-center justify-between px-4 py-2">
          <span className="text-sm opacity-60">{pass}</span>
          <span className="text-sm font-semibold">Change</span>
        </div>
      </div>
      <div
        onKeyDown={() => setManage(true)}
        onClick={() => setManage(true)}
        className="m-6 rounded-lg border border-[#cacaca] bg-white p-4 text-[#000000]"
      >
        Manage Access
      </div>
      <div className="fixed flex items-center justify-center w-full px-6 bottom-6">
        <button
          type="button"
          onClick={() => setIsDeleteModalOpen(true)}
          className="on_active_bounce mx-auto mt-6 w-full rounded-lg bg-[#000000] px-4 py-2 text-white"
        >
          Delete
        </button>
      </div>
      {isModalOpen && (
        <PopUp show={isModalOpen} onClose={closeModal}>
          <ChangePasswordModal closeModal={closeModal} onPasswordChange={handlePasswordChange} />
        </PopUp>
      )}
      {manage && (
        <PopUp show={manage} onClose={() => setManage(false)}>
          <div className="p-4 pb-[5rem]">
            <div className="pb-4 text-xl font-semibold">Access to Services</div>
            <div className="space-y-4">
              <div className="rounded-md border border-[#cacaca] bg-white p-4">
                <div style={style}>
                  <div className="space-y-2 text-sm flex-col-1">
                    <div className="font-semibold">Hi-Biz</div>
                    <div className="opacity-60">Owners App</div>
                  </div>
                  <div className="flex items-center">
                    <Switch
                      uncheckedIcon={false}
                      checkedIcon={false}
                      onChange={() => setToggleHiBizSwitch(!toggleHiBizSwitch)}
                      checked={toggleHiBizSwitch || isAnyServiceEnabled(hibizSubServices)}
                      offColor="#CACACA"
                    />
                  </div>
                </div>
                <hr className="my-4" />
                {(toggleHiBizSwitch || isAnyServiceEnabled(hibizSubServices)) &&
                  (Object.keys(hibizSubServices) as Array<keyof typeof hibizSubServices>).map((serviceKey) => (
                    <div key={serviceKey} style={style} className="pb-4">
                      <label>{hibizSubServices[serviceKey].label}</label>
                      <input
                        className="w-5 h-5 rounded-md outline-none focus:ring-0"
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
                  <div className="space-y-2 text-sm flex-col-1">
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
          <div className="fixed flex items-center justify-center w-full px-4 bottom-4">
            <button type="button" onClick={updateAccessControl} className="on_active_bounce mt-6  w-full rounded-lg bg-[#000000] py-2 text-white">
              Save
            </button>
          </div>
        </PopUp>
      )}
      {isDeleteModalOpen && (
        <PopUp show={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)}>
          <DeleteConfirmationModal
            text={`Do you want to delete ${userProfile?.name} ?`}
            closeModal={() => setIsDeleteModalOpen(false)}
            onDelete={deleteStaff}
          />
        </PopUp>
      )}
    </div>
  );
}

export default memo(StaffDetails);
