import axios from '@/axios';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/router';
import { FC, memo, useState } from 'react';
import { AiOutlineEye, AiOutlineEyeInvisible } from 'react-icons/ai';
import { DeleteData } from '../deleteMultipleDishes';

interface DeleteItemComponentProps {
  deleteData: DeleteData;
  incorrectPassword: boolean;
  handleUpdateDeleteData: (newValues: Partial<DeleteData>) => void;
}

const DeleteItemComponent: FC<DeleteItemComponentProps> = ({ deleteData, handleUpdateDeleteData, incorrectPassword }) => {
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const router = useRouter();
  const { businessId } = router.query as { businessId: string };

  const updateReason = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleUpdateDeleteData({ reasonForDelete: e.target.value });
  };

  const updateStaffResponsible = (e: React.ChangeEvent<HTMLSelectElement>) => {
    handleUpdateDeleteData({ staffName: e.target.value });
    handleUpdateDeleteData({ staffResponsible: e.target.value });
  };

  const updateInventory = (e: React.ChangeEvent<HTMLSelectElement>) => {
    handleUpdateDeleteData({ inventory: e.target.value });
  };

  const updatePassword = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleUpdateDeleteData({ password: e.target.value });
  };

  const fetchUsers = async () => {
    try {
      const response = await axios(`/v1/users/${businessId}`);
      const data = await response.data;
      if (deleteData.staffResponsible === '') {
        handleUpdateDeleteData({ staffResponsible: data[0].name });
        handleUpdateDeleteData({ staffName: data[0].name });
      }
      return data;
    } catch (error) {
      console.error('Failed to fetch users', error);
    }
  };

  const { data, isLoading, error } = useQuery({
    queryKey: ['users', businessId],
    queryFn: fetchUsers,
    enabled: !!businessId,
  });

  return (
    <form className="bg-base-100 rounded-t-3xl pb-[5rem] shadow-lg">
      <div className="mx-6 mt-4">
        <h1 className="mb-2 font-semibold">Are you sure, you want to delete item?</h1>
        <p className="mb-4 text-xs opacity-60">Deleting an item will result in removing it from running order and from kitchen.</p>
      </div>

      <div className="mx-6 mb-4">
        <input
          type="text"
          value={deleteData.reasonForDelete}
          onChange={updateReason}
          className="bg-base-100 dark:text-base-100 mb-0 ml-0 mr-0 w-full rounded-2xl border border-gray-800 bg-transparent py-2 pl-4 pr-10 text-base text-gray-900 focus:border-[#4071F1] focus:outline-none dark:border-gray-600"
          placeholder="Reason for deletion"
        />
      </div>
      <div className="relative mx-6 pb-4">
        <label className="mb-2 block text-sm font-semibold">Password for deleting</label>
        <input
          type={showPassword ? 'text' : 'password'}
          value={deleteData.password}
          onChange={updatePassword}
          className={`bg-base-100 mb-0 ml-0 mr-0 w-full rounded-2xl border bg-transparent py-2 pl-4 pr-10 focus:outline-none dark:border-gray-600 ${
            !incorrectPassword ? 'border-red-500' : 'border-gray-800 focus:border-[#4071F1]'
          }`}
          placeholder="Enter Password"
          required
        />

        <button
          type="button"
          onClick={() => setShowPassword((prev) => !prev)}
          className="absolute bottom-6 right-2 flex h-6 w-6 items-center justify-center rounded-full text-[#2C2C2C] focus:outline-none"
        >
          {showPassword ? <AiOutlineEyeInvisible className="text-base" /> : <AiOutlineEye className="text-base" />}
        </button>
      </div>
      {!incorrectPassword && (
        <small id="invalid-password" className="mx-6 -mt-4 mb-2 block text-red-500">
          Wrong password
        </small>
      )}

      <div className="mx-6 mb-4 text-[#2C2C2C]">
        <label className="mb-2 block text-sm font-semibold">Staff Responsible</label>
        <select
          value={deleteData.staffResponsible || data?.[0]?.name}
          onChange={updateStaffResponsible}
          className="bg-base-100 dark:text-base-100 mb-0 ml-0 mr-0 w-full rounded-2xl border border-gray-800 bg-transparent py-2 pl-4 pr-10 text-base text-gray-900 focus:border-[#4071F1] focus:outline-none dark:border-gray-600"
        >
          {data &&
            data.map((user) => (
              <option value={user.name} key={user._id}>
                {user.name}
              </option>
            ))}
        </select>
      </div>

      <div className="mx-6 mb-4">
        <label className="mb-2 block text-sm font-semibold">Inventory</label>
        <select
          value={deleteData.inventory}
          onChange={updateInventory}
          className="bg-base-100 dark:text-base-100 mb-0 ml-0 mr-0 w-full rounded-2xl border border-gray-800 bg-transparent py-2 pl-4 pr-10 text-base text-gray-900 focus:border-[#4071F1] focus:outline-none dark:border-gray-600"
        >
          <option value="used">Used</option>
          <option value="not used">Not used</option>
        </select>
      </div>
    </form>
  );
};

export default memo(DeleteItemComponent);
