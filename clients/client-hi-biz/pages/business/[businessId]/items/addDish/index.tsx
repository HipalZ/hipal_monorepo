import Header from "@/components/molecules/header";
import type React from "react";
import { memo, useEffect, useRef, useState } from "react";
import { BsChevronLeft } from "react-icons/bs";
import Hi from "@/assets/svg/hi.svg";
import { MdDinnerDining } from "react-icons/md";
import Switch from "react-switch";
import PopUp from "@/components/atom/popUp";
import type {
  Dish,
  ICategory,
  IDish,
  IKitchen,
  Extra,
  IPortion,
  IData,
} from "@/components/types/businessData";
import { paths } from "@/components/utils/paths";
import axios from "@/axios";
import { useRouter } from "next/router";
import {
  storeImageAfterSave,
  validPortionCheck,
} from "@/components/utils/helper";
import Image from "next/image";
import AddRecommendedDishes from "@/components/atom/addRecommendedDishes";
import { toast } from "react-toastify";
import AddExtras from "@/components/atom/addExtras";
import LoadingSpinner from "@/components/atom/loadingSpinner";
import { useQuery } from "@tanstack/react-query";
import { useSelectedIcon } from "@/components/store/useSelectedIcon";
import ErrorComponent from "@/components/errorComponent";
import { HiX } from "react-icons/hi";
import bestseller from "@/assets/svg/bestseller.svg";
import newImage from "@/assets/svg/new.svg";
import occasional from "@/assets/svg/occasional.svg";
import popular from "@/assets/svg/popular.svg";
import spicy from "@/assets/svg/spicy.svg";
import alcohol from "@/assets/svg/alcohol.svg";
import ReactCropper, { cropImage } from "@/components/atom/reactCropper";

export const dishTypes = [
  {
    id: 0,
    type: "select a dish type".replace(/[^a-zA-Z ]/, "").toLowerCase(),
  },
  {
    id: 1,
    type: "veg".replace(/[^a-zA-Z ]/, "").toLowerCase(),
  },
  {
    id: 2,
    type: "non-veg".replace(/[^a-zA-Z ]/, "").toLowerCase(),
  },
  {
    id: 3,
    type: "vegan".replace(/[^a-zA-Z ]/, "").toLowerCase(),
  },
  {
    id: 4,
    type: "egg".replace(/[^a-zA-Z ]/, "").toLowerCase(),
  },
  {
    id: 5,
    type: "mixed".replace(/[^a-zA-Z ]/, "").toLowerCase(),
  },
];

export const tags = [
  {
    text: "Best selling",
    image: bestseller,
  },
  {
    text: "All New",
    image: newImage,
  },
  {
    text: "Recommended",
    image: occasional,
  },
  {
    text: "Contains Alcohol",
    image: alcohol,
  },
  {
    text: "Spicy",
    image: spicy,
  },
  {
    text: "Contains Nuts",
    image: popular,
  },
];

