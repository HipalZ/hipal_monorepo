import Hi from '@/assets/svg/hi.svg';
import axios from '@/axios';
import Header from '@/components/molecules/header';
import type { Dish, Extra, ICategory, IData, IDish, IKitchen, IPortion } from '@/components/types/businessData';
import { storeImageAfterSave, validPortionCheck } from '@/components/utils/helper';
import { paths } from '@/components/utils/paths';
import { useRouter } from 'next/router';
import type React from 'react';
import { memo, useRef, useState } from 'react';
import { BsChevronLeft } from 'react-icons/bs';
import { MdDinnerDining } from 'react-icons/md';
import Switch from 'react-switch';
// import SwiggyDish from "@/components/atom/swiggyDish";
import AddExtras from '@/components/atom/addExtras';
import AddRecommendedDishes from '@/components/atom/addRecommendedDishes';
import DeleteConfirmationModal from '@/components/atom/deleteUser';
import PopUp from '@/components/atom/popUp';
import Image from 'next/image';
import { toast } from 'react-toastify';
import { dishTypes, tags } from '../addDish';
// import ZomatoDish from "@/components/atom/zomatoDish";
import LoadingSpinner from '@/components/atom/loadingSpinner';
import ReactCropper, { cropImage } from '@/components/atom/reactCropper';
import ErrorComponent from '@/components/errorComponent';
import { useQuery } from '@tanstack/react-query';
import { HiX } from 'react-icons/hi';

