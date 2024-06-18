import Hi from '@/assets/svg/hi.svg';
import axios from '@/axios';
import DishComponent from '@/components/atom/dish';
import LoadingSpinner from '@/components/atom/loadingSpinner';
import PopUp from '@/components/atom/popUp';
import ReactCropper, { cropImage } from '@/components/atom/reactCropper';
import ErrorComponent from '@/components/errorComponent';
import Header from '@/components/molecules/header';
import HierarchyComponent from '@/components/molecules/hierarchy';
import { useDishSelectionStore, type Hierarchy } from '@/components/store/useDishStore';
import { useSelectedButtonStore } from '@/components/store/useSelectBtn';
import type { Dish, ICategory } from '@/components/types/businessData';
import { storeImageAfterSave } from '@/components/utils/helper';
import { useQuery } from '@tanstack/react-query';
import type React from 'react';
import { memo, startTransition, useRef, useState } from 'react';
import { FaArrowLeft } from 'react-icons/fa';
import { HiX } from 'react-icons/hi';
import { MdDinnerDining } from 'react-icons/md';
import { useNavigate, useParams } from 'react-router-dom';
import Switch from 'react-switch';
import { toast } from 'react-toastify';

interface IData {
  dishes: Dish[];
  category: ICategory;
  allCategories: ICategory[];
}

