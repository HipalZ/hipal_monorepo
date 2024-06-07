import Hi from '@/assets/svg/hi.svg';
import axios from '@/axios';
import DishComponent from '@/components/atom/dish';
import LoadingSpinner from '@/components/atom/loadingSpinner';
import PopUp from '@/components/atom/popUp';
import ReactCropper, { cropImage } from '@/components/atom/reactCropper';
import ErrorComponent from '@/components/errorComponent';
import Header from '@/components/molecules/header';
import HierarchyComponent from '@/components/molecules/hierarchy';
import { useDishSelectionStore } from '@/components/store/useDishStore';
import type { Dish, ICategory } from '@/components/types/businessData';
import { storeImageAfterSave } from '@/components/utils/helper';
import { useQuery } from '@tanstack/react-query';
import type React from 'react';
import { memo, startTransition, useRef, useState } from 'react';
import { BsChevronLeft } from 'react-icons/bs';
import { HiX } from 'react-icons/hi';
import { MdDinnerDining } from 'react-icons/md';
import { useNavigate, useParams } from 'react-router-dom';
import Switch from 'react-switch';
import { toast } from 'react-toastify';

interface IData {
  dishes: Dish[];
  allCategories: ICategory[];
}

const AddCategory: React.FC = memo(() => {
  const navigate = useNavigate();
  const [isHierarchyModalOpen, setIsHierarchyModalOpen] = useState(false);
  const [data, setData] = useState<IData | null>(null);
  const [isDishModalOpen, setIsDishModalOpen] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showCropper, setShowCropper] = useState(false);
  const [croppingImage, setCroppingImage] = useState<string | null>(null);
  const cropperRef = useRef(null);

  let { parentCategory, parentCategoryId } = useDishSelectionStore();
  const { selectedDishes, hierarchy, addDish, removeDish, visibility, availability, setVisibility, setAvailability, categoryName, setCategoryName } =
    useDishSelectionStore();

  const { businessId } = useParams<{
    businessId: string;
  }>();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleClick = () => {
    fileInputRef.current?.click();
  };
  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.readAsDataURL(file);

      reader.onloadend = () => {
        setCroppingImage(reader.result as string);
        setShowCropper(true);
      };

      setImageFile(file);
    }
  };

  const handleToggleAvailability = () => setAvailability(!availability);
  const handleToggleVisibility = () => setVisibility(!visibility);

  const toggleDishSelection = (dish: Dish) => {
    if (selectedDishes.some((selectedDish) => selectedDish.id === dish.id)) {
      removeDish(dish.id);
    } else {
      addDish(dish);
    }
  };
  const resetAndCloseDishModal = () => {
    useDishSelectionStore.setState({ selectedDishes: [] });
    setIsDishModalOpen(false);
  };
  const handleCrop = async () => {
    const cropper = cropperRef?.current;
    if (cropper) {
      const coordinates = cropper?.getCoordinates();
      if (coordinates) {
        try {
          const croppedDataUrl = await cropImage(croppingImage, coordinates);
          if (typeof croppedDataUrl === 'string') {
            const blob = await (await fetch(croppedDataUrl)).blob();
            const croppedFile = new File([blob], imageFile?.name, { type: 'image/png' });

            const reader = new FileReader();
            reader.onloadend = () => {
              setImageUrl(reader.result as string);
              setImageFile(croppedFile);
              setShowCropper(false);
            };
            reader.readAsDataURL(croppedFile);
          }
        } catch (err) {
          console.error(err);
        }
      }
    }
  };

  const createCategory = async () => {
    if (categoryName.trim() === '' || categoryName.length < 2) {
      toast.error('Please enter category name');
      return;
    }
    if (!hierarchy) {
      toast.error('Please select hierarchy');
      setIsHierarchyModalOpen(true);
      return;
    }
    if (hierarchy === 'PARENT') {
      parentCategory = '';
      parentCategoryId = '';
    }
    setLoading(true);
    const url = await storeImageAfterSave(imageFile);
    const payload = {
      businessId: businessId,
      name: categoryName,
      visibility: visibility,
      timerOn: false,
      timerStart: null,
      timerEnd: null,
      availableDays: [],
      hierarchy: hierarchy?.toUpperCase(),
      parentCategory: parentCategory,
      parentCategoryId: parentCategoryId,
      coverImage: url,
      links: [],
      dishes: selectedDishes,
      availability: availability,
      charges: [],
    };

    try {
      await axios.post('/v1/categories', payload);
      toast.success('Category created successfully');
      startTransition(() => {
        navigate(`/app/business/${businessId}/items/?tab=items`);
      });
    } catch (error) {
      console.error('Error creating category:', error);
    }
    setLoading(false);
  };
  const addDishData = async () => {
    try {
      const allCategories = await axios.get(`/v1/categories?businessId=${businessId}&queryCategories=true`);
      const dishes = await axios.get(`/v1/dishes?businessId=${businessId}&queryDish=true`);

      const data = {
        dishes: dishes.data,
        allCategories: allCategories.data,
      };
      setData(data);
      return data;
    } catch (error) {
      console.error('Error fetching dishes:', error);
    }
  };

  const {
    isLoading,
    error,
    data: catDishData,
    refetch,
  } = useQuery({
    queryKey: ['categoryDish', businessId],
    queryFn: addDishData,
    enabled: !!businessId,
  });

  const handleBack = () => {
    startTransition(() => {
      navigate(`/app/business/${businessId}/items?tab=items`);
    });
  };

  if (error) return <ErrorComponent refetch={refetch} />;

  return (
    <div className="pb-[7rem]">
      <div className="sticky top-0 z-20 bg-[#f5f5f5]">
        <Header title="Category" onBack={handleBack} leftIcon={<BsChevronLeft />} centerImage={Hi} rightImage={Hi} isIconBusinessShow={false} />
        <div className="mt-6 flex items-center justify-between border-b border-[#cacaca] px-6 pb-4">
          <div className="flex text-2xl">
            <span className="">Create a Category</span>
          </div>
        </div>
      </div>
      <div className="ml-6 mt-4 font-medium">Category Name</div>
      <div className="relative mt-4 w-full px-6">
        <input
          onChange={(e) => {
            setCategoryName(e.target.value);
          }}
          type="text"
          id="floating_outlined"
          maxLength={24}
          className="peer mb-0 ml-0 mr-0 block w-full rounded-md border border-gray-800 bg-transparent pb-2 pl-4 pr-[7rem] pt-1 text-base text-gray-900 focus:border-[#2B354D] focus:outline-none focus:ring-0 dark:border-[#2B354D] dark:text-white"
          placeholder="Name"
          required
        />
      </div>
      <div className=" m-6 rounded-md border border-[#cacaca] p-4">
        <div className="flex items-center justify-between">
          <span>Hierarchy</span>{' '}
          <button
            type="button"
            onClick={() => setIsHierarchyModalOpen(true)}
            className="on_active_bounce rounded-md border border-[#2B354D] px-3 py-1 text-sm capitalize"
          >
            Edit
          </button>
        </div>
        {hierarchy && (
          <div className="mt-2 rounded-md border border-[#cacaca] px-2 py-1 text-sm">
            {hierarchy === 'PARENT' ? (
              <>
                <strong>{hierarchy?.toLowerCase()}</strong> is a child category of <strong>{parentCategory}</strong>
              </>
            ) : (
              <>
                <strong>{categoryName}</strong> is a <strong>{hierarchy?.toLowerCase()}</strong> category
              </>
            )}
          </div>
        )}
      </div>
      {isHierarchyModalOpen && (
        <PopUp show={isHierarchyModalOpen} onClose={() => setIsHierarchyModalOpen(false)}>
          <HierarchyComponent
            show={() => setIsHierarchyModalOpen(true)}
            closeModal={() => setIsHierarchyModalOpen(false)}
            allCategories={data?.allCategories || []}
          />
        </PopUp>
      )}
      <div className="mx-6 my-6 rounded-md border border-[#cacaca] px-4 pt-2">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl">Dishes</h1>
          <button
            type="button"
            onClick={() => setIsDishModalOpen(true)}
            className="on_active_bounce rounded-md border border-[#2B354D] px-3 py-1 text-sm capitalize"
          >
            Add
          </button>
        </div>
        {isDishModalOpen && (
          <PopUp show={isDishModalOpen} onClose={() => setIsDishModalOpen(false)}>
            <DishComponent
              dishes={data?.dishes || []}
              selectedDishes={selectedDishes}
              toggleDishSelection={toggleDishSelection}
              onClose={() => setIsDishModalOpen(false)}
              resetAndCloseDishModal={resetAndCloseDishModal}
            />
          </PopUp>
        )}
        <div className="grid-col-1 mt-4 grid gap-4 pb-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {selectedDishes.map((dish) => (
            <div key={dish?.id} className="relative flex items-center rounded-md border border-[#cacaca]">
              <div className="ml-2 mt-2 flex items-center rounded-md pb-8">
                <MdDinnerDining className="mr-2" />
                {dish?.name}
              </div>
              <button
                type="button"
                className="on_active_bounce absolute bottom-2 right-4 rounded-md text-blue-500"
                onClick={() => removeDish(dish?.id)}
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      </div>
      <div className="mx-6 mt-6 rounded-md border border-[#cacaca] px-4 pb-4 pt-2">
        <h1 className="pb-2 text-2xl">Display</h1>
        {imageUrl && (
          <div className="relative aspect-square h-[250px] w-1/2 w-[250px]">
            <img src={imageUrl} alt="category image" className="rounded-xl object-cover" loading="lazy" />
            <button type="button" onClick={() => setImageUrl('')} className="absolute right-2 top-2 rounded-full bg-[#cacaca] p-1 text-black">
              <HiX className="h-4 w-4" />
            </button>
          </div>
        )}
        {!imageUrl && (
          <div className="mt-2 space-y-4 pb-4">
            <div className="mt-4 flex w-1/2 items-center justify-center rounded-md border border-[#cacaca] p-8" onClick={handleClick}>
              <span className="text-2xl">+</span>
            </div>
            <input type="file" ref={fileInputRef} style={{ display: 'none' }} accept=".png, .jpeg, .jpg, .webp" onChange={handleImageChange} />
          </div>
        )}
        <div className="mt-2 space-y-4 rounded-md border border-[#cacaca] p-2">
          <div className="flex items-center justify-between">
            <span>Availability off</span>
            <Switch uncheckedIcon={false} checkedIcon={false} onChange={handleToggleAvailability} checked={availability} offColor="#CACACA" />
          </div>
          <div className="flex items-center justify-between">
            <span>Visibility off</span>
            <Switch uncheckedIcon={false} checkedIcon={false} onChange={handleToggleVisibility} checked={visibility} offColor="#CACACA" />
          </div>
        </div>
      </div>
      <div onClick={createCategory} className="fixed bottom-0 flex w-full items-center justify-between bg-white p-4 outline-none">
        <button
          type="button"
          className={`${loading ? 'pointer-events-none' : ''} on_active_bounce w-full rounded-md bg-[#2B354D] py-2 capitalize text-white`}
        >
          {loading ? 'Loading...' : 'Create'}
        </button>
      </div>
      {loading || isLoading ? <LoadingSpinner /> : null}
      <PopUp show={showCropper} onClose={() => setShowCropper(false)}>
        <div>
          <ReactCropper
            image={croppingImage}
            ref={cropperRef}
            width={250}
            height={250}
            className="h-[250px] w-[250px] rounded-md border border-[#cacaca] object-contain"
          />
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
    </div>
  );
});

export default AddCategory;
