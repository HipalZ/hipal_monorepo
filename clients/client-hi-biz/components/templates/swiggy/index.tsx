import Hi from '@/assets/svg/hi.svg';
import axios from '@/axios';
import LoadingSpinner from '@/components/atom/loadingSpinner';
import PopUp from '@/components/atom/popUp';
import AddTax from '@/components/molecules/addTax';
import EditPasswordForDeleteDish from '@/components/molecules/editPasswordForDeleteDish';
import Header from '@/components/molecules/header';
import { useSelectedIcon } from '@/components/store/useSelectedIcon';
import { useRouter } from 'next/router';
import React, { memo, useEffect, useState } from 'react';
import { BsChevronLeft } from 'react-icons/bs';
import { MdCurrencyExchange } from 'react-icons/md';
import Switch from 'react-switch';
import { toast } from 'react-toastify';

export interface IAddTax {
  id: string;
  businessId: string;
  chargeName: string;
  chargeType: string;
  value: number;
  typeOfValue: string;
}

function Swiggy() {
  const { setSelectedIcon } = useSelectedIcon();
  const [toggleSwitch, setToggleSwitch] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isPasswordModalOpen, setPasswordIsModalOpen] = useState(false);
  const [isExtraChargesModalOpen, setExtraChargesIsModalOpen] = useState(false);
  const [isEditModalOpen, setEditIsModalOpen] = useState(false);
  const [editTax, setEditTax] = useState<IAddTax | null>(null);
  const [commissionName, setCommissionName] = useState<string | null>(null);
  const [commissionType, setCommissionType] = useState<string | null>(null);
  const [value, setValue] = useState<number | null>(null);
  const [typeOfValue, setTypeOfValue] = useState<string | null>('percentage');
  const [addCharges, setAddCharges] = useState<IAddTax[]>([]);

  const router = useRouter();
  const { businessId } = router.query as { businessId: string };

  function toggleLoyality() {
    setToggleSwitch(!toggleSwitch);
  }

  async function handleCreate(str: string) {
    if (!commissionName || !commissionType || !value || !typeOfValue) {
      toast.error('Please fill in all mandatory fields.');
      return;
    }
    setIsLoading(true);
    const body = {
      businessId: businessId,
      zoneName: 'swiggy',
      zoneType: 'take-away',
      password: '1111',
      action: 'add',
      charge: {
        chargeName: commissionName,
        chargeType: commissionType,
        value: value,
        typeOfValue: typeOfValue,
      },
    };

    try {
      const response = await axios.post(`${process.env.NEXT_PUBLIC_API_HOST}/v1/zones/5456441541/swiggy`, body);

      if (response.status === 200 || response.status === 201) {
        getAllTaxes();
        setCommissionName('');
        setCommissionType('');
        setValue(null);
        setExtraChargesIsModalOpen(false);
        toast.success('Successfully added!');
      } else {
        toast.error('There was an issue with your request.');
      }
    } catch (error) {
      console.error(error);
      toast.error('There was an error processing your request.');
    }
    setIsLoading(false);
  }
  async function handleEdit(str: string) {
    if (str.toLowerCase() === 'save') {
      const body = {
        businessId: businessId,
        zoneName: 'swiggy',
        zoneType: 'take-away',
        password: '1111',
        action: 'update',
        chargeName: editTax?.chargeName,
        charge: {
          chargeName: commissionName ? commissionName : editTax?.chargeName,
          chargeType: commissionType ? commissionType : editTax?.chargeType,
          value: value ? value : editTax?.value,
          typeOfValue: typeOfValue ? typeOfValue : editTax?.typeOfValue,
        },
      };
      try {
        const response = await axios.post(`${process.env.NEXT_PUBLIC_API_HOST}/v1/zones/5456441541/swiggy`, body);

        if (response.status === 200 || response.status === 201) {
          getAllTaxes();
          setEditIsModalOpen(false);
          toast.success('Successfully edited!');
        } else {
          toast.error('There was an issue with your request.');
        }
      } catch (error) {
        console.error(error);
        toast.error('There was an error processing your request.');
      }
    } else {
      const body = {
        businessId: businessId,
        zoneName: 'swiggy',
        action: 'remove',
        chargeName: editTax?.chargeName,
      };

      try {
        const response = await axios.post(`${process.env.NEXT_PUBLIC_API_HOST}/v1/zones/5456441541/swiggy`, body);

        if (response.status === 200 || response.status === 201) {
          getAllTaxes();
          setEditIsModalOpen(false);
          toast.success('Successfully Delete!');
        } else {
          toast.error('There was an issue with your request.');
        }
      } catch (error) {
        console.error(error);
        toast.error('There was an error processing your request.');
      }
    }
  }

  const handleValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const enteredValue = Number(e.target.value);

    if (typeOfValue === 'percentage' && enteredValue <= 100) {
      setValue(enteredValue);
    } else if (typeOfValue === 'rupess' && enteredValue <= 500) {
      setValue(enteredValue);
    } else {
      toast.error(`The max value for ${typeOfValue === 'percentage' ? 'percentage' : 'rupees'} is ${typeOfValue === 'percentage' ? 100 : 500}`);
    }
  };

  const changePassword = async (pass: string) => {
    if (pass.trim().length < 4) {
      toast.error('Please enter a password of at least 4 digits');
      return;
    }
  };

  const getAllTaxes = async () => {
    try {
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_HOST}/v1/zones?businessId=${businessId}&swiggy=true`);
      setAddCharges(response.data.addCharges);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    getAllTaxes();
  }, []);

  return (
    <>
      {' '}
      <div className="sticky top-0 z-20 bg-[#f5f5f5]">
        <Header
          title="Swiggy"
          onBack={() => setSelectedIcon('')}
          leftIcon={<BsChevronLeft />}
          centerImage={Hi}
          rightImage={Hi}
          isIconBusinessShow={true}
        />
        <div className="mt-6 flex items-center justify-between border-b border-[#cacaca] px-6 pb-4">
          <div className="flex text-2xl">
            <span className="">Swiggy</span>
          </div>
        </div>
      </div>{' '}
      <div className="mx-6 mt-6 flex items-center justify-between rounded-md border border-[#cacaca] px-6 py-4">
        <span>Activate</span>
        <Switch
          uncheckedIcon={false}
          checkedIcon={false}
          onChange={toggleLoyality}
          checked={addCharges?.length > 0 ? true : toggleSwitch}
          offColor="#CACACA"
        />
      </div>
      <div className="mx-6 mt-6 rounded-md border border-[#cacaca] px-6 py-4">
        <div>Password Manager</div>
        <div className="mt-4 flex items-center justify-between">
          <span>Edit Item</span>
          <button
            type="button"
            onClick={() => setPasswordIsModalOpen(true)}
            className="on_active_bounce rounded-md border border-[#2B354D] px-4 py-1"
          >
            Edit
          </button>
        </div>
      </div>
      {isPasswordModalOpen && (
        <PopUp show={isPasswordModalOpen} onClose={() => setPasswordIsModalOpen(false)}>
          <EditPasswordForDeleteDish
            heading="Password for removing items"
            closeModal={() => setPasswordIsModalOpen(false)}
            changePassword={changePassword}
          />
        </PopUp>
      )}
      <div className="mx-6 mt-6 rounded-md border border-[#cacaca] px-6 py-4">
        <div className="flex items-center justify-between">
          <span>Add charges</span>
          <button
            type="button"
            onClick={() => setExtraChargesIsModalOpen(true)}
            className="on_active_bounce rounded-md border border-[#2B354D] px-4 py-1"
          >
            Add
          </button>
        </div>
        {addCharges?.length > 0 &&
          addCharges.map((charge, index) => (
            <div
              onClick={() => {
                setEditTax(charge);
                setEditIsModalOpen(true);
              }}
              key={index}
              className="mt-4 rounded-md border border-[#cacaca] p-2"
            >
              <div className="flex items-center">
                <MdCurrencyExchange className="mr-2" />
                {charge?.chargeName}
              </div>
              <div className="item-center mt-2 flex justify-between">
                <div className="opacity-50">
                  {charge?.value}
                  {charge?.typeOfValue === 'percentage' ? '%' : ''} {charge?.chargeType}
                </div>
                <div className="text-[#2F80ED]">Remove</div>
              </div>
            </div>
          ))}
      </div>
      {isExtraChargesModalOpen && (
        <PopUp show={isExtraChargesModalOpen} onClose={() => setExtraChargesIsModalOpen(false)}>
          <AddTax
            heading="Add Taxes and Charges"
            editTax={editTax}
            edit={false}
            commissionName={commissionName}
            commissionType={commissionType}
            value={value}
            typeOfValue={typeOfValue || 'percentage'}
            handleValueChange={handleValueChange}
            setCommissionName={setCommissionName}
            setCommissionType={setCommissionType}
            setTypeOfValue={setTypeOfValue}
            handleCreate={handleCreate}
            handleEdit={handleEdit}
          />
        </PopUp>
      )}
      {isEditModalOpen && (
        <PopUp show={isEditModalOpen} onClose={() => setEditIsModalOpen(false)}>
          <AddTax
            heading="Edit Taxes and Charges"
            edit={true}
            editTax={editTax}
            commissionName={commissionName}
            commissionType={commissionType}
            value={value}
            typeOfValue={typeOfValue || 'percentage'}
            handleValueChange={handleValueChange}
            setCommissionName={setCommissionName}
            setCommissionType={setCommissionType}
            setTypeOfValue={setTypeOfValue}
            handleCreate={handleEdit}
            handleEdit={handleEdit}
          />
        </PopUp>
      )}
      {isLoading && <LoadingSpinner />}
    </>
  );
}

export default memo(Swiggy);