const EditCategory: React.FC = memo(() => {
  const navigate = useNavigate();
  const { businessId, categoryId } = useParams<{
    businessId: string;
    categoryId: string;
  }>();
  const [data, setData] = useState<IData | null>(null);

  const setSelectedButton = useSelectedButtonStore((s) => s.setSelectedButton);
  const [isHierarchyModalOpen, setIsHierarchyModalOpen] = useState(false);
  const [isDishModalOpen, setIsDishModalOpen] = useState(false);
  const [imageFile, setImageFiles] = useState<File | null>(null);
  const [showCropper, setShowCropper] = useState(false);
  const [croppingImage, setCroppingImage] = useState<string | null>(null);
  const cropperRef = useRef(null);
  let { parentCategory, parentCategoryId } = useDishSelectionStore();
  const [loading, setLoading] = useState(false);
  const {
    selectedDishes,
    hierarchy,
    addDish,
    removeDish,
    visibility,
    availability,
    setVisibility,
    setAvailability,
    categoryName,
    setCategoryName,
    setHierarchy,
    setSelectedDishes,
    imageUrl,
    setImageUrl,
    setParentCategory,
    setParentCategoryId,
  } = useDishSelectionStore();

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

      setImageFiles(file);
    }
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
              setImageFiles(croppedFile);
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

  const toggleDishSelection = (dish: Dish) => {
    if (selectedDishes.some((selectedDish) => selectedDish._id === dish._id)) {
      removeDish(dish._id);
    } else {
      addDish(dish);
    }
  };
  const resetAndCloseDishModal = () => {
    if (data) {
      useDishSelectionStore.setState({
        selectedDishes: [...data.category.dishes],
      });
      setIsDishModalOpen(false);
    }
  };
  const handleToggleAvailability = () => setAvailability(!availability);
  const handleToggleVisibility = () => setVisibility(!visibility);

  const handleSave = async () => {
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

    let coverImage: string = imageUrl ?? '';
    if (imageFile) {
      const uploadedImageUrl = await storeImageAfterSave(imageFile);
      coverImage = uploadedImageUrl ?? '';
    }
    setLoading(true);

    const payload = {
      businessId: businessId,
      name: categoryName,
      visibility: visibility,
      timerOn: false,
      timerStart: null,
      timerEnd: null,
      availableDays: [],
      hierarchy: hierarchy,
      parentCategory: parentCategory,
      parentCategoryId: parentCategoryId,
      coverImage: coverImage,
      links: [],
      dishes: selectedDishes,
      availability: availability,
      charges: [],
    };

    try {
      await axios.put(`/v1/categories/${data?.category?._id}`, payload);
      toast.success('Category updated successfully');
      startTransition(() => {
        navigate(`/app/business/${businessId}/items?tab=items`);
      });
    } catch (error) {
      console.error('Error updating category:', error);
    }
    setLoading(false);
  };
  const deleteCategory = async () => {
    setLoading(true);
    try {
      const config = {
        method: 'DELETE',
        url: `/v1/categories/${data?.category?._id}`,
      };
      await axios(config);
      toast.success('Category deleted successfully');
      setSelectedButton('Categories');
      startTransition(() => {
        navigate(`/app/business/${businessId}?tab=items`);
      });
    } catch (error) {
      console.error('Error deleting category:', error);
    }
    setLoading(false);
  };

  const editCategory = async () => {
    try {
      const category = await axios.get<ICategory>(`/v1/categories/${categoryId}`);
      const allCategories = await axios.get(`/v1/categories?businessId=${businessId}&queryCategories=true`);
      const dishes = await axios.get(`/v1/dishes?businessId=${businessId}&queryDish=true`);

      const data = {
        dishes: dishes?.data,
        category: category.data,
        allCategories: allCategories.data,
      };
      setData(data);
      setSelectedDishes(data.category.dishes);
      setCategoryName(data.category.name);
      setHierarchy(data.category.hierarchy as Hierarchy);
      setImageUrl(data.category.coverImage);
      setVisibility(data.category.visibility);
      setAvailability(data.category.availability);
      if (data?.category?.hierarchy === 'CHILD') {
        setParentCategoryId(data.category.parentCategoryId);
        setParentCategory(data.category.parentCategory);
      }

      return data;
    } catch (error) {
      console.error('Error fetching dishes:', error);
    }
  };

  const {
    isLoading,
    error,
    data: ediCatData,
    refetch,
  } = useQuery({
    queryKey: ['editCategory', businessId, categoryId],
    queryFn: editCategory,
    enabled: !!categoryId && !!businessId,
  });

  const handleBack = () => {
    startTransition(() => {
      navigate(`/app/business/${businessId}/items?tab=items`);
    });
  };

  if (error) return <ErrorComponent refetch={refetch} />;

  return (
    <div className="pb-[7rem]">
      {' '}
      <div className="sticky top-0 z-20 linear_gradient_background">
        <Header title="Category" onBack={handleBack} leftIcon={<FaArrowLeft />} centerImage={Hi} rightImage={Hi} isIconBusinessShow={false} />
        <div className="mt-6 flex items-center justify-between  px-6 pb-4">
          <div className="flex text-2xl">
            <span className="">Edit a Category</span>
          </div>
        </div>
      </div>
      <div className="ml-6 mt-4 text-xl font-medium capitalize">{data?.category?.name}</div>
      <div className="relative mt-4 w-full px-6">
        <input
          onChange={(e) => {
            setCategoryName(e.target.value);
          }}
          type="text"
          maxLength={24}
          value={categoryName || ''}
          id="floating_outlined"
          className="peer mb-0 ml-0 mr-0 block w-full rounded-md border border-gray-800 bg-transparent pb-2 pl-4 pr-[7rem] pt-1 text-base text-gray-900 focus:border-[#000000] focus:outline-none focus:ring-0 dark:border-[#000000] dark:text-white"
          placeholder={categoryName}
          required
        />
      </div>
      <div className=" m-6 rounded-md border border-[#cacaca] p-4">
        <div className="flex items-center justify-between">
          <span>Hierarchy</span>{' '}
          <button
            type="button"
            onClick={() => setIsHierarchyModalOpen(true)}
            className="on_active_bounce rounded-md border border-[#000000] px-3 py-1 text-sm capitalize"
          >
            Edit
          </button>
        </div>
        {hierarchy && (
          <div className="mt-2 rounded-md border border-[#cacaca] px-2 py-1 text-sm">
            {hierarchy === 'CHILD' ? (
              <>
                <strong>{hierarchy.toLowerCase()}</strong> is a child category of <strong>{parentCategory}</strong>
              </>
            ) : (
              <>
                <strong>{categoryName}</strong> is a <strong>{hierarchy.toLowerCase()}</strong> category
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
      <div className="mx-6 my-6 rounded-md border border-[#cacaca] px-4 pb-4 pt-2">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl">Dishes</h1>
          <button
            type="button"
            onClick={() => setIsDishModalOpen(true)}
            className="on_active_bounce rounded-md border border-[#000000] px-3 py-1 text-sm capitalize"
          >
            Edit
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
          {selectedDishes?.map((dish) => (
            <div key={dish?._id} className="relative flex items-center rounded-md border border-[#cacaca]">
              <div className="ml-2 mt-2 flex items-center rounded-md pb-8">
                <MdDinnerDining className="mr-2" />
                {dish?.name}
              </div>
              <button
                type="button"
                className="on_active_bounce absolute bottom-2 right-4 rounded-md text-blue-500"
                onClick={() => removeDish(dish?._id)}
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
            {' '}
            <img src={imageUrl} alt="Selected" className="rounded-xl object-cover" loading="lazy" />
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
      <div className="fixed bottom-6 flex w-full items-center justify-between px-6">
        <button
          type="button"
          onClick={deleteCategory}
          className={`${loading ? 'pointer-events-none opacity-50' : ''} on_active_bounce w-[40%] rounded-md border border-[#000000] bg-white py-[0.4125rem] capitalize text-[#000000]`}
        >
          {loading ? 'Loading....' : 'Delete'}
        </button>
        <button
          type="button"
          onClick={handleSave}
          className={`${loading ? 'pointer-events-none opacity-50' : ''} on_active_bounce w-[55%] rounded-md bg-[#000000] py-2 capitalize text-white`}
        >
          {loading ? 'Loading....' : 'Save'}
        </button>
      </div>
      {(loading || isLoading) && <LoadingSpinner />}
      <PopUp show={showCropper} onClose={() => setShowCropper(false)}>
        <div>
          <ReactCropper image={croppingImage} ref={cropperRef} width={250} height={250} />
          <div className="flex bg-white py-2">
            <button
              type="button"
              className="on_active_bounce fixed bottom-5 mx-4 w-[25rem] rounded-md bg-[#000000] py-2.5 text-white"
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

export default EditCategory;
