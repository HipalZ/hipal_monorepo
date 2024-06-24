import axios from '@/axios';
import { useDishSelectionStore } from '@/components/store/useDishStore';
import { useSelectedButtonStore } from '@/components/store/useSelectBtn';
import { useSettingsData } from '@/components/store/useSettingsData';
import type { ICategory } from '@/components/types/businessData';
import { PAGE_TYPES, routePathsWithId, routePathsWithIds } from '@/components/utils/routes';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/router';
import { memo, useEffect, useMemo, useState } from 'react';
import { toast } from 'react-toastify';

const CategoriesContent = ({ categories, hide, searchText }: { categories: ICategory[]; hide: boolean; searchText: string }) => {
  const router = useRouter();
  const { businessId } = router.query as { businessId: string };
  const { resetStore } = useDishSelectionStore();
  const selectedButton = useSelectedButtonStore();
  const settings = useSettingsData((s) => s.settingsData);
  const setSettings = useSettingsData((s) => s.setSettingsData);
  const [categoryOrder, setCategoryOrder] = useState<string[]>([]);

  const handleAddCategoryClick = () => {
    resetStore();
    router.push(routePathsWithId[PAGE_TYPES.CREATE](businessId));
  };

  const [categoryIDs, setCategoryIDs] = useState<string[]>([]);
  const [isEditingSequence, setIsEditingSequence] = useState<boolean>(false);
  const [draggedItemId, setDraggedItemId] = useState<string | null>(null);
  const [draggedParentId, setDraggedParentId] = useState<string | null>(null);

  useEffect(() => {
    const ids = categories.map((category) => category._id);
    setCategoryIDs(ids);
  }, [categories]);

  useEffect(() => {
    router.query.tab = 'Categories';
    router.push(router);
  }, []);

  const organizeCategories = (categories) => {
    const obj = {};

    // Use categoryOrder to organize categories
    const orderedCategories = categoryOrder.length ? categoryOrder : categoryIDs;

    for (let index = 0; index < orderedCategories?.length; index++) {
      const categoryId = orderedCategories[index];
      const category = categories.find((cat) => cat._id === categoryId);
      if (category?.hierarchy === 'PARENT') {
        if (!obj[category._id]) {
          obj[category._id] = {
            parentName: category.name,
            _id: category._id,
            child: [],
          };
        }
      }
      if (category?.hierarchy === 'CHILD') {
        if (obj[category.parentCategoryId]) {
          obj[category.parentCategoryId].child.push({
            name: category.name,
            _id: category._id,
          });
        }
      }
    }

    for (let index = 0; index < categories?.length; index++) {
      const category = categories[index];
      if (orderedCategories.includes(category._id)) {
        continue;
      }
      if (category?.hierarchy === 'PARENT') {
        if (!obj[category._id]) {
          obj[category._id] = {
            parentName: category.name,
            _id: category._id,
            child: [],
          };
        }
      }
      if (category?.hierarchy === 'CHILD') {
        if (obj[category.parentCategoryId]) {
          obj[category.parentCategoryId].child.push({
            name: category.name,
            _id: category._id,
          });
        }
      }
    }
    return obj;
  };

  const organizedCategories = useMemo(() => {
    return organizeCategories(categories);
  }, [categories, categoryOrder]);

  const editCategory = (create: string) => {
    router.push(routePathsWithIds[PAGE_TYPES.EDIT_CATEGORY](businessId, create));
  };
  const filterCategory = useMemo(
    () =>
      categories?.filter((obj) => {
        if (obj?.name?.toLowerCase()?.includes(searchText?.toLowerCase())) {
          return obj;
        }
      }),
    [categories, searchText],
  );

  const handleDragStart = (id: string, parentId: string | null = null) => {
    setDraggedItemId(id);
    setDraggedParentId(parentId);
  };

  const handleDragOver = (event) => {
    event.preventDefault();
  };

  const handleDrop = (targetId: string, targetParentId: string | null = null) => {
    if (draggedItemId) {
      // Check if dragging parent and dropping on child, prevent this action
      if ((draggedParentId === null && targetParentId !== null) || (draggedParentId !== null && targetParentId === null)) {
        return;
      }

      if (draggedParentId && targetParentId && draggedParentId !== targetParentId) {
        return;
      }

      setCategoryOrder((prevCategoryOrder) => {
        // Ensure all categories, including new ones, are present in the categoryOrder
        let updatedCategories = [...prevCategoryOrder];
        const allCategoryIds = categories.map((cat) => cat._id);

        allCategoryIds.forEach((id) => {
          if (!updatedCategories.includes(id)) {
            updatedCategories.push(id);
          }
        });

        const draggedIndex = updatedCategories.indexOf(draggedItemId);
        const targetIndex = updatedCategories.indexOf(targetId);

        if (draggedIndex !== -1 && targetIndex !== -1) {
          if (draggedParentId && targetParentId && draggedParentId === targetParentId) {
            // Handle reordering within the same parent category
            const parentCategory = categories.find((cat) => cat._id === draggedParentId);
            if (parentCategory) {
              const parentChildIds = updatedCategories.filter((id) => {
                const cat = categories.find((cat) => cat._id === id);
                return cat && cat.parentCategoryId === draggedParentId;
              });
              const start = updatedCategories.indexOf(parentChildIds[0]);
              const end = updatedCategories.indexOf(parentChildIds[parentChildIds.length - 1]);
              const [removed] = updatedCategories.splice(draggedIndex, 1);
              updatedCategories.splice(Math.min(targetIndex, end), 0, removed);
            }
          } else if (draggedParentId === null && targetParentId === null) {
            // Handle reordering among parent categories
            const [removed] = updatedCategories.splice(draggedIndex, 1);
            updatedCategories.splice(targetIndex, 0, removed);
          }
        }
        return updatedCategories;
      });

      setDraggedItemId(null);
      setDraggedParentId(null);
    }
  };

  const handleDragEnd = () => {
    setDraggedItemId(null);
    setDraggedParentId(null);
  };

  const handleCategoryOrder = async (settingID: string) => {
    try {
      const config = {
        method: 'PUT',
        url: `/v1/settings/${settingID}`,
        data: {
          businessId: businessId,
          categoryOrder: categoryOrder,
        },
      };
      const response = await axios(config);
      if (response.status === 200) {
        toast.success('Order Changed Successfully');
      }
    } catch (err) {
      console.log(err);
    }
  };

  const settingsData = async () => {
    try {
      const response = await axios.get(`/v1/settings?businessId=${businessId}`);
      setSettings(response.data);
      setCategoryOrder(response?.data[0]?.categoryOrder || []);
      return response.data[0]._id || '';
    } catch (err) {
      console.log(err);
    }
  };

  const saveCategoryOrder = async () => {
    setIsEditingSequence(false);
    await handleCategoryOrder(settings[0]?._id);
  };

  const {
    isLoading,
    error,
    data: catOrderedData,
  } = useQuery({
    queryKey: ['settings', businessId],
    queryFn: settingsData,
    enabled: !!businessId,
  });

  return (
    <div className="pb-[5rem]">
      <div className="masonry-layout mt-6 px-6 pb-[5rem]">
        {searchText === '' ? (
          Object.values(organizedCategories).length > 0 ? (
            Object.values(organizedCategories).map((parent, index) => (
              <div
                key={index.toString()}
                className="masonry-item rounded-md border border-[#000] p-4"
                draggable={isEditingSequence}
                onDragStart={
                  isEditingSequence
                    ? (e) => {
                        e.stopPropagation();
                        handleDragStart(parent._id, null);
                      }
                    : undefined
                }
                onDragOver={isEditingSequence ? handleDragOver : undefined}
                onDrop={
                  isEditingSequence
                    ? (e) => {
                        e.stopPropagation();
                        handleDrop(parent._id, null);
                      }
                    : undefined
                }
                onDragEnd={isEditingSequence ? handleDragEnd : undefined}
                data-id={parent._id}
              >
                <div className={`${parent?.child.length > 0 ? 'flex items-center justify-between pb-4' : 'flex items-center justify-between'}`}>
                  <div className="font-medium">
                    {index + 1}&#41;&nbsp;{parent?.parentName}
                  </div>
                  <div onClick={() => editCategory(parent?._id)} className="cursor-pointer text-sm text-[#2F80ED]">
                    View
                  </div>
                </div>
                {parent?.child.map((child) => (
                  <div
                    key={child._id}
                    className="rounded-md p-2"
                    draggable={isEditingSequence}
                    onDragStart={
                      isEditingSequence
                        ? (e) => {
                            e.stopPropagation();
                            handleDragStart(child._id, parent._id);
                          }
                        : undefined
                    }
                    onDragOver={isEditingSequence ? handleDragOver : undefined}
                    onDrop={
                      isEditingSequence
                        ? (e) => {
                            e.stopPropagation();
                            handleDrop(child._id, parent._id);
                          }
                        : undefined
                    }
                    onDragEnd={isEditingSequence ? handleDragEnd : undefined}
                    data-id={child._id}
                  >
                    <CategoryCard category={child} onAddCategory={editCategory} />
                  </div>
                ))}
              </div>
            ))
          ) : (
            <div className="fixed left-1/2 top-1/2 flex -translate-x-1/2 transform flex-col text-center">No Categories Found</div>
          )
        ) : filterCategory.length > 0 ? (
          filterCategory.map((parent) => (
            <div key={parent?._id} className="mx-6 rounded-md border border-[#cacaca] p-4">
              <div className="flex items-center justify-between">
                <div className="font-medium">{parent?.name}</div>
                <div onClick={() => editCategory(parent._id)} className="cursor-pointer text-sm text-[#2F80ED]">
                  View
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="fixed left-1/2 top-1/2 flex -translate-x-1/2 transform flex-col text-center">No Categories Found</div>
        )}
      </div>
      {!hide && (
        <div className="flex">
          <div onClick={handleAddCategoryClick} className="fixed bottom-0 w-1/2 cursor-pointer bg-white p-4 outline-none">
            <button className="w-full rounded-md bg-[#2B354D] py-2 text-white">Add Category</button>
          </div>
          <div className="fixed bottom-0 right-0 w-1/2 cursor-pointer bg-white p-4 outline-none">
            {isEditingSequence ? (
              <button className="mt-2 w-full rounded-md bg-[#2B354D] py-2 text-white" onClick={saveCategoryOrder}>
                Save Order
              </button>
            ) : (
              <button className="w-full rounded-md bg-[#2B354D] py-2 text-white" onClick={() => setIsEditingSequence(!isEditingSequence)}>
                Edit Sequence
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const CategoryCard = ({ category, onAddCategory }: { category: ICategory; onAddCategory: (str: string) => void }) => {
  return (
    <div key={category?._id} className="relative rounded-md border border-[#CACACA] p-4">
      <div className="w-72 truncate font-medium opacity-70">{category.name}</div>
      <div onClick={() => onAddCategory(category?._id)} className="absolute bottom-4 right-4 cursor-pointer text-sm text-[#2F80ED]">
        View
      </div>
    </div>
  );
};

export default memo(CategoriesContent);
