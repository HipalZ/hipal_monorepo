import axios from '@/axios';
import Loader from '@/components/atoms/loader';
import { useBusinessStore } from '@/components/store/useBusinessData';
import { useLogin } from '@/components/store/useLogin';
import { useTable } from '@/components/store/useTable';
import type { ICategory, Kitchen } from '@/components/types/hiTableData';
import { getUpdatedCart } from '@/components/utils/helpers';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/router';
import { useState } from 'react';
import { toast } from 'react-toastify';
import { v4 as uuid4 } from 'uuid';

interface IData {
  categories: ICategory[];
  kitchens: Kitchen[];
}
const AddTempDish = ({ onClose, setCurrentView }: { onClose: () => void; setCurrentView: (str: string) => void }) => {
  const [dishName, setDishName] = useState('');
  const [dishType, setDishType] = useState('');
  const [categoryType, setCategoryType] = useState('');
  const [kitchen, setKitchen] = useState('');
  const [price, setPrice] = useState('');
  const userDetails = useLogin((s) => s.userDetails);
  const phone = useLogin((s) => s.phoneNumber);
  const tableName = useTable((s) => s.tableData.name);
  const businessData = useBusinessStore((s) => s.businessData);
  const [data, setData] = useState<IData | null>(null);
  const [isGst, setIsGst] = useState(true);
  const [qty, setQty] = useState(1);

  const router = useRouter();
  const { businessId, zoneId, tableId } = router.query as {
    businessId: string;
    zoneId: string;
    tableId: string;
  };

  const [sending, setSending] = useState(false);

  const handleNameChange = (e) => {
    setDishName(e.target.value);
  };

  const handlePriceChange = (e) => {
    const value = e.target.value?.replace(/[^0-9]/g, '');
    setPrice(value);
  };

  const handleDishTypeChange = (e) => {
    setDishType(e.target.value);
  };

  const handleCategoryChange = (e) => {
    setCategoryType(e.target.value);
  };

  const handleKitchenChange = (e) => {
    setKitchen(e.target.value);
  };

  const handleSubmit = async () => {
    if (sending) return;

    setSending(true);

    if (dishName.trim() === '') {
      toast.error('Please enter the name of the dish.');
      return;
    }
    if (!price) {
      toast.error('Please enter the price of the dish.');
      return;
    }
    if (!dishType) {
      toast.error('Please select a dish type.');
      return;
    }
    if (!categoryType) {
      toast.error('Please select a category.');
      return;
    }
    if (!kitchen) {
      toast.error('Please select a kitchen.');
      return;
    }

    const requestBody: any = {
      businessId: businessId,
      kitchenId: kitchen,
      zoneId: zoneId,
      tableId: tableId,
      staffId: '5',

      dish: {
        dishId: uuid4(),
        name: dishName,
        price: Number(price),
        qty: qty,
        comments: 'spicy',
        extras: [],
      },
      dishType: dishType,
      category: categoryType,
      customerName: userDetails.name,
      customerPhone: phone,
      tableName: tableName,
      isGst: isGst,
    };
    try {
      const response = await axios.post('/v1/kitchens/:kitchenId/openItem', requestBody);
      const getCart = getUpdatedCart(requestBody, false);
      if (getCart && businessData?.kotPrinter) {
        const config = {
          method: 'POST',
          url: 'https://ws.hipal.life',
          data: {
            businessId: businessId,
            payload: {
              tableName: tableName,
              cart: getCart,
            },
          },
        };
        const response = axios(config);
      }
      toast.success('Quick Dish added successfully.');
      setDishName('');
      setPrice('');
      setDishType('');
      setCategoryType('');
      setKitchen('');
      onClose();
      setCurrentView('pos');
    } catch (error) {
      console.error('Error submitting dish:', error);
    }
  };

  const getKitchenAndCategory = async () => {
    try {
      const categories = await axios.get(`/v1/categories?businessId=${businessId}`);
      const filterCategory = categories.data.filter((ele) => ele.hierarchy === 'PARENT');
      const kitchens = await axios.get(`/v1/kitchens?businessId=${businessId}`);
      const data = {
        categories: filterCategory,
        kitchens: kitchens.data,
      };
      setData(data);
    } catch (error) {
      console.error('Error fetching staff details:', error);
    }
  };

  const {
    isLoading,
    error,
    data: categoryData,
  } = useQuery({
    queryKey: ['getKitchenAndCategory', businessId],
    queryFn: getKitchenAndCategory,
    enabled: !!businessId,
  });

  if (sending) {
    return (
      <div>
        <Loader />
      </div>
    );
  }
  if (isLoading) {
    return (
      <div>
        <Loader />
      </div>
    );
  }

  return (
    <div className="h-[80vh] overflow-auto pb-[7rem]">
      <div className="m-6">
        <div className="font-[500]">Add Temp Dish</div>

        {/* Dish Name Input */}
        <div className="mt-4 space-y-2 text-sm">
          <span>
            {' '}
            Name of the Dish <span className="text-red-500">*</span>
          </span>
          <input
            value={dishName}
            onChange={handleNameChange}
            className="w-full rounded-xl border border-[#79747E] px-4 py-2"
            type="text"
            placeholder="Name"
            max={16}
            required
          />
        </div>
        <div className="mt-4 space-y-2 text-sm">
          <span>Price of the dish</span> <span className="text-red-500">*</span>
          <input
            value={price}
            onChange={handlePriceChange}
            className="w-full rounded-xl border border-[#79747E] px-4 py-2"
            type="tel"
            placeholder="price"
            maxLength={6}
            required
          />
        </div>

        {/* Dish Type Dropdown */}
        <div className="mt-4 space-y-2 text-sm">
          <span className="font-medium">Dish Type</span> <span className="text-red-500">*</span>
          <select
            onChange={handleDishTypeChange}
            value={dishType || ''}
            id="dishType"
            className="bg-base-100 dark:text-base-100 peer mb-0 ml-0 mr-0 block w-full rounded-xl border border-gray-800 bg-transparent px-2 pb-2 pr-[7rem] pt-2 text-sm text-gray-900 focus:border-[#2B354D] focus:outline-none focus:ring-0 dark:border-[#2B354D]"
          >
            <option value="">Select a dish type</option>
            <option value="veg">Veg</option>
            <option value="nonveg">NonVeg</option>
            <option value="vegan">Vegan</option>
            <option value="egg">Egg</option>
            <option value="mixed">Mixed</option>
          </select>
        </div>

        {/* Variant Type Dropdown */}
        <div className="mt-4 space-y-2 text-sm">
          <span className="font-medium">Select Category</span> <span className="text-red-500">*</span>
          <select
            onChange={handleCategoryChange}
            value={categoryType || ''}
            id="category"
            className="bg-base-100 dark:text-base-100 peer mb-0 ml-0 mr-0 block w-full rounded-xl border border-gray-800 bg-transparent px-2 pb-2 pr-[7rem] pt-2 text-sm text-gray-900 focus:border-[#2B354D] focus:outline-none focus:ring-0 dark:border-[#2B354D]"
          >
            <option value="">Select Category</option>
            {data?.categories.map((ele, i) => (
              <option key={i} value={ele.name}>
                {ele.name}
              </option>
            ))}
          </select>
        </div>

        {/* Kitchen Dropdown */}
        <div className="mt-4 space-y-2 text-sm">
          <span className="font-medium">Kitchen</span> <span className="text-red-500">*</span>
          <select
            onChange={handleKitchenChange}
            value={kitchen || ''}
            id="kitchenType"
            className="bg-base-100 dark:text-base-100 peer mb-0 ml-0 mr-0 block w-full rounded-xl border border-gray-800 bg-transparent px-2 pb-2 pr-[7rem] pt-2 text-sm text-gray-900 focus:border-[#2B354D] focus:outline-none focus:ring-0 dark:border-[#2B354D]"
          >
            <option value="">Select kitchen</option>
            {data?.kitchens?.map((ele, i) => (
              <option key={i} value={ele.id}>
                {ele.kitchenName}
              </option>
            ))}
          </select>
        </div>
        <article className="border-base-content my-6 flex items-center justify-between rounded-xl border p-4">
          <h4>Gst</h4>
          <input onChange={() => setIsGst(!isGst)} type="checkbox" id="gst" name="gst" checked={isGst} className="h-5 w-5" />
        </article>

        {/* Quantity */}
        <div className="flex items-center justify-between px-4">
          <h4>Quantity</h4>
          <div className="flex items-center space-x-4">
            {qty > 0 && (
              <button
                type="button"
                onClick={() => setQty(qty - 1)}
                disabled={qty === 1}
                className="bg-base-100 text-primary border-primary rounded-xl border px-4 py-2 text-sm"
              >
                -
              </button>
            )}

            <span>{qty}</span>
            <button
              type="button"
              onClick={() => setQty(qty + 1)}
              className="bg-base-100 text-primary border-primary rounded-xl border px-4 py-2 text-sm"
            >
              +
            </button>
          </div>
        </div>
      </div>

      {/* Confirmation Button */}
      <div className="bg-primary fixed bottom-0 flex w-full items-center justify-end px-4 py-4">
        <button type="button" onClick={handleSubmit} className="bg-base-100 rounded-full px-6 py-2 text-sm">
          Confirm
        </button>
      </div>
    </div>
  );
};

export default AddTempDish;
