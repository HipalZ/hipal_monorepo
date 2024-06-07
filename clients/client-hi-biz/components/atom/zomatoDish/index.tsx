import React, { memo, useEffect, useState } from "react";
import type { Extra, ICategory, IDish, IKitchen, IPortion } from "@/components/types/businessData";
import { MdDinnerDining } from "react-icons/md";
import Switch from "react-switch";
import PopUp from "@/components/atom/popUp";
import AddRecommendedDishes from "@/components/atom/addRecommendedDishes";
import AddExtras from "@/components/atom/addExtras";
import { dishTypes } from "@/pages/business/[businessId]/items/addDish";
import axios from "@/axios";
import { paths } from "@/components/utils/paths";
import { useRouter } from "next/router";
import useItemStore from "@/components/store/useItemStore";

const ZomatoDish = ({
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
    postAddOns
}: any) => {
    const dishesData = useItemStore((s) => s.data);
    const setDishesData = useItemStore((s) => s.setData)
    const [kitchen, setKitchen] = useState<IKitchen[]>([]);
    const [addOns, setAddOns] = useState<Extra[]>([]);
    const [category, setCategory] = useState<ICategory[]>([]);
    const router = useRouter()
    const { businessId, editDish } = router.query as { businessId: string, editDish: string };
    useEffect(() => {
        if (data?.extras?.length > 0) {
            setAddOns(data?.extras);
        } if (data?.categories?.length > 0) {
            setCategory(data?.categories);
        } if (data?.kitchens?.length > 0) {
            setKitchen(data?.kitchens);
        } if (data?.dish?.take_away?.kitchenId) {
            setSelectedKitchenId(data?.dish?.take_away?.kitchenId);
        }
    }, [data]);
    const handleDishName = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value.replace(/^\s+/, "")
        .replace(/\s{3,}/g, " ")
        .replace(/[^\w\s]/g, "");
        setDishName(value);
    };
    const handleDishPrice = (e: any) => {
        const value = e.target.value?.replace(/[^0-9]/g, "");
        setDishPrice(value);
    };
    const handleKitchenChange = (event: any) => {
        setSelectedKitchenId(event.target.value);
    };
    async function getExtras() {
        try {
            const addOns = await axios.get(paths.getExtraApi(businessId));
            setAddOns(addOns?.data)
            setDishesData((prev) => {
                return { ...prev, addOns: addOns?.data }
            })
            if (editDish) { }
            else {
                setData((prev: any) => {
                    return { ...prev, extras: addOns?.data }
                })
            }
        } catch (err) {
            console.log(err)
        }
    }
    async function getCategoryDishesApi() {
        try {
            const category = await axios.get(paths.getCategoryApi(businessId));
            const allDishes = category?.data?.reduce(
                (acc: any[], category: ICategory) => {
                    const seenIds = new Set(acc.map((dish) => dish._id));
                    const uniqueDishes = category.dishes.filter(
                        (dish) => !seenIds.has(dish._id)
                    );
                    return acc.concat(uniqueDishes);
                },
                []
            );
            setCategory(category?.data)
            setDishesData((prev) => {
                return { ...prev, categories: category?.data }
            })
            if (editDish) { }
            else {
                setData((prev: any) => {
                    return { ...prev, categories: category?.data, dishes: allDishes }
                })
            }
        } catch (err) {
            console.log(err)
        }
    }
    const addCategory = async () => {
        setCategoryPopup(true);
        if (dishesData && dishesData?.categories?.length > 0) {
            setCategory(dishesData.categories)
        }
        else {
            getCategoryDishesApi()
        }
    };
    const closeCategoryPopup = () => {
        setCategoryPopup(false);
    };
    function handleCategory(category: IDish[]) {
        setPostCategory(category)
        setCategoryPopup(false);
    }
    function handleAddOns(activeClick: any) {
        setPostAddOns(activeClick)
        setAddOnPopUp(false);
    }

    const handleIncreasePortion = () => {
        setPortions((prevPortions: any) => {
            if (!Array.isArray(prevPortions) || prevPortions.length === 0) {
                return [{ name: "", price: "", portionType: "" }];
            } else {
                return [...prevPortions, { name: "", price: "", portionType: "" }];
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
        setPostCategory((prev: any) =>
            prev.filter((pre: any, index: number) => index !== indexToRemove)
        );
    }
    const addOnsPopUp = () => {
        setAddOnPopUp(true);
        if (dishesData && dishesData?.addOns?.length > 0) {
            setAddOns(dishesData?.addOns);
        } else {
            getExtras();
        }
    };
    function removeAddons(indexToRemove: number) {
        setPostAddOns((prev: any) =>
            prev.filter((pre: any, index: number) => index !== indexToRemove)
        );
    }
    const closeAddOnPopUp = () => {
        setAddOnPopUp(false);
    };
    return (
        <>
            <div className="px-4 pt-2 pb-4 rounded-md">
                <div className="mt-2 space-y-4">
                    <div>
                        <label
                            className="block mb-2 font-medium text-[#2B354D]"
                            htmlFor="dishName"
                        >
                            Dish Name
                        </label>
                        <input
                            onChange={handleDishName}
                            value={dishName}
                            maxLength={50}
                            id="dishName"
                            type="text"
                            placeholder="Name"
                            className="w-full p-2 border rounded-md"
                        />
                    </div>
                    <div>
                        <label
                            className="block mb-2 font-medium text-[#2B354D]"
                            htmlFor="dishPrice"
                        >
                            Dish Price <span className="text-red-500">*</span>
                        </label>
                        <input
                            onChange={handleDishPrice}
                            value={dishPrice}
                            maxLength={4}
                            id="dishPrice"
                            type="text"
                            placeholder="Price"
                            className="w-full p-2 border rounded-md"
                        />
                    </div>
                    <div>
                        <label
                            className="block mb-2 font-medium text-[#2B354D]"
                            htmlFor="taxesCharges"
                        >
                            Kitchen <span className="text-red-500">*</span>
                        </label>
                        <select
                            onChange={handleKitchenChange}
                            value={selectedKitchenId}
                            className="w-full p-2 border rounded-md"
                        >
                            {kitchen?.map((kitchen: any) => (
                                <option
                                    className="!bg-white !text-[#2B354D]"
                                    key={kitchen?._id}
                                    value={kitchen?._id}
                                >
                                    {kitchen?.kitchenName}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="border border-[#cacaca] p-2 rounded-md">
                        <div className="relative flex justify-between w-full">
                            <h1>Category</h1>
                            <div onClick={addCategory}>
                                <button type="button" className="px-4 py-1 border rounded-md on_active_bounce border-1 ">
                                    Add
                                </button>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 md:gap-2 lg:grid-cols-4">
                            {postCategory?.map((category: any, index: number) => {
                                return (
                                    <div
                                        key={index.toString()}
                                        className="flex flex-col p-3 mt-2 border rounded-md border-1"
                                    >
                                        <div className="flex items-center">
                                            <MdDinnerDining />
                                            <h1 className="mx-2 capitalize">{category?.name}</h1>
                                        </div>
                                        <div className="flex self-end mt-4">
                                            <button
                                                type="button"
                                                onClick={() => removeCategoryCharges(index)}
                                                className="text-[#2F80ED]"
                                            >
                                                Remove
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                    <div className="space-y-4 p-2 border border-[#cacaca] rounded-md mt-2">
                        <div className="flex items-center justify-between">
                            <span>Availability</span>
                            <Switch
                                uncheckedIcon={false}
                                checkedIcon={false}
                                onChange={handleToggleAvailability}
                                checked={availability}
                                offColor="#CACACA"
                            />
                        </div>

                        <div className="flex items-center justify-between">
                            <span>Visibility</span>
                            <Switch
                                uncheckedIcon={false}
                                checkedIcon={false}
                                onChange={handleToggleVisibility}
                                checked={visibility}
                                offColor="#CACACA"
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <div className="text-[#2B354D]">Portions</div>
                            <button
                                type="button"
                                onClick={handleIncreasePortion}
                                className="px-4 py-1  text-[#2B354D] border border-1 rounded-md on_active_bounce"
                            >
                                Add
                            </button>
                        </div>
                        {portions?.map((portion: IPortion, index: number) => (
                            <div
                                key={index.toString()}
                                className="rounded-lg border-1 border p-2 space-y-2 border-[#cacaca]"
                            >
                                <button
                                    type="button"
                                    onClick={() => handleRemovePortion(index)}
                                    className="float-right text-blue-500"
                                >
                                    ✖
                                </button>
                                <div className="pb-2 mx-1 space-y-2">
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
                                            newPortions[index].name = e.target.value?.replace(/^\s+/, "")
											.replace(/\s{3,}/g, " ")
											.replace(/[^\w\s]/g, "")
                                            setPortions(newPortions);
                                        }}
                                        className="w-full p-2 border rounded-md"
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
                                            const value = e.target.value.replace(/[^0-9]/g, "");
                                            newPortions[index].price = value;
                                            setPortions(newPortions);
                                        }}
                                        className="w-full p-2 border rounded-md"
                                    />
                                    <label>
                                        Type
                                    </label>
                                    <select
                                        onChange={(e) => {
                                            const newPortions = [...portions];
                                            newPortions[index].portionType = e.target.value?.replace(/[^a-zA-Z ]/, "").toLowerCase();
                                            setPortions(newPortions);
                                        }}
                                        value={[...portions][index].portionType?.replace(/[^a-zA-Z ]/, "").toLowerCase()}
                                        className="w-full p-2 border rounded-md"
                                    >
                                        {dishTypes?.map((dish: any) => (
                                            <option
                                                className="!bg-white !text-[#2B354D]"
                                                key={dish?._id}
                                                value={dish?.type?.replace(/[^a-zA-Z ]/, "").toLowerCase()}
                                            >
                                                {dish?.type?.replace(/[^a-zA-Z ]/, "").toLowerCase()}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="relative flex justify-between w-full my-4 mt-4">
                    <h1>Addons</h1>
                    <div onClick={addOnsPopUp}>
                        <button type="button" className="px-4 py-1 border rounded-md on_active_bounce border-1 ">
                            Add
                        </button>
                    </div>
                </div>
                {postAddOns?.map((addon: any, index: number) => {
                    return (
                        <div
                            key={index.toString()}
                            className="flex flex-col p-3 my-4 border rounded-md border-1"
                        >
                            <div className="flex items-center">
                                <MdDinnerDining />
                                <h1 className="mx-2 capitalize">{addon?.name}</h1>
                            </div>
                            <div className="flex self-end mt-4">
                                <button
                                    type="button"
                                    onClick={() => removeAddons(index)}
                                    className="text-[#2F80ED]"
                                >
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

export default memo(ZomatoDish);