function EditDish() {
  const router = useRouter();
  const { businessId } = router.query as { businessId: string };
  const { editDish } = router?.query as {
    editDish: string;
  };
  // const [toggleSwiggySwitch, setToggleSwiggySwitch] = useState(false);
  // const [toggleZomatoSwitch, setToggleZomatoSwitch] = useState(false);
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
  // const [swiggySelectedKitchenId, setSwiggySelectedKitchenId] = useState("");
  // const [swiggyDishName, setSwiggyDishName] = useState<string>("");
  // const [swiggyDishPrice, setSwiggyDishPrice] = useState<string>("");
  // const [swiggyPortions, setSwiggyPortions] = useState<IPortion[]>([]);
  // const [swiggyCategoryPopup, setSwiggyCategoryPopup] = useState(false);
  // const [swiggyAddOnPopUp, setSwiggyAddOnPopUp] = useState(false);
  // const [swiggyPostAddOns, setSwiggyPostAddOns] = useState<Extra[]>([]);
  // const [swiggyAvailability, setSwiggyAvailability] = useState(true);
  // const [swiggyVisibility, setSwiggyVisibility] = useState(true);
  // const [swiggyPostCategory, setSwiggyPostCategory] = useState<IDish[]>([]);
  // const [zomatoSelectedKitchenId, setZomatoSelectedKitchenId] =
  // 	useState<string>("");
  // const [zomatoDishName, setZomatoDishName] = useState<string>("");
  // const [zomatoDishPrice, setZomatoDishPrice] = useState<string>("");
  // const [zomatoPortions, setZomatoPortions] = useState<IPortion[]>([]);
  // const [zomatoCategoryPopup, setZomatoCategoryPopup] = useState(false);
  // const [zomatoAddOnPopUp, setZomatoAddOnPopUp] = useState(false);
  // const [zomatoPostAddOns, setZomatoPostAddOns] = useState<IDish[]>([]);
  // const [zomatoAvailability, setZomatoAvailability] = useState(true);
  // const [zomatoVisibility, setZomatoVisibility] = useState(true);
  // const [zomatoPostCategory, setZomatoPostCategory] = useState<IDish[]>([]);
  const [loading, setLoading] = useState(false);
  const [displayImages, setDisplayImages] = useState([]);
  const [dishTags, setDishTags] = useState<string[]>([]);
  const [showCropper, setShowCropper] = useState(false);
  const cropperRef = useRef(null);
  const [croppingImage, setCroppingImage] = useState('');
  const [croppingImageIndex, setCroppingImageIndex] = useState<number | null>(null);
  const [modifiedImages, setModifiedImages] = useState<Set<number>>(new Set());

  const testData = {
    businessId: businessId,
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
      metaTags: dishTags,
    },
    images: [],
    description: '',
    links: [],
    taxes: [],
    delayTime: '',
    availability: availability,
    // delivery: {
    // 	dishPrice: swiggyDishPrice,
    // 	visibility: swiggyVisibility,
    // 	availability: swiggyAvailability,
    // 	kitchenId: swiggySelectedKitchenId,
    // 	extras: swiggyPostAddOns,
    // 	categories: swiggyPostCategory,
    // 	portions: swiggyPortions,
    // },
    // take_away: {
    // 	dishPrice: zomatoDishPrice,
    // 	visibility: zomatoVisibility,
    // 	availability: zomatoAvailability,
    // 	kitchenId: zomatoSelectedKitchenId,
    // 	extras: zomatoPostAddOns,
    // 	categories: zomatoPostCategory,
    // 	portions: zomatoPortions,
    // },
    version: 0,
    id: editDish,
  };
  const [dishData, setDishData] = useState<Dish>(testData);
  // const [data, setData] = useState<Dish>(testData);
  const [loadingData, setLoadingData] = useState(false);
  const handleTagsClick = async (event) => {
    const value = event.target.innerText;
    if (dishTags.includes(value)) {
      setDishTags(dishTags.filter((keyword) => keyword !== value));
    } else {
      setDishTags([...dishTags, value]);
    }
  };
  const getAllData = async () => {
    setLoadingData(true);
    try {
      const dish = await axios.get(paths.getDishApi(editDish));
      const kitchens = await axios.get(paths.getAllKitchens(businessId));
      const data: IData | any = {
        kitchens: kitchens?.data,
        dish: dish?.data,
      };
      await getRecommendedDishes();
      setKitchen(data?.kitchens);
      setSelectedKitchenId(data?.dish?.kitchenId);
      setDishData(data?.dish);
      setPostAddOns(data?.dish?.extras);
      setPostCategory(data?.dish?.categories);
      setPostRecommend(data?.dish?.filters?.dishes);
      setDescription(data?.dish?.description);
      setPortions(data?.dish?.portions);
      setAvailability(data?.dish?.availability);
      setVisibility(data?.dish?.visibility);
      setDisplayImages(data?.dish?.images);
      setDishTags(data?.dish?.filters?.metaTags || []);
      // if (data?.dish?.delivery) {
      // 	if (data?.dish?.delivery?.dishPrice !== "") {
      // 		setToggleSwiggySwitch(true);
      // 	}
      // 	setSwiggySelectedKitchenId(data?.dish?.delivery?.kitchenId);
      // 	setSwiggyDishPrice(data?.dish?.delivery?.dishPrice);
      // 	setSwiggyPortions(data?.dish?.delivery?.portions);
      // 	setSwiggyAvailability(data?.dish?.delivery?.availability);
      // 	setSwiggyVisibility(data?.dish?.delivery?.visibility);
      // 	setSwiggyPostAddOns(data?.dish?.delivery?.extras);
      // 	setSwiggyPostCategory(data?.dish?.delivery?.categories);
      // }
      // if (data?.dish?.take_away) {
      // 	if (data?.dish?.take_away?.dishPrice !== "") {
      // 		setToggleZomatoSwitch(true);
      // 	}
      // 	setZomatoSelectedKitchenId(data?.dish?.take_away?.kitchenId);
      // 	setZomatoDishPrice(data?.dish?.take_away?.dishPrice);
      // 	setZomatoPortions(data?.dish?.take_away?.portions);
      // 	setZomatoAvailability(data?.dish?.take_away?.availability);
      // 	setZomatoVisibility(data?.dish?.take_away?.visibility);
      // 	setZomatoPostAddOns(data?.dish?.take_away?.extras);
      // 	setZomatoPostCategory(data?.dish?.take_away?.categories);
      // }
      // setData(data);
      return data;
    } catch (err) {
    } finally {
      setLoadingData(false);
    }
  };

  const {
    isLoading,
    error,
    data: allData,
    refetch,
  } = useQuery({
    queryKey: ['dish', businessId, editDish],
    queryFn: getAllData,
    enabled: !!businessId && !!editDish,
  });
  async function getCategoryDishesApi() {
    try {
      const category = await axios.get(`/v1/categories?businessId=${businessId}&queryCategories=true`);
      // setData((prev) => {
      // 	return { ...prev, categories: category?.data };
      // });
      setCategory(category?.data);
    } catch (err) {}
    setLoading(false);
  }
  async function getRecommendedDishes() {
    try {
      const dishes = await axios.get(`/v1/dishes?businessId=${businessId}&queryDish=true`);
      // setData((prev) => {
      // 	return { ...prev, dishes: dishes?.data };
      // });
      setRecommendedDishes(dishes?.data);
    } catch (e) {
      console.log(e);
    }
  }
  async function getExtras() {
    try {
      const addOns = await axios.get(paths.getExtraApi(businessId));
      setAddOns(addOns?.data);
      // setData((prev) => {
      // 	return { ...prev, extras: addOns?.data };
      // });
    } catch (err) {}
  }

  // useEffect(() => {
  // 	if (data?.dish?.delivery) {
  // 		if (data?.dish?.delivery?.dishPrice !== "") {
  // 			setToggleSwiggySwitch(true);
  // 		}
  // 		setSwiggySelectedKitchenId(data?.dish?.delivery?.kitchenId);
  // 		setSwiggyDishName(data?.dish?.delivery?.name);
  // 		setSwiggyDishPrice(data?.dish?.delivery?.dishPrice);
  // 		setSwiggyPortions(data?.dish?.delivery?.portions);
  // 		setSwiggyAvailability(data?.dish?.delivery?.availability);
  // 		setSwiggyVisibility(data?.dish?.delivery?.visibility);
  // 		setSwiggyPostAddOns(data?.dish?.delivery?.extras);
  // 		setSwiggyPostCategory(data?.dish?.delivery?.categories);
  // 	}
  // 	if (data?.dish?.take_away) {
  // 		if (data?.dish?.take_away?.dishPrice !== "") {
  // 			setToggleZomatoSwitch(true);
  // 		}
  // 		setZomatoSelectedKitchenId(data?.dish?.take_away?.kitchenId);
  // 		setZomatoDishName(data?.dish?.take_away?.name);
  // 		setZomatoDishPrice(data?.dish?.take_away?.dishPrice);
  // 		setZomatoPortions(data?.dish?.take_away?.portions);
  // 		setZomatoAvailability(data?.dish?.take_away?.availability);
  // 		setZomatoVisibility(data?.dish?.take_away?.visibility);
  // 		setZomatoPostAddOns(data?.dish?.take_away?.extras);
  // 		setZomatoPostCategory(data?.dish?.take_away?.categories);
  // 	}
  // }, [data]);

  const [isSubmitting, setIsSubmitting] = useState(false);

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
      toast.error('Please check the name, price and dish type');
      return false;
    }

    const isNameDuplicate = recommendedDishes?.some((everyDish) => {
      const isDuplicate = everyDish?.name?.toLowerCase() === dishData?.name?.toLowerCase() && everyDish._id !== editDish;
      return isDuplicate;
    });
    if (isNameDuplicate) {
      toast.error('Dish name already exists change the name of dish');
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
    // let isSwiggyValid = true;
    // let allSwiggyPortionsValid = true;
    // let isZomatoValid = true;
    // let allZomatoPortionsValid = true;
    // isSwiggyValid = swiggyDishPrice !== "";
    // if (!isSwiggyValid && toggleSwiggySwitch) {
    // 	toast.error("Please check the swiggy price")
    // 	return false
    // }
    // if (toggleSwiggySwitch && swiggyPortions?.length > 0) {
    // 	allSwiggyPortionsValid = validPortionCheck(swiggyPortions);
    // 	if (!allSwiggyPortionsValid) {
    // 		toast.error("Please check the swiggy portions")
    // 		return false
    // 	}
    // }
    // isZomatoValid = zomatoDishPrice !== "";
    // if (!isZomatoValid && toggleZomatoSwitch) {
    // 	toast.error("Please check the zomato price")
    // 	return false
    // }
    // if (toggleZomatoSwitch && zomatoPortions?.length > 0) {
    // 	allZomatoPortionsValid = validPortionCheck(zomatoPortions);
    // 	if (!allZomatoPortionsValid) {
    // 		toast.error("Please check the zomato portions")
    // 		return false;
    // 	}
    // }
    return true;
  };

  const updateEditDish = async () => {
    // Check dish validity
    setIsSubmitting(true);
    const isValid = await dishValidations();
    if (!isValid) {
      setIsSubmitting(false);
      return;
    }
    setLoading(true);
    const imageUrls = await handleSave();
    const postAddOnsIds = postAddOns.map((item) => item._id);
    const postCategoryIds = postCategory.map((item) => item._id);
    const postRecommendIds = postRecommend.map((item) => item._id);
    try {
      const config = {
        mode: 'cors',
        method: 'PUT',
        url: paths.updateDishData(editDish),
        headers: {
          'Content-Type': 'application/json',
        },
        data: {
          ...dishData,
          businessId: businessId,
          availability: availability,
          visibility: visibility,
          categories: postCategoryIds,
          extras: postAddOnsIds,
          portions: portions,
          filters: {
            dishes: postRecommendIds,
            metaTags: dishTags,
          },
          kitchenId: selectedKitchenId,
          description: description,
          images: imageUrls,
          // delivery: {
          // 	name: swiggyDishName,
          // 	dishPrice: swiggyDishPrice,
          // 	visibility: swiggyVisibility,
          // 	availability: swiggyAvailability,
          // 	kitchenId:
          // 		swiggySelectedKitchenId === undefined
          // 			? selectedKitchenId
          // 			: swiggySelectedKitchenId,
          // 	extras: swiggyPostAddOns,
          // 	portions: swiggyPortions,
          // 	categories: swiggyPostCategory,
          // },
          // take_away: {
          // 	name: zomatoDishName,
          // 	dishPrice: zomatoDishPrice,
          // 	visibility: zomatoVisibility,
          // 	availability: zomatoAvailability,
          // 	kitchenId:
          // 		zomatoSelectedKitchenId === undefined
          // 			? selectedKitchenId
          // 			: zomatoSelectedKitchenId,
          // 	extras: zomatoPostAddOns,
          // 	portions: zomatoPortions,
          // 	categories: zomatoPostCategory,
          // },
        },
      };
      const response = await axios(config);
      if (response?.status === 201 || response?.status === 200) {
        toast.success('dish saved successfully');
        router.push(`/business/${businessId}?tab=items`);
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

  const handleClose = () => {
    setShowCropper(false);
  };

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
          setCroppingImageIndex(index); // Set the index of the image being cropped
          return newDisplayImages;
        });
        setShowCropper(true);
      };
      setImageFiles((prev) => {
        const newFiles = [...prev];
        newFiles[index] = file;
        return newFiles;
      });
      setModifiedImages((prev) => {
        const newModifiedImages = new Set(prev);
        newModifiedImages.add(index);
        return newModifiedImages;
      });
    }
  };

  const handleCrop = async () => {
    const cropper = cropperRef.current;
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
      imageFiles.map(async (file, index) => {
        if (file && modifiedImages.has(index)) {
          const imageUrl = await storeImageAfterSave(file);
          return imageUrl;
        }
        return displayImages[index] || null; // Use existing URL if not modified
      }),
    );
    return imageUrls;
  };

  const addNewImageField = () => {
    setDisplayImages((prev) => [...prev, '']);
  };
  // function toggleLoyality() {
  // 	setToggleSwiggySwitch(!toggleSwiggySwitch);
  // }
  // function toggleZomatoLoyality() {
  // 	setToggleZomatoSwitch(!toggleZomatoSwitch);
  // }
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
    if (category?.length > 0) return;
    getCategoryDishesApi();
  };
  const addOnsPopUp = () => {
    setAddOnPopUp(true);
    if (addOns?.length > 0) return;
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
    setDishData((prevZone: any) => {
      return {
        ...prevZone,
        name: e.target.value
          ?.replace(/^\s+/, '')
          .replace(/\s{3,}/g, ' ')
          .replace(/[^\w\s]/g, ''),
      };
    });
  }
  function handleDishType(e: any) {
    setDishData((prevZone: any) => {
      return {
        ...prevZone,
        dishType: e.target.value,
      };
    });
  }
  function handleDishPrice(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.value.replace(/[^0-9]/g, '');
    setDishData((prevZone: any) => {
      return {
        ...prevZone,
        price: value,
      };
    });
  }

  const handleToggleAvailability = () => setAvailability(!availability);
  const handleToggleVisibility = () => setVisibility(!visibility);

  const handleKitchenChange = (event: any) => {
    setSelectedKitchenId(event.target.value);
  };

  const handleRemoveImageUrl = async (index: number) => {
    setDisplayImages((prev) => prev.filter((_, idx) => idx !== index));
    setImageFiles((prev) => prev.filter((_, idx) => idx !== index));
  };
  const [removePopup, setRemovePopup] = useState(false);
  async function handleDeleteData() {
    try {
      const config = {
        mode: 'cors',
        method: 'DELETE',
        url: paths.deleteDishWithId(editDish),
        headers: {
          'Content-Type': 'application/json',
        },
      };
      const response = await axios(config);
      if (response?.status === 200) {
        toast.success('dish deleted successfully');
        router.push(`/business/${businessId}?tab=items`);
      }
    } catch (err: any) {
      if (err?.response && err?.response?.data && err?.response?.data?.errors) {
        const errors: any = err?.response?.data?.errors;
        errors.forEach((error: any) => {
          toast.error(error.message);
        });
      }
    }
  }

  if (error) return <ErrorComponent refetch={refetch} />;
  if (isLoading) return <LoadingSpinner />;

  return (
    <>
      {loadingData ? <LoadingSpinner /> : null}
      <div className="pb-12">
        <div className="sticky top-0 z-20 bg-[#f5f5f5]">
          <Header
            title="Dish"
            onBack={() => router.push(`/business/${businessId}?tab=items`)}
            isIconBusinessShow={false}
            leftIcon={<BsChevronLeft />}
            centerImage={Hi}
            rightImage={Hi}
          />

          <div className="mt-6 flex items-center justify-between border-b border-[#cacaca] px-6 pb-4">
            <div className="flex text-2xl">
              <span>Edit</span>
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
              onChange={handleNameDish}
              maxLength={50}
              value={dishData?.name}
              id="floating_outlined"
              className="peer mb-0 ml-0 mr-0 block w-full rounded-md border border-gray-800 bg-transparent pb-2 pl-2 pr-[7rem] pt-1 text-base text-gray-900 focus:border-[#2B354D] focus:outline-none focus:ring-0 dark:border-[#2B354D] dark:text-white"
              placeholder="Name"
              required
            />
          </div>
          <div className="ml-6 mt-4 font-medium">
            Dish Type <span className="text-red-500">*</span>
          </div>
          <div className="relative mt-4 w-full px-6">
            <select
              onChange={handleDishType}
              value={dishData?.dishType?.replace(/[^a-zA-Z ]/, '').toLowerCase()}
              className="w-full rounded-md border p-2"
            >
              {dishTypes?.map((dish: any) => (
                <option className="!bg-white !text-[#2B354D]" key={dish?._id} value={dish?.type?.replace(/[^a-zA-Z ]/, '').toLowerCase()}>
                  {dish?.type?.replace(/[^a-zA-Z ]/, '').toLowerCase()}
                </option>
              ))}
            </select>
          </div>
          <div className="mx-6 my-6 rounded-md border border-[#cacaca] px-4 pb-4 pt-2">
            <div className="mt-2 space-y-4">
              <div>
                <label className="mb-2 block font-medium text-[#2B354D]" htmlFor="dishPrice">
                  Dish Price <span className="text-red-500">*</span>
                </label>
                <input
                  onChange={handleDishPrice}
                  value={dishData?.price}
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
                  <button
                    type="button"
                    onClick={handleIncreasePortion}
                    className="border-1 on_active_bounce  rounded-md border px-4 py-1 text-[#2B354D]"
                  >
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
                        maxLength={20}
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
                          newPortions[index].price = e.target.value;
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
                        value={[...portions][index]?.portionType?.replace(/[^a-zA-Z ]/, '').toLowerCase()}
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
                <button type="button" className="on_active_bounce border-1 rounded-md border px-4 py-1">
                  Add
                </button>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 md:gap-2 lg:grid-cols-4">
              {postAddOns?.map((addon: Extra, index: number) => {
                return (
                  <div key={addon?._id} className="border-1 my-2 flex flex-col rounded-md border p-3">
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
          {/* <div
						className={`${toggleSwiggySwitch ? "" : "opacity-50"
							} rounded-md border mx-6 border-[#cacaca]`}
					>
						<div className="flex items-center justify-between px-4 py-4 ">
							<span className="text-2xl"> Basic - Swiggy</span>
							<Switch
								uncheckedIcon={false}
								checkedIcon={false}
								onChange={toggleLoyality}
								checked={toggleSwiggySwitch}
								offColor="#CACACA"
							/>
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
							""
						)}
					</div>
					<div
						className={`${toggleZomatoSwitch ? "" : "opacity-50"
							} rounded-md border mx-6 border-[#cacaca] my-4`}
					>
						<div className="flex items-center justify-between px-4 py-4 ">
							<span className="text-2xl"> Basic - Zomato</span>
							<Switch
								uncheckedIcon={false}
								checkedIcon={false}
								onChange={toggleZomatoLoyality}
								checked={toggleZomatoSwitch}
								offColor="#CACACA"
							/>
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
							""
						)}
					</div> */}
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
                <div key={`image+${index}`} className="mt-2 flex">
                  {image ? (
                    <div className="relative aspect-square">
                      <div>
                        <Image
                          src={image}
                          alt={`image-${index}`}
                          width={250}
                          height={250}
                          className="h-[250px] w-[250px] rounded-md border border-[#cacaca] object-contain"
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
                maxLength={610}
                value={description}
                className="mt-2 h-24 w-full rounded-md border p-2"
                placeholder="write about the dish "
                onChange={(e) =>
                  setDescription(
                    e.target.value
                      .replace(/^\s+/, '')
                      .replace(/\s{2,}/g, ' ')
                      .replace(/[^\w\s.,]/g, ''),
                  )
                }
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
                    <div key={dishes?._id} className="border-1 my-2 flex flex-col rounded-md border p-3">
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
                      dishTags?.includes(tag?.text) ? 'bg-primary/50 text-base-100 font-medium' : 'text-primary bg-base-200'
                    } bg-base-100/50 inline-block flex items-center justify-center overflow-hidden truncate rounded-full border border-[#cacaca] px-5 py-1`}
                  >
                    <Image src={tag?.image} alt="tags" width={18} height={18} /> &nbsp;
                    <span>{tag?.text}</span>
                  </div>
                );
              })}
            </section>
          </div>
        </div>
      </div>
      <div className="sticky bottom-5 mx-4 my-6 flex">
        <button
          type="button"
          onClick={() => setRemovePopup(true)}
          className={`${loading ? 'pointer-events-none opacity-50' : ''} on_active_bounce border-1 mr-2 w-full rounded-md border border-[#2B354D] bg-white py-2.5 text-[#2B354D]`}
        >
          {loading ? 'Loading...' : 'Delete'}
        </button>
        <button
          type="button"
          disabled={isSubmitting}
          onClick={updateEditDish}
          className={`${loading ? 'pointer-events-none opacity-50' : ''} on_active_bounce w-full rounded-md bg-[#2B354D] py-2.5 text-white`}
        >
          {loading ? 'Loading...' : 'Save'}
        </button>
      </div>
      <PopUp show={removePopup} onClose={() => setRemovePopup(false)}>
        <DeleteConfirmationModal
          text={`Are you sure you want to Delete ${dishData?.name} ?`}
          closeModal={() => setRemovePopup(false)}
          onDelete={handleDeleteData}
        />
      </PopUp>
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
}

export default memo(EditDish);