function AddDish() {
  const router = useRouter();
  const { setSelectedIcon, setSelectedSubIcon } = useSelectedIcon();
  const { businessId } = router.query as { businessId: string };
  const [toggleSwiggySwitch, setToggleSwiggySwitch] = useState(false);
  const [toggleZomatoSwitch, setToggleZomatoSwitch] = useState(false);
  const [availability, setAvailability] = useState(true);
  const [visibility, setVisibility] = useState(true);
  const [kitchen, setKitchen] = useState<IKitchen[]>([]);
  const [selectedKitchenId, setSelectedKitchenId] = useState("");
  const [addOns, setAddOns] = useState<Extra[]>([]);
  const [category, setCategory] = useState<ICategory[] | any>([]);
  const [recommendedDishes, setRecommendedDishes] = useState<IDish[]>([]);
  const [postRecommend, setPostRecommend] = useState<IDish[]>([]);
  const [postAddOns, setPostAddOns] = useState<IDish[]>([]);
  const [description, setDescription] = useState<string>("");
  const [portions, setPortions] = useState<IPortion[]>([]);
  const [postCategory, setPostCategory] = useState<IDish[]>([]);
  const [swiggySelectedKitchenId, setSwiggySelectedKitchenId] =
    useState<string>("");
  const [swiggyDishName, setSwiggyDishName] = useState<string>("");
  const [swiggyDishPrice, setSwiggyDishPrice] = useState<string>("");
  const [swiggyPortions, setSwiggyPortions] = useState<IPortion[]>([]);
  const [swiggyCategoryPopup, setSwiggyCategoryPopup] = useState(false);
  const [swiggyAddOnPopUp, setSwiggyAddOnPopUp] = useState(false);
  const [swiggyPostAddOns, setSwiggyPostAddOns] = useState<IDish[]>([]);
  const [swiggyAvailability, setSwiggyAvailability] = useState(true);
  const [swiggyVisibility, setSwiggyVisibility] = useState(true);
  const [swiggyPostCategory, setSwiggyPostCategory] = useState<IDish[]>([]);
  const [zomatoSelectedKitchenId, setZomatoSelectedKitchenId] =
    useState<string>("");
  const [zomatoDishName, setZomatoDishName] = useState<string>("");
  const [zomatoDishPrice, setZomatoDishPrice] = useState<string>("");
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
  const [croppingImage, setCroppingImage] = useState("");
  const [croppingImageIndex, setCroppingImageIndex] = useState<number | null>(
    null
  );

  const testData = {
    businessId: businessId,
    name: "",
    price: null,
    tax: 0,
    visibility: visibility,
    discount: 0,
    avgTime: "",
    dishType: "",
    categories: [],
    portions: [],
    extras: addOns,
    kitchenId: selectedKitchenId,
    filters: {
      dishes: [],
      metaTags:dishTags,
    },
    images: [""],
    description: "",
    links: [],
    delayTime: "",
    availability: availability,
    version: 0,
  };

  const [data, setData] = useState<Dish>(testData);
  const [dishData, setDishData] = useState<Dish>(testData);

  const getKitchenData = async () => {
    try {
      const kitchens = await axios.get(paths.getAllKitchens(businessId));
      const data: IData | any = {
        kitchens: kitchens?.data,
      };
      await getRecommendedDishes();
      setData(data);
      if (kitchens.data && kitchens?.data?.length === 0) {
        toast.error("Please Create a kitchen first");
        setSelectedIcon("Kitchen");
        return router.push(`/business/${businessId}?tab=Kitchen`);
      }
      setSelectedKitchenId(kitchens?.data[0]?._id);
      setSwiggySelectedKitchenId(kitchens?.data[0]?._id);
      setZomatoSelectedKitchenId(kitchens?.data[0]?._id);
      return data;
    } catch (err) { }
  };

  async function getCategoryDishesApi() {
    try {
      const category = await axios.get(
        `/v1/categories?businessId=${businessId}&queryCategories=true`
      );
      setData((prev) => {
        return { ...prev, categories: category?.data };
      });
    } catch (err) { }
  }
  async function getRecommendedDishes() {
    try {
      const dishes = await axios.get(
        `/v1/dishes?businessId=${businessId}&queryDish=true`
      );
      setRecommendedDishes(dishes?.data);
      setData((prev) => {
        return { ...prev, dishes: dishes?.data };
      });
    } catch (e) {
      console.log(e);
    }
  }
  async function getExtras() {
    try {
      const addOns = await axios.get(paths.getExtraApi(businessId));
      setData((prev) => {
        return { ...prev, extras: addOns?.data };
      });
    } catch (err) { }
  }

  const {
    isLoading,
    error,
    data: allData,
    refetch,
  } = useQuery({
    queryKey: ["getKitchenData", businessId],
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

  const handleTagsClick = async (tag:string) => {
    if (dishTags.includes(tag)) {
      setDishTags(dishTags.filter((keyword) => keyword !== tag));
    } else {
      setDishTags([...dishTags, tag]);
    }
  };

  const dishValidations = async () => {
    const isDishValid =
      dishData?.name !== "" &&
      dishData?.price !== null &&
      dishData?.price !== undefined &&
      dishData?.price !== 0 &&
      selectedKitchenId !== "" &&
      dishData?.dishType !==
      "select a dish type".replace(/[^a-zA-Z ]/, "").toLowerCase() &&
      dishData?.dishType !== "";
    // Check portions validity (return true if portions array is empty)
    if (!isDishValid) {
      toast.error("Please fill the name, price and dish type");
      return false;
    }
    const isNameDuplicate = recommendedDishes?.some((everyDish) => {
      const isDuplicate =
        everyDish?.name?.toLowerCase() === dishData?.name?.toLowerCase();
      return isDuplicate;
    });
    if (isNameDuplicate) {
      toast.error("Dish name already exists.");
      return false;
    }

    let allPortionsValid = true;
    if (isDishValid && portions?.length > 0) {
      allPortionsValid = validPortionCheck(portions);
      if (!allPortionsValid) {
        toast.error("Please check the portion details");
        return false;
      }
    }

    // Check Swiggy validity
    let isSwiggyValid = true;
    let allSwiggyPortionsValid = true;
    let isZomatoValid = true;
    let allZomatoPortionsValid = true;
    isSwiggyValid = swiggyDishPrice !== "";
    if (!isSwiggyValid && toggleSwiggySwitch) {
      toast.error("Please check the swiggy price");
      return false;
    }
    if (toggleSwiggySwitch && swiggyPortions?.length > 0) {
      allSwiggyPortionsValid = validPortionCheck(swiggyPortions);
      if (!allSwiggyPortionsValid) {
        toast.error("Please check the swiggy portions");
        return false;
      }
    }
    isZomatoValid = zomatoDishPrice !== "";
    if (!isZomatoValid && toggleZomatoSwitch) {
      toast.error("Please check the zomato price");
      return false;
    }
    if (toggleZomatoSwitch && zomatoPortions?.length > 0) {
      allZomatoPortionsValid = validPortionCheck(zomatoPortions);
      if (!allZomatoPortionsValid) {
        toast.error("Please check the zomato portions");
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
    const postAddOnsIds = postAddOns.map(item => item._id);
    const postCategoryIds = postCategory.map(item => item._id);
    const postRecommendIds = postRecommend.map(item => item._id);
    try {
      const config = {
        mode: "cors",
        method: "POST",
        url: paths.postDishData(),
        headers: {
          "Content-Type": "application/json",
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
            metaTags:dishTags,
          },
          kitchenId: selectedKitchenId,
          description: description,
          images: imageUrls,
        },
      };
      const response = await axios(config);
      if (response?.status === 201 || response?.status === 200) {
        toast.success("dish created successfully");
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
    setPortions([...portions, { name: "", price: "", portionType: "" }]);
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
  const handleImageChange = async (
    event: React.ChangeEvent<HTMLInputElement>,
    index: number
  ) => {
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
        if (typeof croppedDataUrl === "string") {
          const blob = await (await fetch(croppedDataUrl)).blob();
          const originalFile = imageFiles[croppingImageIndex];
          const croppedFile = new File([blob], originalFile.name, {
            type: originalFile.type,
          });

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
      })
    );
    return imageUrls;
  };

  const addNewImageField = () => {
    setDisplayImages((prev) => [...prev, ""]);
  };

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
    setPostRecommend((prev: any) =>
      prev.filter((pre: any, index: number) => index !== indexToRemove)
    );
  }
  function removeCategoryCharges(indexToRemove: number) {
    setPostCategory((prev: any) =>
      prev.filter((pre: any, index: number) => index !== indexToRemove)
    );
  }
  function removeAddons(indexToRemove: number) {
    setPostAddOns((prev: any) =>
      prev.filter((pre: any, index: number) => index !== indexToRemove)
    );
  }
  function handleNameDish(e: React.ChangeEvent<HTMLInputElement>) {
    setDishData((prevZone) => {
      return {
        ...prevZone,
        name: e.target.value
          .replace(/^\s+/, "") // Remove leading spaces
          .replace(/\s{3,}/g, " ") // Replace consecutive spaces with a single space
          .replace(/[^\w\s]/g, ""), // Remove special characters except spaces
      };
    });
  }

  function handleDishType(e: React.ChangeEvent<HTMLSelectElement>) {
    setDishData((prevZone) => {
      return {
        ...prevZone,
        dishType: e.target.value.replace(/[^a-zA-Z ]/, "").toLowerCase(),
      };
    });
  }
  function handleDishPrice(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.value.replace(/[^0-9]/g, "");
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
        .replace(/^\s+/, "")
        .replace(/\s{3,}/g, " ")
        .replace(/[^\w\s.,]/g, "")
    );
  };

  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorComponent refetch={refetch} />;

  return (
    <>
      <div className="pb-12">
        <div className="bg-[#f5f5f5] sticky z-20 top-0">
          <Header
            title="Dish"
            onBack={() => router.push(`/business/${businessId}?tab=items`)}
            leftIcon={<BsChevronLeft />}
            centerImage={Hi}
            rightImage={Hi}
            isIconBusinessShow={false}
          />

          <div className="flex justify-between items-center mt-6 px-6 pb-4 border-b border-[#cacaca]">
            <div className="flex text-2xl">
              <span>Add a Dish</span>
            </div>
          </div>
        </div>
        <div>
          <div className="mt-4 ml-6 font-medium">
            Name of the Dish <span className="text-red-500">*</span>
          </div>
          <div className="relative w-full px-6 mt-4">
            <input
              type="text"
              onChange={(e) => handleNameDish(e)}
              value={dishData?.name}
              id="floating_outlined"
              className="block w-full pt-1 pb-2 pl-2 pr-[7rem] mb-0 ml-0 mr-0 text-base text-gray-900 bg-transparent border-gray-800 rounded-md border dark:text-white focus:outline-none focus:ring-0 focus:border-[#2B354D] dark:border-[#2B354D] peer"
              placeholder="Name"
              maxLength={50}
              required
            />
          </div>
          <div className="mt-4 ml-6 font-medium">
            Dish Type <span className="text-red-500">*</span>
          </div>
          <div className="relative w-full px-6 mt-4">
            <select
              key={dishData?.dishType}
              onChange={(e) => handleDishType(e)}
              value={dishData?.dishType
                ?.replace(/[^a-zA-Z ]/, "")
                .toLowerCase()}
              className="w-full p-2 border rounded-md"
            >
              {dishTypes?.map((dish: any) => (
                <option
                  className="!bg-white !text-[#2B354D]"
                  key={dish?._id}
                  value={dish?.type?.replace(/[^a-zA-Z ]/, "").toLowerCase()}
                >
                  {dish?.type}
                </option>
              ))}
            </select>
          </div>
          <div className="mx-6 my-6 border border-[#cacaca] px-4 pb-4 pt-2 rounded-md">
            <div className="mt-2 space-y-4">
              <div>
                <label
                  className="block mb-2 font-medium text-[#2B354D]"
                  htmlFor="dishPrice"
                >
                  Dish Price <span className="text-red-500">*</span>
                </label>
                <input
                  onChange={handleDishPrice}
                  value={dishData?.price}
                  id="dishPrice"
                  type="text"
                  placeholder="Price"
                  className="w-full p-2 border rounded-md"
                  maxLength={4}
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
                  {kitchen?.map((kitchen: IKitchen) => (
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
                    <button
                      type="button"
                      className="px-4 py-1 border rounded-md on_active_bounce border-1"
                    >
                      Add
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 md:gap-2 lg:grid-cols-4">
                  {postCategory?.map((category: ICategory, index: number) => {
                    return (
                      <div
                        key={category?._id}
                        className="flex flex-col p-3 my-2 border rounded-md border-1"
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
                    className="px-4 py-1 border rounded-md on_active_bounce border-1"
                  >
                    Add
                  </button>
                </div>
                {portions?.map((portion, index) => (
                  <div
                    key={portion?._id}
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
                        value={portion.name}
                        maxLength={50}
                        onChange={(e) => {
                          const newPortions = [...portions];
                          newPortions[index].name = e.target.value
                            ?.replace(/^\s+/, "")
                            .replace(/\s{3,}/g, " ")
                            .replace(/[^\w\s]/g, "");
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
                        value={portion.price}
                        maxLength={4}
                        onChange={(e) => {
                          const newPortions = [...portions];
                          const value = e.target.value.replace(/[^0-9]/g, "");
                          newPortions[index].price = value;
                          setPortions(newPortions);
                        }}
                        className="w-full p-2 border rounded-md"
                      />
                      <label>Type</label>
                      <select
                        onChange={(e) => {
                          const newPortions = [...portions];
                          newPortions[index].portionType = e.target.value
                            ?.replace(/[^a-zA-Z ]/, "")
                            .toLowerCase();
                          setPortions(newPortions);
                        }}
                        value={[...portions][index].portionType}
                        className="w-full p-2 border rounded-md"
                      >
                        {dishTypes?.map((dish: any) => (
                          <option
                            className="!bg-white !text-[#2B354D]"
                            key={dish?._id}
                            value={dish?.type
                              ?.replace(/[^a-zA-Z ]/, "")
                              .toLowerCase()}
                          >
                            {dish?.type}
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
                <button
                  type="button"
                  className="px-4 py-1 border rounded-md on_active_bounce border-1 "
                >
                  Add
                </button>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 md:gap-2 lg:grid-cols-4">
              {postAddOns?.map((addon: any, index: number) => {
                return (
                  <div
                    key={index.toString()}
                    className="flex flex-col p-3 my-2 border rounded-md border-1"
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
          </div>
          {/* <div
            className={`${
              toggleSwiggySwitch ? "" : "opacity-50"
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
          </div> */}
          {/* <div
            className={`${
              toggleZomatoSwitch ? "" : "opacity-50"
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
          <div className="mx-6 mt-6 border border-[#cacaca] px-4 pb-4 pt-2 rounded-md">
            <div className="relative flex justify-between w-full mt-4">
              <h1 className="text-xl">Display</h1>
              <div onClick={addNewImageField}>
                <button
                  type="button"
                  className="px-4 py-1 border rounded-md on_active_bounce border-1 "
                >
                  Add
                </button>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 md:gap-2 lg:grid-cols-4">
              {displayImages?.map((image, index) => (
                <div key={index.toString()} className="flex mt-2">
                  {image ? (
                    <div className="relative aspect-square">
                      <div>
                        <Image
                          src={image}
                          alt={`image-${index}`}
                          width={250}
                          height={250}
                          className="h-[250px] w-[250px] border border-[#cacaca] rounded-md object-contain"
                        />
                      </div>
                      <div>
                        <button
                          type="button"
                          onClick={() => handleRemoveImageUrl(index)}
                          className="absolute top-2 right-2 bg-[#cacaca] text-black p-1 rounded-full"
                        >
                          <HiX className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="relative aspect-square">
                      <div
                        className="w-[140px] h-[120px] flex justify-center items-center border border-[#cacaca] rounded-md p-6"
                        onClick={() => fileInputRefs.current[index].click()}
                      >
                        <span className="text-2xl">+</span>
                      </div>
                      <div>
                        <button
                          type="button"
                          onClick={() => handleRemoveImageUrl(index)}
                          className="absolute top-2 right-2 bg-[#cacaca] text-black p-1 rounded-full"
                        >
                          <HiX className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )}
                  <input
                    type="file"
                    ref={(el) => (fileInputRefs.current[index] = el)}
                    style={{ display: "none" }}
                    accept=".png, .jpeg, .jpg, .webp"
                    onChange={(e) => handleImageChange(e, index)}
                  />
                  <div className="mx-2 font-normal text-sm text-[#2B354D] opacity-70">
                    {(index === 0 || "0") && <p>Cover Image</p>}
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
                className="w-full h-24 p-2 mt-2 border rounded-md"
                placeholder="write about the dish...."
                onChange={addDescription}
              />
            </div>
          </div>
          <div className="mx-6 mt-6 border border-[#cacaca] px-4 pb-4 pt-2 rounded-md">
            <h1 className="text-2xl border-b pb-2 border-[#cacaca]">
              Recommendation
            </h1>
            <div className="flex flex-col mt-4">
              <div className="flex flex-row justify-between">
                <h1>Recommended dishes</h1>
                <div>
                  <button
                    type="button"
                    onClick={addRecommend}
                    className="px-4 py-1  text-[#2B354D] border border-1 rounded-md on_active_bounce"
                  >
                    Add
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 md:gap-2 lg:grid-cols-4">
                {postRecommend?.map((dishes: IDish, index: number) => {
                  return (
                    <div
                      key={dishes?._id}
                      className="flex flex-col p-3 my-2 border rounded-md md:my-0 border-1"
                    >
                      <div className="flex items-center">
                        <MdDinnerDining />
                        <h1 className="mx-2 capitalize">{dishes?.name}</h1>
                      </div>
                      <div className="flex self-end mt-4">
                        <button
                          type="button"
                          onClick={() => removeRecommendDish(index)}
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
          </div>
          <div className="mx-6 mt-6 border border-[#cacaca] px-4 pb-4 pt-2 rounded-md">
            <h1>Tags:</h1>
            <section className="overflow-x-auto flex flex-wrap gap-4 my-2 mt-4">
              {tags.map((tag) => {
                return (
                  <div
                    onClick={()=>handleTagsClick(tag?.text)}
                    key={tag?.text}
                    className={`${dishTags.includes(tag?.text)
                        ? "bg-primary/50 text-base-100 font-medium"
                        : "text-primary bg-base-200"
                      } flex inline-block truncate overflow-hidden px-5 py-1 justify-center items-center border bg-base-100/50 border-[#cacaca] rounded-full`}
                  >
                    <Image src={tag?.image} alt="tags" width={20} height={20} />{" "}
                    &nbsp;
                    <span>{tag?.text}</span>
                  </div>
                );
              })}
            </section>
          </div>
        </div>
      </div>
      <div className="sticky mx-6 my-6 bottom-5">
        <button
          type="button"
          disabled={isSubmitting}
          onClick={postAddDish}
          className={`${loading ? "pointer-events-none opacity-50" : ""
            } on_active_bounce text-white rounded-md bg-[#2B354D] py-2.5 w-full`}
        >
          {loading ? "Loading..." : "Create"}
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
        <AddExtras
          handleData={handleAddOns}
          Data={addOns}
          selectedData={postAddOns}
          closeAddOnPopUp={closeAddOnPopUp}
        />
      </PopUp>
      <PopUp show={showCropper} onClose={handleClose}>
        <div>
          <div>
            <ReactCropper
              image={croppingImage}
              ref={cropperRef}
              width={250}
              height={250}
            />
          </div>
          <div className="flex py-2 bg-white">
            <button
              type="button"
              className="fixed bottom-5 on_active_bounce mx-4 text-white rounded-md bg-[#2B354D] py-2.5 w-[25rem]"
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

export default memo(AddDish);
