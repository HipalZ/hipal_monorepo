import Hi from '@/assets/svg/hi.svg';
import axios from '@/axios';
import PopUp from '@/components/atom/popUp';
import VariantComponent from '@/components/molecules/addVariantPopup';
import Header from '@/components/molecules/header';
import useAddOnStore, { type Variant } from '@/components/store/useAddOn';
import { routeToItems } from '@/components/utils/routes';
import type React from 'react';
import { memo, startTransition, useEffect, useState } from 'react';
import { BsChevronLeft } from 'react-icons/bs';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';

const AddAddOn = memo(() => {
  const [isAddOnTypeModalOpen, setIsAddOnTypeModalOpen] = useState(false);
  const { businessId } = useParams<{ businessId: string }>();
  const navigate = useNavigate();
  const {
    addOnName,
    setAddOnName,
    addOnType,
    setAddOnType,
    setSelections,
    setNoOfOptions,
    maxQuantity,
    setMaxQuantity,
    compulsoryQuantity,
    setCompulsoryQuantity,
    variants,
    deleteVariant,
    setCurrentVariant,
    setVariants,
  } = useAddOnStore();
  const [errorCompulsory, setErrorCompulsory] = useState(false);
  const [errorMaxQty, setErrorMaxQty] = useState(false);
  const openModal = () => {
    if (addOnType) {
      setIsAddOnTypeModalOpen(true);
    } else {
      toast.error('please select add on type');
    }
  };
  const [loading, setLoading] = useState(false);
  const handleDeleteVariant = (id: string) => {
    deleteVariant(id);
  };
  const handleEditVariant = (variant: Variant) => {
    setCurrentVariant(variant);
    openModal();
  };

  const saveAddOn = async () => {
    if (variants.length === 0) {
      toast.error('Please add variants');
      return;
    }
    setLoading(true);
    try {
      const config = {
        method: 'POST',
        url: '/v1/dishes/extra',
        data: {
          businessId: businessId,
          name: addOnName,
          numOptions: maxQuantity,
          numSelections: maxQuantity,
          compulsory: compulsoryQuantity,
          maxQuantity: maxQuantity,
          addOnType: addOnType,
          items: variants,
        },
      };
      await axios(config);
      toast.success('Add on added successfully');
      startTransition(() => {
        navigate(`/app/business/${businessId}/items?tab=items`);
      });
    } catch (error) {
      console.log(error);
    }
    setLoading(false);
  };

  const handleMaxQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let newValue = Number.parseFloat(e.target.value) || 0;
    newValue = Math.max(newValue, 0);
    if (compulsoryQuantity > newValue) {
      setCompulsoryQuantity(0);
      setMaxQuantity(newValue);
      setErrorMaxQty(true);
      setTimeout(() => {
        setErrorMaxQty(false);
      }, 3500);
      return;
    }
    setMaxQuantity(newValue);
    setErrorMaxQty(false);
  };

  const handleCompulsoryQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log(e.target.value);
    let newValue = Number.parseFloat(e.target.value) || 0;
    newValue = Math.max(newValue, 0);
    if (maxQuantity < Number(e.target.value)) {
      setErrorCompulsory(true);
      setTimeout(() => {
        setErrorCompulsory(false);
      }, 3500);
      return;
    }
    setCompulsoryQuantity(newValue);
    setErrorCompulsory(false);
  };
  useEffect(() => {
    setAddOnName('');
    setAddOnType('');
    setSelections(0);
    setNoOfOptions(0);
    setMaxQuantity(0);
    setCompulsoryQuantity(0);
    setVariants([]);
  }, []);

  const handleBack = () => {
    startTransition(() => {
      navigate(routeToItems(businessId as string));
    });
  };

  return (
    <div className="pb-[7rem]">
      <div className="sticky top-0 z-20 bg-[#f5f5f5]">
        <Header title="AddOn" onBack={handleBack} leftIcon={<BsChevronLeft />} centerImage={Hi} rightImage={Hi} isIconBusinessShow={false} />
        <div className="mt-6 flex items-center justify-between border-b border-[#cacaca] px-6 pb-4">
          <div className="flex text-2xl">
            <span className="">Add a Add On</span>
          </div>
        </div>
      </div>
      <div className="mt-4 space-y-2 px-4">
        <span className="font-medium">Name of the Add On</span>
        <input
          onChange={(e) => {
            setAddOnName(e.target.value);
          }}
          maxLength={24}
          value={addOnName || ''}
          type="text"
          id="floating_outlined"
          className="peer mb-0 ml-0 mr-0 block w-full rounded-md border border-gray-800 bg-transparent pb-2 pl-4 pr-[7rem] pt-2 text-base text-gray-900 focus:border-[#2B354D] focus:outline-none focus:ring-0 dark:border-[#2B354D] dark:text-white"
          placeholder="Name"
        />
      </div>
      <div className="mt-4 space-y-2 px-4">
        <div className="flex items-center justify-between">
          <span className="font-medium">Add On Type</span>
        </div>
        <select
          value={addOnType}
          onChange={(e) => setAddOnType(e.target.value)}
          className="w-full rounded-md border border-[#2B354D] px-4 py-2 focus:border-[#2B354D] focus:outline-none focus:ring-0"
        >
          <option value="">Select Type</option>
          <option value="single">Single selection</option>
          <option value="multiple">Quantity based selection</option>
        </select>
      </div>
      <div className="flex">
        <div className="mt-4 space-y-2 px-4">
          <span className="font-medium">Max quantity choices</span>
          <input
            onChange={handleMaxQuantityChange}
            value={maxQuantity || ''}
            type="tel"
            maxLength={3}
            id="floating_outlined"
            className="peer mb-0 ml-0 mr-0 block w-full rounded-md border border-gray-800 bg-transparent pb-2 pl-4 pr-[7rem] pt-2 text-base text-gray-900 focus:border-[#2B354D] focus:outline-none focus:ring-0 dark:border-[#2B354D] dark:text-white"
            placeholder="0"
          />
          {errorMaxQty ? <small className="text-red-500">*Max quantity cannot be more than selections and less than compulsory</small> : null}
        </div>
        <div className="mt-4 space-y-2 px-4">
          <span className="font-medium">Compulsory choices</span>
          <input
            onChange={handleCompulsoryQuantityChange}
            value={compulsoryQuantity || ''}
            maxLength={3}
            type="tel"
            id="floating_outlined"
            className="peer mb-0 ml-0 mr-0 block w-full rounded-md border border-gray-800 bg-transparent pb-2 pl-4 pr-[7rem] pt-2 text-base text-gray-900 focus:border-[#2B354D] focus:outline-none focus:ring-0 dark:border-[#2B354D] dark:text-white"
            placeholder="0"
          />
          {errorCompulsory ? <small className="text-red-500">* Compulsory quantity cannot be more than max quantity and selections</small> : null}
        </div>
      </div>
      <hr className="h-0.25 mx-4 mt-4 bg-[#000]" />
      <div className="mt-4 flex justify-between px-4">
        <span className="font-medium">Variant</span>
        <button type="button" onClick={openModal} className="on_active_bounce rounded-md border border-[#2B354D] px-4 py-1">
          Add
        </button>
      </div>
      <div className={`${variants.length === 0 ? '' : 'border border-[#2B354D]'}  mx-4 mt-4 space-y-2 rounded-md p-4`}>
        {variants.map((variant) => (
          <div key={variant._id} className="rounded-md border border-[#cacaca] p-2">
            <div className="w-48 truncate">{variant?.name}</div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 text-sm opacity-80">
                <span>x {variant?.maxQuantity}</span>
                <span>₹ {variant.price}</span>
              </div>
              <div className="flex items-center space-x-4">
                <button type="button" onClick={() => handleEditVariant(variant)}>
                  Edit
                </button>
                <button type="button" className="text-[#2F80ED]" onClick={() => handleDeleteVariant(variant._id)}>
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
      {isAddOnTypeModalOpen && (
        <PopUp
          show={isAddOnTypeModalOpen}
          onClose={() => {
            setIsAddOnTypeModalOpen(false);
            setCurrentVariant(null);
          }}
        >
          <VariantComponent compulsoryQuantity={compulsoryQuantity} onClose={() => setIsAddOnTypeModalOpen(false)} />
        </PopUp>
      )}
      <div
        onClick={saveAddOn}
        className={`${loading ? 'pointer-events-none opacity-50' : ''} on_active_bounce fixed bottom-0 w-full cursor-pointer p-4 outline-none`}
      >
        <button type="button" className="w-full rounded-md bg-[#2B354D] py-2 text-white">
          {loading ? 'Loading...' : 'Save'}
        </button>
      </div>
    </div>
  );
});

export default AddAddOn;
