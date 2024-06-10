import alcohol from '@/assets/svg/alcohol.svg';
import bestseller from '@/assets/svg/bestseller.svg';
import Hi from '@/assets/svg/hi.svg';
import newImage from '@/assets/svg/new.svg';
import occasional from '@/assets/svg/occasional.svg';
import popular from '@/assets/svg/popular.svg';
import spicy from '@/assets/svg/spicy.svg';
import axios from '@/axios';
import AddExtras from '@/components/atom/addExtras';
import AddRecommendedDishes from '@/components/atom/addRecommendedDishes';
import LoadingSpinner from '@/components/atom/loadingSpinner';
import PopUp from '@/components/atom/popUp';
import ReactCropper, { cropImage } from '@/components/atom/reactCropper';
import SwiggyDish from '@/components/atom/swiggyDish';
import ZomatoDish from '@/components/atom/zomatoDish';
import ErrorComponent from '@/components/errorComponent';
import Header from '@/components/molecules/header';
import { useSelectedIcon } from '@/components/store/useSelectedIcon';
import type { Dish, Extra, ICategory, IData, IDish, IKitchen, IPortion } from '@/components/types/businessData';
import { storeImageAfterSave, validPortionCheck } from '@/components/utils/helper';
import { paths } from '@/components/utils/paths';
import { useQuery } from '@tanstack/react-query';
import type React from 'react';
import { memo, startTransition, useEffect, useRef, useState } from 'react';
import { BsChevronLeft } from 'react-icons/bs';
import { HiX } from 'react-icons/hi';
import { MdDinnerDining } from 'react-icons/md';
import { useNavigate, useParams } from 'react-router-dom';
import Switch from 'react-switch';
import { toast } from 'react-toastify';

export const dishTypes = [
  {
    id: 0,
    type: 'select a dish type'.replace(/[^a-zA-Z ]/, '').toLowerCase(),
  },
  {
    id: 1,
    type: 'veg'.replace(/[^a-zA-Z ]/, '').toLowerCase(),
  },
  {
    id: 2,
    type: 'non-veg'.replace(/[^a-zA-Z ]/, '').toLowerCase(),
  },
  {
    id: 3,
    type: 'vegan'.replace(/[^a-zA-Z ]/, '').toLowerCase(),
  },
  {
    id: 4,
    type: 'egg'.replace(/[^a-zA-Z ]/, '').toLowerCase(),
  },
  {
    id: 5,
    type: 'mixed'.replace(/[^a-zA-Z ]/, '').toLowerCase(),
  },
];

export const tags = [
  {
    text: 'Best selling',
    image: bestseller,
  },
  {
    text: 'All New',
    image: newImage,
  },
  {
    text: 'Recommended',
    image: occasional,
  },
  {
    text: 'Contains Alcohol',
    image: alcohol,
  },
  {
    text: 'Spicy',
    image: spicy,
  },
  {
    text: 'Contains Nuts',
    image: popular,
  },
];

