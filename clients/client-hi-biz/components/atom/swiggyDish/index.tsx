import axios from '@/axios';
import AddExtras from '@/components/atom/addExtras';
import AddRecommendedDishes from '@/components/atom/addRecommendedDishes';
import PopUp from '@/components/atom/popUp';
import useItemStore from '@/components/store/useItemStore';
import type { Extra, ICategory, IDish, IKitchen, IPortion } from '@/components/types/businessData';
import { paths } from '@/components/utils/paths';
import { dishTypes } from '@/pages/business/[businessId]/items/addDish';
import { useRouter } from 'next/router';
import React, { memo, useEffect, useState } from 'react';
import { MdDinnerDining } from 'react-icons/md';
import Switch from 'react-switch';

const SwiggyDish = ({
  data,
  setData,
  selectedKitchenId,
  setSelectedKitchenId,
  dishName,
  setDishName,
  dishPrice,
  setDishPrice,
  portions,
  setPortions,
  categoryPopup,
  setCategoryPopup,
  addOnPopUp,
  setAddOnPopUp,
  setPostAddOns,
  availability,
  setAvailability,
  setVisibility,
  visibility,
  postCategory,
  setPostCategory,
  postAddOns,
}: any) => {
  const dishesData = useItemStore((s) => s.data);
  const setDishesData = useItemStore((s) => s.setData);
  const [kitchen, setKitchen] = useState<IKitchen[]>([]);
  const [addOns, setAddOns] = useState<Extra[]>([]);
  const [category, setCategory] = useState<ICategory[]>([]);
  const router = useRouter();
  const { businessId, editDish } = router.query as { businessId: string; editDish: string };

  useEffect(() => {
    if (data) {
      setAddOns(data?.extras);
      setCategory(data?.categories);
      setKitchen(data?.kitchens);
      setSelectedKitchenId(data?.dish?.delivery?.kitchenId);
    }
  }, [data]);
  const handleDishName = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
      .replace(/^\s+/, '')
      .replace(/\s{3,}/g, ' ')
      .replace(/[^\w\s]/g, '');
    setDishName(value);
  };
  const handleDishPrice = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value?.replace(/[^0-9]/g, '');
    setDishPrice(value);
  };
  const handleKitchenChange = (event: any) => {
    setSelectedKitchenId(event.target.value);
  };

  const addCategory = async () => {
    setCategoryPopup(true);
    if (dishesData && dishesData?.categories?.length > 0) {
      setCategory(dishesData.categories);
    } else {
      getCategoryDishesApi();
    }
  };
  const closeCategoryPopup = () => {
    setCategoryPopup(false);
  };
  function handleCategory(category: IDish[]) {
    setPostCategory(category);
    setCategoryPopup(false);
  }
  function handleAddOns(activeClick: any) {
    setPostAddOns(activeClick);
    setAddOnPopUp(false);
  }

  const handleIncreasePortion = () => {
    setPortions((prevPortions: any) => {
      if (!Array.isArray(prevPortions) || prevPortions.length === 0) {
        return [{ name: '', price: '', portionType: '' }];
      } else {
        return [...prevPortions, { name: '', price: '', portionType: '' }];
      }
    });
  };

  const handleRemovePortion = (index: number) => {
    const newPortions = portions.filter((_: any, idx: number) => idx !== index);
    setPortions(newPortions);
  };
  const handleToggleAvailability = () => {
    setAvailability(!availability);
  };
  const handleToggleVisibility = () => setVisibility(!visibility);

  function removeCategoryCharges(indexToRemove: number) {
    setPostCategory((prev: any) => prev.filter((pre: any, index: number) => index !== indexToRemove));
  }
  async function getExtras() {
    try {
      const addOns = await axios.get(paths.getExtraApi(businessId));
      setDishesData((prev) => {
        return { ...prev, addOns: addOns?.data };
      });
      if (editDish) {
      } else {
        setData((prev: any) => {
          return { ...prev, extras: addOns?.data };
        });
      }
      setAddOns(addOns?.data);
    } catch (err) {
      console.log(err);
    }
  }
  const addOnsPopUp = async () => {
    setAddOnPopUp(true);
    if (dishesData && dishesData?.addOns?.length > 0) {
      setAddOns(dishesData?.addOns);
    } else {
      getExtras();
    }
  };
  async function getCategoryDishesApi() {
    try {
      const category = await axios.get(paths.getCategoryApi(businessId));
      const allDishes = category?.data?.reduce((acc: any[], category: ICategory) => {
        const seenIds = new Set(acc.map((dish) => dish._id));
        const uniqueDishes = category.dishes.filter((dish) => !seenIds.has(dish._id));
        return acc.concat(uniqueDishes);
      }, []);
      setCategory(category?.data);
      setDishesData((prev) => {
        return { ...prev, categories: category?.data };
      });
      if (editDish) {
      } else {
        setData((prev: any) => {
          return { ...prev, categories: category?.data, dishes: allDishes };
        });
      }
    } catch (err) {
      console.log(err);
    }
  }
  function removeAddons(indexToRemove: number) {
    setPostAddOns((prev: any) => prev.filter((pre: any, index: number) => index !== indexToRemove));
  }
  const closeAddOnPopUp = () => {
    setAddOnPopUp(false);
  };
  return (
    <>
      <div className="rounded-md px-4 pb-4 pt-2">
        <div className="mt-2 space-y-4">
          <div>
            <label className="mb-2 block font-medium text-[#2B354D]" htmlFor="dishName">
              Dish Name
            </label>
            <input
              onChange={handleDishName}
              value={dishName}
              maxLength={50}
              id="dishName"
              type="text"
              placeholder="Name"
              className="w-full rounded-md border p-2"
            />
          </div>
          <div>
            <label className="mb-2 block font-medium text-[#2B354D]" htmlFor="dishPrice">
              Dish Price <span className="text-red-500">*</span>
            </label>
            <input
              onChange={handleDishPrice}
              value={dishPrice}
              maxLength={4}
              id="dishPrice"
              type="text"
              placeholder="Price"
              className="w-full rounded-md border p-2"
            />
          </div>
          <div>
            <label className="mb-2 block font-medium text-[#2B354D]" htmlFor="taxesCharges">
              Kitchen <span className="text-red-500">*</span>
            </label>
            <select onChange={handleKitchenChange} value={selectedKitchenId} className="w-full rounded-md border p-2">
              {kitchen?.map((kitchen: any) => (
                <option className="!bg-white !text-[#2B354D]" key={kitchen?._id} value={kitchen?._id}>
                  {kitchen?.kitchenName}
                </option>
              ))}
            </select>
          </div>
          <div className="rounded-md border border-[#cacaca] p-2">
            <div className="relative flex w-full justify-between">
              <h1>Category</h1>
              <div onClick={addCategory}>
                <button type="button" className="on_active_bounce border-1 rounded-md border px-4 py-1 ">
                  Add
                </button>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 md:gap-2 lg:grid-cols-4">
              {postCategory?.map((category: ICategory, index: number) => {
                return (
                  <div key={category?._id} className="border-1 mt-2 flex flex-col rounded-md border p-3">
                    <div className="flex items-center">
                      <MdDinnerDining />
                      <h1 className="mx-2 capitalize">{category?.name}</h1>
                    </div>
                    <div className="mt-4 flex self-end">
                      <button type="button" onClick={() => removeCategoryCharges(index)} className="text-[#2F80ED]">
                        Remove
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          <div className="mt-2 space-y-4 rounded-md border border-[#cacaca] p-2">
            <div className="flex items-center justify-between">
              <span>Availability</span>
              <Switch uncheckedIcon={false} checkedIcon={false} onChange={handleToggleAvailability} checked={availability} offColor="#CACACA" />
            </div>

            <div className="flex items-center justify-between">
              <span>Visibility</span>
              <Switch uncheckedIcon={false} checkedIcon={false} onChange={handleToggleVisibility} checked={visibility} offColor="#CACACA" />
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="text-[#2B354D]">Portions</div>
              <button type="button" onClick={handleIncreasePortion} className="border-1 on_active_bounce  rounded-md border px-4 py-1 text-[#2B354D]">
                Add
              </button>
            </div>
            {portions?.map((portion: IPortion, index: number) => (
              <div key={index.toString()} className="border-1 space-y-2 rounded-lg border border-[#cacaca] p-2">
                <button type="button" onClick={() => handleRemovePortion(index)} className="float-right text-blue-500">
                  ✖
                </button>
                <div className="mx-1 space-y-2 pb-2">
                  <label>
                    Portion Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Portion name"
                    maxLength={50}
                    value={portion?.name}
                    onChange={(e) => {
                      const newPortions: IPortion[] = [...portions];
                      newPortions[index].name = e.target.value
                        ?.replace(/^\s+/, '')
                        .replace(/\s{3,}/g, ' ')
                        .replace(/[^\w\s]/g, '');
                      setPortions(newPortions);
                    }}
                    className="w-full rounded-md border p-2"
                  />
                  <label>
                    Price <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Price"
                    maxLength={4}
                    value={portion?.price}
                    onChange={(e) => {
                      const newPortions = [...portions];
                      const value = e.target.value.replace(/[^0-9]/g, '');
                      newPortions[index].price = value;
                      setPortions(newPortions);
                    }}
                    className="w-full rounded-md border p-2"
                  />
                  <label>Type</label>
                  <select
                    onChange={(e) => {
                      const newPortions = [...portions];
                      newPortions[index].portionType = e.target.value?.replace(/[^a-zA-Z ]/, '').toLowerCase();
                      setPortions(newPortions);
                    }}
                    value={[...portions][index].portionType?.replace(/[^a-zA-Z ]/, '').toLowerCase()}
                    className="w-full rounded-md border p-2"
                  >
                    {dishTypes?.map((dish: any) => (
                      <option className="!bg-white !text-[#2B354D]" key={dish?._id} value={dish?.type?.replace(/[^a-zA-Z ]/, '').toLowerCase()}>
                        {dish?.type?.replace(/[^a-zA-Z ]/, '').toLowerCase()}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="relative my-4 mt-4 flex w-full justify-between">
          <h1>Addons</h1>
          <div onClick={addOnsPopUp}>
            <button type="button" className="on_active_bounce border-1 rounded-md border px-4 py-1 ">
              Add
            </button>
          </div>
        </div>
        {postAddOns?.map((addon: any, index: number) => {
          return (
            <div key={index.toString()} className="border-1 my-4 flex flex-col rounded-md border p-3">
              <div className="flex items-center">
                <MdDinnerDining />
                <h1 className="mx-2 capitalize">{addon?.name}</h1>
              </div>
              <div className="mt-4 flex self-end">
                <button type="button" onClick={() => removeAddons(index)} className="text-[#2F80ED]">
                  Remove
                </button>
              </div>
            </div>
          );
        })}
      </div>
      {categoryPopup && (
        <PopUp show={categoryPopup} onClose={closeCategoryPopup}>
          <AddRecommendedDishes<ICategory[]>
            handleData={handleCategory}
            Data={category}
            selectedData={postCategory}
            closeRecommendPopup={closeCategoryPopup}
            headerText="Category"
          />
        </PopUp>
      )}
      {addOnPopUp && (
        <PopUp show={addOnPopUp} onClose={closeAddOnPopUp}>
          <AddExtras handleData={handleAddOns} Data={addOns} selectedData={postAddOns} closeAddOnPopUp={closeAddOnPopUp} />
        </PopUp>
      )}
    </>
  );
};

export default memo(SwiggyDish);