const AddDish = memo(() => {
  const navigate = useNavigate();
  const { setSelectedIcon } = useSelectedIcon();
  const { businessId } = useParams<{ businessId: string }>();
  const [toggleSwiggySwitch, setToggleSwiggySwitch] = useState(false);
  const [toggleZomatoSwitch, setToggleZomatoSwitch] = useState(false);
  const [availability, setAvailability] = useState(true);
  const [visibility, setVisibility] = useState(true);
  const [kitchen, setKitchen] = useState<IKitchen[]>([]);
  const [selectedKitchenId, setSelectedKitchenId] = useState('');
  const [addOns, setAddOns] = useState<Extra[]>([]);
  const [category, setCategory] = useState<ICategory[] | any>([]);
  const [recommendedDishes, setRecommendedDishes] = useState<IDish[]>([]);
  const [postRecommend, setPostRecommend] = useState<IDish[]>([]);
  const [postAddOns, setPostAddOns] = useState<IDish[]>([]);
  const [description, setDescription] = useState<string>('');
  const [portions, setPortions] = useState<IPortion[]>([]);
  const [postCategory, setPostCategory] = useState<IDish[]>([]);
  const [swiggySelectedKitchenId, setSwiggySelectedKitchenId] = useState<string>('');
  const [swiggyDishName, setSwiggyDishName] = useState<string>('');
  const [swiggyDishPrice, setSwiggyDishPrice] = useState<string>('');
  const [swiggyPortions, setSwiggyPortions] = useState<IPortion[]>([]);
  const [swiggyCategoryPopup, setSwiggyCategoryPopup] = useState(false);
  const [swiggyAddOnPopUp, setSwiggyAddOnPopUp] = useState(false);
  const [swiggyPostAddOns, setSwiggyPostAddOns] = useState<IDish[]>([]);
  const [swiggyAvailability, setSwiggyAvailability] = useState(true);
  const [swiggyVisibility, setSwiggyVisibility] = useState(true);
  const [swiggyPostCategory, setSwiggyPostCategory] = useState<IDish[]>([]);
  const [zomatoSelectedKitchenId, setZomatoSelectedKitchenId] = useState<string>('');
  const [zomatoDishName, setZomatoDishName] = useState<string>('');
  const [zomatoDishPrice, setZomatoDishPrice] = useState<string>('');
  const [zomatoPortions, setZomatoPortions] = useState<IPortion[]>([]);
  const [zomatoCategoryPopup, setZomatoCategoryPopup] = useState(false);
  const [zomatoAddOnPopUp, setZomatoAddOnPopUp] = useState(false);
  const [zomatoPostAddOns, setZomatoPostAddOns] = useState<IDish[]>([]);
  const [zomatoAvailability, setZomatoAvailability] = useState(true);
  const [zomatoVisibility, setZomatoVisibility] = useState(true);
  const [zomatoPostCategory, setZomatoPostCategory] = useState<IDish[]>([]);

  const [displayImages, setDisplayImages] = useState([]);
  const [dishTags, setDishTags] = useState<string[]>([]);
  const cropperRef = useRef(null);
  const [croppingImage, setCroppingImage] = useState('');
  const [croppingImageIndex, setCroppingImageIndex] = useState<number | null>(null);

  const testData = {
    businessId: businessId || '',
    name: '',
    price: null,
    tax: 0,
    visibility: visibility,
    discount: 0,
    avgTime: '',
    dishType: '',
    categories: [],
    portions: [],
    extras: addOns,
    kitchenId: selectedKitchenId,
    filters: {
      dishes: [],
    },
    images: [''],
    description: '',
    tags: dishTags,
    links: [],
    delayTime: '',
    availability: availability,
    delivery: {
      name: swiggyDishName,
      dishPrice: null,
      visibility: swiggyVisibility,
      availability: swiggyAvailability,
      kitchenId: swiggySelectedKitchenId,
      extras: [],
      categories: [],
      portions: [],
    },
    take_away: {
      name: zomatoDishName,
      dishPrice: zomatoDishPrice,
      visibility: zomatoVisibility,
      availability: zomatoAvailability,
      kitchenId: zomatoSelectedKitchenId,
      extras: [],
      categories: [],
      portions: [],
    },
    version: 0,
    id: '',
  };

  const [data, setData] = useState<Dish>(testData);
  const [dishData, setDishData] = useState<Dish>(testData);

  const getKitchenData = async () => {
    try {
      const kitchens = await axios.get(paths.getAllKitchens(businessId || ''));
      const data: IData | any = {
        kitchens: kitchens?.data,
      };
      await getRecommendedDishes();
      setData(data);
      if (kitchens.data && kitchens?.data?.length === 0) {
        toast.error('Please Create a kitchen first');
        setSelectedIcon('Kitchen');
        startTransition(() => {
          return navigate(`/app/business/${businessId}/kitchen?tab=Kitchen`);
        });
      }
      setSelectedKitchenId(kitchens?.data[0]?._id);
      setSwiggySelectedKitchenId(kitchens?.data[0]?._id);
      setZomatoSelectedKitchenId(kitchens?.data[0]?._id);
      return data;
    } catch (err) {
      console.error(err);
    }
  };

  async function getCategoryDishesApi() {
    try {
      const category = await axios.get(`/v1/categories?businessId=${businessId}&queryCategories=true`);
      setData((prev) => {
        return { ...prev, categories: category?.data };
      });
    } catch (err) {
      console.error(err);
    }
  }
  async function getRecommendedDishes() {
    try {
      const dishes = await axios.get(`/v1/dishes?businessId=${businessId}&queryDish=true`);
      setRecommendedDishes(dishes?.data);
      setData((prev) => {
        return { ...prev, dishes: dishes?.data };
      });
    } catch (err) {
      console.error(err);
    }
  }
  async function getExtras() {
    try {
      const addOns = await axios.get(paths.getExtraApi(businessId || ''));
      setData((prev) => {
        return { ...prev, extras: addOns?.data };
      });
    } catch (err) {
      console.error(err);
    }
  }

  const {
    isLoading,
    error,
    data: allData,
    refetch,
  } = useQuery({
    queryKey: ['getKitchenData', businessId],
    queryFn: getKitchenData,
    enabled: !!businessId,
  });

  useEffect(() => {
    setRecommendedDishes(data?.dishes);
    setCategory(data?.categories);
    setAddOns(data?.extras);
    setKitchen(data?.kitchens);
  }, [data]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleTagsClick = async (event: Event) => {
    const value = (event.target as HTMLElement).innerText;
    if (dishTags.includes(value)) {
      setDishTags(dishTags.filter((keyword) => keyword !== value));
    } else {
      setDishTags([...dishTags, value]);
    }
  };

  const dishValidations = async () => {
    const isDishValid =
      dishData?.name !== '' &&
      dishData?.price !== null &&
      dishData?.price !== undefined &&
      dishData?.price !== 0 &&
      selectedKitchenId !== '' &&
      dishData?.dishType !== 'select a dish type'.replace(/[^a-zA-Z ]/, '').toLowerCase() &&
      dishData?.dishType !== '';
    // Check portions validity (return true if portions array is empty)
    if (!isDishValid) {
      toast.error('Please fill the name, price and dish type');
      return false;
    }
    const isNameDuplicate = recommendedDishes?.some((everyDish) => {
      const isDuplicate = everyDish?.name?.toLowerCase() === dishData?.name?.toLowerCase();
      return isDuplicate;
    });
    if (isNameDuplicate) {
      toast.error('Dish name already exists.');
      return false;
    }

    let allPortionsValid = true;
    if (isDishValid && portions?.length > 0) {
      allPortionsValid = validPortionCheck(portions);
      if (!allPortionsValid) {
        toast.error('Please check the portion details');
        return false;
      }
    }

    // Check Swiggy validity
    let isSwiggyValid = true;
    let allSwiggyPortionsValid = true;
    let isZomatoValid = true;
    let allZomatoPortionsValid = true;
    isSwiggyValid = swiggyDishPrice !== '';
    if (!isSwiggyValid && toggleSwiggySwitch) {
      toast.error('Please check the swiggy price');
      return false;
    }
    if (toggleSwiggySwitch && swiggyPortions?.length > 0) {
      allSwiggyPortionsValid = validPortionCheck(swiggyPortions);
      if (!allSwiggyPortionsValid) {
        toast.error('Please check the swiggy portions');
        return false;
      }
    }
    isZomatoValid = zomatoDishPrice !== '';
    if (!isZomatoValid && toggleZomatoSwitch) {
      toast.error('Please check the zomato price');
      return false;
    }
    if (toggleZomatoSwitch && zomatoPortions?.length > 0) {
      allZomatoPortionsValid = validPortionCheck(zomatoPortions);
      if (!allZomatoPortionsValid) {
        toast.error('Please check the zomato portions');
        return false;
      }
    }
    return true;
  };

  const postAddDish = async () => {
    // Check dish validity
    setIsSubmitting(true);
    const isValid = await dishValidations();
    if (!isValid) {
      setIsSubmitting(false);
      return;
    }
    setLoading(true);
    const imageUrls = await handleSave();
    try {
      const config = {
        mode: 'cors',
        method: 'POST',
        url: paths.postDishData(),
        headers: {
          'Content-Type': 'application/json',
        },
        data: {
          ...dishData,
          businessId: businessId,
          availability: availability,
          visibility: visibility,
          categories: postCategory,
          extras: postAddOns,
          portions: portions,
          tags: dishTags,
          filters: {
            dishes: postRecommend,
          },
          kitchenId: selectedKitchenId,
          description: description,
          images: imageUrls,
          delivery: {
            name: swiggyDishName,
            dishPrice: swiggyDishPrice,
            visibility: swiggyVisibility,
            availability: swiggyAvailability,
            kitchenId: swiggySelectedKitchenId === undefined ? selectedKitchenId : swiggySelectedKitchenId,
            extras: swiggyPostAddOns,
            portions: swiggyPortions,
            categories: swiggyPostCategory,
          },
          take_away: {
            name: zomatoDishName,
            dishPrice: zomatoDishPrice,
            visibility: zomatoVisibility,
            availability: zomatoAvailability,
            kitchenId: zomatoSelectedKitchenId === undefined ? selectedKitchenId : zomatoSelectedKitchenId,
            extras: zomatoPostAddOns,
            portions: zomatoPortions,
            categories: zomatoPostCategory,
          },
        },
      };
      const response = await axios(config);
      if (response?.status === 201 || response?.status === 200) {
        toast.success('dish created successfully');
        startTransition(() => {
          navigate(`/app/business/${businessId}/items?tab=items`);
        });
      }
    } catch (err: any) {
      if (err?.response && err?.response?.data && err?.response?.data?.errors) {
        const errors: any = err?.response?.data?.errors;
        errors.forEach((error: any) => {
          toast.error(error.message);
        });
      }
    } finally {
      setIsSubmitting(false);
    }
    setLoading(false);
  };

  const handleIncreasePortion = () => {
    setPortions([...portions, { name: '', price: '', portionType: '' }]);
  };

  const handleRemovePortion = (index: number) => {
    const newPortions = portions.filter((_, idx) => idx !== index);
    setPortions(newPortions);
    setDishData((prev: any) => {
      return {
        ...prev,
        portions: newPortions,
      };
    });
  };

  const fileInputRefs = useRef<any>([]);
  const [imageFiles, setImageFiles] = useState<(File | null)[]>([null]);
  const [showCropper, setShowCropper] = useState(false);

  const handleClose = () => {
    setShowCropper(false);
  };

  // file storing
  const handleImageChange = async (event: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.readAsDataURL(file);

      reader.onloadend = () => {
        setDisplayImages((prev) => {
          const newDisplayImages = [...prev];
          newDisplayImages[index] = reader.result as string;
          setCroppingImage(reader.result as string);
          setCroppingImageIndex(index);
          return newDisplayImages;
        });
        setShowCropper(true);
      };
      setImageFiles((prev) => {
        const newFiles = [...prev];
        newFiles[index] = file;
        return newFiles;
      });
    }
  };

  // crop and store new image file
  const handleCrop = async () => {
    const cropper = cropperRef?.current;
    if (cropper) {
      const coordinates = cropper?.getCoordinates();
      try {
        const croppedDataUrl = await cropImage(croppingImage, coordinates);
        if (typeof croppedDataUrl === 'string') {
          const blob = await (await fetch(croppedDataUrl)).blob();
          const originalFile = imageFiles[croppingImageIndex];
          const croppedFile = new File([blob], originalFile.name, { type: originalFile.type });

          const reader = new FileReader();
          reader.onloadend = () => {
            setDisplayImages((prev) => {
              const newDisplayImages = [...prev];
              newDisplayImages[croppingImageIndex] = reader.result as string;
              return newDisplayImages;
            });
            setImageFiles((prev) => {
              const newFiles = [...prev];
              newFiles[croppingImageIndex] = croppedFile;
              return newFiles;
            });
            setShowCropper(false);
          };
          reader.readAsDataURL(croppedFile);
        }
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleSave = async () => {
    const imageUrls = await Promise.all(
      imageFiles.map(async (file) => {
        if (file) {
          const imageUrl = await storeImageAfterSave(file);
          return imageUrl;
        }
        return null;
      }),
    );
    return imageUrls;
  };

  const addNewImageField = () => {
    setDisplayImages((prev) => [...prev, '']);
  };
  function toggleLoyality() {
    setToggleSwiggySwitch(!toggleSwiggySwitch);
  }
  function toggleZomatoLoyality() {
    setToggleZomatoSwitch(!toggleZomatoSwitch);
  }
  const [categoryPopup, setCategoryPopup] = useState(false);
  const [recommendPopup, setRecommendPopup] = useState(false);
  const [addOnPopUp, setAddOnPopUp] = useState(false);
  const closeCategoryPopup = () => {
    setCategoryPopup(false);
  };
  const closeRecommendPopup = () => {
    setRecommendPopup(false);
  };
  const closeAddOnPopUp = () => {
    setAddOnPopUp(false);
  };
  const addCategory = () => {
    setCategoryPopup(true);
    if (data?.categories?.length > 0) return;
    getCategoryDishesApi();
  };
  const addOnsPopUp = () => {
    setAddOnPopUp(true);
    if (data?.extras?.length > 0) return;
    getExtras();
  };
  const addRecommend = () => {
    setRecommendPopup(true);
    if (recommendedDishes?.length > 0) return;
    getRecommendedDishes();
  };
  function handleCategory(category: IDish[]) {
    setPostCategory(category);
    setCategoryPopup(false);
  }

  function handleRecommend(activeClick: IDish[]) {
    setPostRecommend(activeClick);
    setRecommendPopup(false);
  }
  function handleAddOns(activeClick: Extra[]) {
    setPostAddOns(activeClick);
    setAddOnPopUp(false);
  }
  function removeRecommendDish(indexToRemove: number) {
    setPostRecommend((prev: any) => prev.filter((pre: any, index: number) => index !== indexToRemove));
  }
  function removeCategoryCharges(indexToRemove: number) {
    setPostCategory((prev: any) => prev.filter((pre: any, index: number) => index !== indexToRemove));
  }
  function removeAddons(indexToRemove: number) {
    setPostAddOns((prev: any) => prev.filter((pre: any, index: number) => index !== indexToRemove));
  }
  function handleNameDish(e: React.ChangeEvent<HTMLInputElement>) {
    setDishData((prevZone) => {
      return {
        ...prevZone,
        name: e.target.value
          .replace(/^\s+/, '') // Remove leading spaces
          .replace(/\s{3,}/g, ' ') // Replace consecutive spaces with a single space
          .replace(/[^\w\s]/g, ''), // Remove special characters except spaces
      };
    });
  }

  function handleDishType(e: React.ChangeEvent<HTMLSelectElement>) {
    setDishData((prevZone) => {
      return {
        ...prevZone,
        dishType: e.target.value.replace(/[^a-zA-Z ]/, '').toLowerCase(),
      };
    });
  }
  function handleDishPrice(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.value.replace(/[^0-9]/g, '');
    setDishData((prevZone: Dish) => {
      return {
        ...prevZone,
        price: value,
      };
    });
  }

  const handleToggleAvailability = () => setAvailability(!availability);
  const handleToggleVisibility = () => setVisibility(!visibility);

  const handleKitchenChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedKitchenId(event.target.value);
  };
  const handleRemoveImageUrl = (index: number) => {
    setDisplayImages((prev) => prev.filter((_, idx) => idx !== index));
    setImageFiles((prev) => prev.filter((_, idx) => idx !== index));
  };

  const addDescription = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setDescription(
      e.target.value
        .replace(/^\s+/, '')
        .replace(/\s{3,}/g, ' ')
        .replace(/[^\w\s.,]/g, ''),
    );
  };

  const handleBack = () => {
    startTransition(() => {
      navigate(`/app/business/${businessId}/items?tab=dish`);
    });
  };

  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorComponent refetch={refetch} />;

  return (
    <>
      <div className="pb-12">
        <div className="sticky top-0 z-20 bg-[#f5f5f5]">
          <Header title="Dish" onBack={handleBack} leftIcon={<BsChevronLeft />} centerImage={Hi} rightImage={Hi} isIconBusinessShow={false} />

          <div className="mt-6 flex items-center justify-between border-b border-[#cacaca] px-6 pb-4">
            <div className="flex text-2xl">
              <span>Add a Dish</span>
            </div>
          </div>
        </div>
        <div>
          <div className="ml-6 mt-4 font-medium">
            Name of the Dish <span className="text-red-500">*</span>
          </div>
          <div className="relative mt-4 w-full px-6">
            <input
              type="text"
              onChange={(e) => handleNameDish(e)}
              value={dishData?.name}
              id="floating_outlined"
              className="peer mb-0 ml-0 mr-0 block w-full rounded-md border border-gray-800 bg-transparent pb-2 pl-2 pr-[7rem] pt-1 text-base text-gray-900 focus:border-[#2B354D] focus:outline-none focus:ring-0 dark:border-[#2B354D] dark:text-white"
              placeholder="Name"
              maxLength={50}
              required
            />
          </div>
          <div className="ml-6 mt-4 font-medium">
            Dish Type <span className="text-red-500">*</span>
          </div>
          <div className="relative mt-4 w-full px-6">
            <select
              onChange={(e) => handleDishType(e)}
              value={dishData?.dishType?.replace(/[^a-zA-Z ]/, '').toLowerCase()}
              className="w-full rounded-md border p-2"
            >
              {dishTypes?.map((dish: any) => (
                <option className="!bg-white !text-[#2B354D]" key={dish?._id} value={dish?.type?.replace(/[^a-zA-Z ]/, '').toLowerCase()}>
                  {dish?.type}
                </option>
              ))}
            </select>
          </div>
          <div className="mx-6 my-6 rounded-md border border-[#cacaca] px-4 pb-4 pt-2">
            <div className="border-b border-[#cacaca] pb-2">
              <h1 className="text-2xl">Basic - Dine In</h1>
            </div>
            <div className="mt-2 space-y-4">
              <div>
                <label className="mb-2 block font-medium text-[#2B354D]" htmlFor="dishPrice">
                  Dish Price <span className="text-red-500">*</span>
                </label>
                <input
                  onChange={(e) => handleDishPrice(e)}
                  value={dishData?.price}
                  id="dishPrice"
                  type="text"
                  placeholder="Price"
                  className="w-full rounded-md border p-2"
                  maxLength={4}
                />
              </div>
              <div>
                <label className="mb-2 block font-medium text-[#2B354D]" htmlFor="taxesCharges">
                  Kitchen <span className="text-red-500">*</span>
                </label>
                <select onChange={handleKitchenChange} value={selectedKitchenId} className="w-full rounded-md border p-2">
                  {kitchen?.map((kitchen: IKitchen) => (
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
                    <button type="button" className="on_active_bounce border-1 rounded-md border px-4 py-1">
                      Add
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 md:gap-2 lg:grid-cols-4">
                  {postCategory?.map((category: ICategory, index: number) => {
                    return (
                      <div key={category?._id} className="border-1 my-2 flex flex-col rounded-md border p-3">
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
                  <button type="button" onClick={handleIncreasePortion} className="on_active_bounce border-1 rounded-md border px-4 py-1">
                    Add
                  </button>
                </div>
                {portions?.map((portion, index) => (
                  <div key={portion?._id} className="border-1 space-y-2 rounded-lg border border-[#cacaca] p-2">
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
                        value={portion.name}
                        maxLength={50}
                        onChange={(e) => {
                          const newPortions = [...portions];
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
                        value={portion.price}
                        maxLength={4}
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
                        value={[...portions][index].portionType}
                        className="w-full rounded-md border p-2"
                      >
                        {dishTypes?.map((dish: any) => (
                          <option className="!bg-white !text-[#2B354D]" key={dish?._id} value={dish?.type?.replace(/[^a-zA-Z ]/, '').toLowerCase()}>
                            {dish?.type}
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
            <div className="grid grid-cols-1 md:grid-cols-2 md:gap-2 lg:grid-cols-4">
              {postAddOns?.map((addon: any, index: number) => {
                return (
                  <div key={index.toString()} className="border-1 my-2 flex flex-col rounded-md border p-3">
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
          </div>
          <div className={`${toggleSwiggySwitch ? '' : 'opacity-50'} mx-6 rounded-md border border-[#cacaca]`}>
            <div className="flex items-center justify-between px-4 py-4 ">
              <span className="text-2xl"> Basic - Swiggy</span>
              <Switch uncheckedIcon={false} checkedIcon={false} onChange={toggleLoyality} checked={toggleSwiggySwitch} offColor="#CACACA" />
            </div>
            {toggleSwiggySwitch ? (
              <SwiggyDish
                data={data}
                setData={setData}
                selectedKitchenId={swiggySelectedKitchenId}
                setSelectedKitchenId={setSwiggySelectedKitchenId}
                dishName={swiggyDishName}
                setDishName={setSwiggyDishName}
                dishPrice={swiggyDishPrice}
                setDishPrice={setSwiggyDishPrice}
                portions={swiggyPortions}
                setPortions={setSwiggyPortions}
                categoryPopup={swiggyCategoryPopup}
                setCategoryPopup={setSwiggyCategoryPopup}
                addOnPopUp={swiggyAddOnPopUp}
                setAddOnPopUp={setSwiggyAddOnPopUp}
                setPostAddOns={setSwiggyPostAddOns}
                availability={swiggyAvailability}
                setAvailability={setSwiggyAvailability}
                setVisibility={setSwiggyVisibility}
                visibility={swiggyVisibility}
                postCategory={swiggyPostCategory}
                postAddOns={swiggyPostAddOns}
                setPostCategory={setSwiggyPostCategory}
              />
            ) : (
              ''
            )}
          </div>
          <div className={`${toggleZomatoSwitch ? '' : 'opacity-50'} mx-6 my-4 rounded-md border border-[#cacaca]`}>
            <div className="flex items-center justify-between px-4 py-4 ">
              <span className="text-2xl"> Basic - Zomato</span>
              <Switch uncheckedIcon={false} checkedIcon={false} onChange={toggleZomatoLoyality} checked={toggleZomatoSwitch} offColor="#CACACA" />
            </div>
            {toggleZomatoSwitch ? (
              <ZomatoDish
                data={data}
                setData={setData}
                selectedKitchenId={zomatoSelectedKitchenId}
                setSelectedKitchenId={setZomatoSelectedKitchenId}
                dishName={zomatoDishName}
                setDishName={setZomatoDishName}
                dishPrice={zomatoDishPrice}
                setDishPrice={setZomatoDishPrice}
                portions={zomatoPortions}
                setPortions={setZomatoPortions}
                categoryPopup={zomatoCategoryPopup}
                setCategoryPopup={setZomatoCategoryPopup}
                addOnPopUp={zomatoAddOnPopUp}
                setAddOnPopUp={setZomatoAddOnPopUp}
                setPostAddOns={setZomatoPostAddOns}
                availability={zomatoAvailability}
                setAvailability={setZomatoAvailability}
                setVisibility={setZomatoVisibility}
                visibility={zomatoVisibility}
                postCategory={zomatoPostCategory}
                postAddOns={zomatoPostAddOns}
                setPostCategory={setZomatoPostCategory}
              />
            ) : (
              ''
            )}
          </div>
          <div className="mx-6 mt-6 rounded-md border border-[#cacaca] px-4 pb-4 pt-2">
            <div className="relative my-4 mt-4 flex w-full justify-between">
              <h1 className="text-xl">Display</h1>
              <div onClick={addNewImageField}>
                <button type="button" className="on_active_bounce border-1 rounded-md border px-4 py-1 ">
                  Add
                </button>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 md:gap-2 lg:grid-cols-4">
              {displayImages?.map((image, index) => (
                <div key={index.toString()} className="mt-2 flex">
                  {image ? (
                    <div className="relative aspect-square">
                      <div>
                        <img
                          src={image}
                          alt={`image-${index}`}
                          width={250}
                          height={250}
                          className="h-[250px] w-[250px] rounded-md border border-[#cacaca] object-contain"
                          loading="lazy"
                        />
                      </div>
                      <div>
                        <button
                          type="button"
                          onClick={() => handleRemoveImageUrl(index)}
                          className="absolute right-2 top-2 rounded-full bg-[#cacaca] p-1 text-black"
                        >
                          <HiX className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="relative aspect-square">
                      <div
                        className="flex h-[120px] w-[140px] items-center justify-center rounded-md border border-[#cacaca] p-6"
                        onClick={() => fileInputRefs.current[index].click()}
                      >
                        <span className="text-2xl">+</span>
                      </div>
                      <div>
                        <button
                          type="button"
                          onClick={() => handleRemoveImageUrl(index)}
                          className="absolute right-2 top-2 rounded-full bg-[#cacaca] p-1 text-black"
                        >
                          <HiX className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  )}
                  <input
                    type="file"
                    ref={(el) => (fileInputRefs.current[index] = el)}
                    style={{ display: 'none' }}
                    accept=".png, .jpeg, .jpg, .webp"
                    onChange={(e) => handleImageChange(e, index)}
                  />
                  <div className="mx-2 text-sm font-normal text-[#2B354D] opacity-70">
                    {(index === 0 || '0') && <p>Cover Image</p>}
                    <p>1080 px X 1080 px</p>
                    <p>Png, Jpeg, Webp</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4">
              <h2 className="text-xl">Description</h2>
              <textarea
                value={description}
                maxLength={600}
                className="mt-2 h-24 w-full rounded-md border p-2"
                placeholder="write about the dish...."
                onChange={addDescription}
              />
            </div>
          </div>
          <div className="mx-6 mt-6 rounded-md border border-[#cacaca] px-4 pb-4 pt-2">
            <h1 className="border-b border-[#cacaca] pb-2 text-2xl">Recommendation</h1>
            <div className="mt-4 flex flex-col">
              <div className="flex flex-row justify-between">
                <h1>Recommended dishes</h1>
                <div>
                  <button type="button" onClick={addRecommend} className="border-1 on_active_bounce  rounded-md border px-4 py-1 text-[#2B354D]">
                    Add
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 md:gap-2 lg:grid-cols-4">
                {postRecommend?.map((dishes: IDish, index: number) => {
                  return (
                    <div key={dishes?._id} className="border-1 my-2 flex flex-col rounded-md border p-3 md:my-0">
                      <div className="flex items-center">
                        <MdDinnerDining />
                        <h1 className="mx-2 capitalize">{dishes?.name}</h1>
                      </div>
                      <div className="mt-4 flex self-end">
                        <button type="button" onClick={() => removeRecommendDish(index)} className="text-[#2F80ED]">
                          Remove
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
          <div className="mx-6 mt-6 rounded-md border border-[#cacaca] px-4 pb-4 pt-2">
            <h1>Tags:</h1>
            <section className="my-2 mt-4 flex flex-wrap gap-4 overflow-x-auto">
              {tags.map((tag) => {
                return (
                  <div
                    onKeyDown={handleTagsClick}
                    onClick={handleTagsClick}
                    key={tag?.text}
                    className={`${
                      dishTags.includes(tag?.text) ? 'bg-primary/50 text-base-100 font-medium' : 'text-primary bg-base-200'
                    } bg-base-100/50 inline-block flex items-center justify-center overflow-hidden truncate rounded-full border border-[#cacaca] px-5 py-1`}
                  >
                    <img src={tag?.image} alt="tags" width={20} height={20} loading="lazy" /> &nbsp;
                    <span>{tag?.text}</span>
                  </div>
                );
              })}
            </section>
          </div>
        </div>
      </div>
      <div className="sticky bottom-5 mx-6 my-6">
        <button
          type="button"
          disabled={isSubmitting}
          onClick={postAddDish}
          className={`${loading ? 'pointer-events-none opacity-50' : ''} on_active_bounce w-full rounded-md bg-[#2B354D] py-2.5 text-white`}
        >
          {loading ? 'Loading...' : 'Create'}
        </button>
      </div>
      <PopUp show={categoryPopup} onClose={closeCategoryPopup}>
        {loading && <LoadingSpinner />}
        <AddRecommendedDishes<ICategory[]>
          selectedData={postCategory}
          handleData={handleCategory}
          Data={category}
          closeRecommendPopup={closeCategoryPopup}
          headerText="Category"
        />
      </PopUp>
      <PopUp show={recommendPopup} onClose={closeRecommendPopup}>
        {loading && <LoadingSpinner />}
        <AddRecommendedDishes<IDish[]>
          selectedData={postRecommend}
          handleData={handleRecommend}
          Data={recommendedDishes}
          closeRecommendPopup={closeRecommendPopup}
          headerText="Dishes"
        />
      </PopUp>
      <PopUp show={addOnPopUp} onClose={closeAddOnPopUp}>
        {loading && <LoadingSpinner />}
        <AddExtras handleData={handleAddOns} Data={addOns} selectedData={postAddOns} closeAddOnPopUp={closeAddOnPopUp} />
      </PopUp>
      <PopUp show={showCropper} onClose={handleClose}>
        <div>
          <div>
            <ReactCropper image={croppingImage} ref={cropperRef} width={250} height={250} />
          </div>
          <div className="flex bg-white py-2">
            <button
              type="button"
              className="on_active_bounce fixed bottom-5 mx-4 w-[25rem] rounded-md bg-[#2B354D] py-2.5 text-white"
              onClick={handleCrop}
            >
              Save & Close
            </button>
          </div>
        </div>
      </PopUp>
    </>
  );
});

export default AddDish;
