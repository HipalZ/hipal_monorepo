import BottomButton from '@/components/atom/bottomButton';
import LoadingSpinner from '@/components/atom/loadingSpinner';
import useBusinessData from '@/components/store/useBusinessData';
import { useCategoryStore } from '@/components/store/useCategoryStore';
import useMenuPageStore from '@/components/store/useMenuStorage';
import { useChildCategories } from '@/hooks/useCategory';
import { apiRpc } from '@hi/common';
import type { CategoryType } from '@hi/db-models/src/validators';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import Fuse from 'fuse.js';
import { memo, useCallback, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { BiSolidEditAlt } from 'react-icons/bi';
import { FaCodeBranch, FaEye, FaEyeSlash } from 'react-icons/fa';
import { PiCameraSlashFill } from 'react-icons/pi';
import { RiImageAddFill } from 'react-icons/ri';
import { useLocation } from 'react-router-dom';

const MemoListOfChildCategory = () => {
  // const {
  //   setAvailability,
  //   setImagePreview,
  //   setCategoryName,
  //   setVisibility,
  //   search,
  //   visibilityFilter,
  //   sortOrder,
  //   setCategoryStep,
  //   setOpenMenu,
  //   setEditingSubCat,
  //   setCatId,
  //   setIdCheck,
  //   setRecommendationIds,
  //   setRemoveRecommendationIds,
  //   setSelectSingleParentCat,
  //   isMenuManager,
  //   setTimings
  // } = useMenuPageStore((state) => ({
  //   search: state.search,
  //   visibilityFilter: state.visibilityFilter,
  //   sortOrder: state.sortOrder,
  //   setCategoryStep: state.setCategoryStep,
  //   setOpenMenu: state.setOpenMenu,
  //   setVisibility: state.setVisibility,
  //   setAvailability: state.setAvailability,
  //   setImagePreview: state.setImagePreview,
  //   setCategoryName: state.setCategoryName,
  //   setEditingSubCat: state.setEditingSubCat,
  //   setCatId: state.setCatId,
  //   setIdCheck: state.setIdCheck,
  //   setRemoveRecommendationIds: state.setRemoveRecommendationIds,
  //   setRecommendationIds: state.setRecommendationIds,
  //   setSelectSingleParentCat: state.setSelectSingleParentCat,
  //   isMenuManager: state.isMenuManager,
  //   setTimings: state.setTimings,
  // }));
  const setAvailability = useMenuPageStore((s) => s.setAvailability);
  const setImagePreview = useMenuPageStore((s) => s.setImagePreview);
  const setCategoryName = useMenuPageStore((s) => s.setCategoryName);
  const setCategoryInfo = useMenuPageStore((s) => s.setCategoryInfo);
  const setEditingSubCat = useMenuPageStore((s) => s.setEditingSubCat);
  const setCatId = useMenuPageStore((s) => s.setCatId);
  const setIdCheck = useMenuPageStore((s) => s.setIdCheck);
  const setRemoveRecommendationIds = useMenuPageStore((s) => s.setRemoveRecommendationIds);
  const setRecommendationIds = useMenuPageStore((s) => s.setRecommendationIds);
  const setSelectSingleParentCat = useMenuPageStore((s) => s.setSelectSingleParentCat);
  const isMenuManager = useMenuPageStore((s) => s.isMenuManager);
  const setTimings = useMenuPageStore((s) => s.setTimings);
  const setCategoryStep = useMenuPageStore((s) => s.setCategoryStep);
  const setOpenMenu = useMenuPageStore((s) => s.setOpenMenu);
  const setVisibility = useMenuPageStore((s) => s.setVisibility);
  const search = useMenuPageStore((s) => s.search);
  const visibilityFilter = useMenuPageStore((s) => s.visibilityFilter);
  const sortOrder = useMenuPageStore((s) => s.sortOrder);

  const queryClient = useQueryClient();
  const pathname = useLocation().pathname;
  const { subCategories, setSubCategories } = useCategoryStore((state) => ({
    subCategories: state.subCategories,
    setSubCategories: state.setSubCategories,
  }));
  const businessId = useBusinessData((s) => s.businessData?._id);
  const [sequenceCategories, setSequenceCategories] = useState([]);
  const [sequenceMode, setSequenceMode] = useState(false);
  const [selected, setSelected] = useState(null);
  const outLetType = useBusinessData((s) => s.outletInfo?.outLetType);

  const { isLoading } = useChildCategories();

  const fuse = new Fuse(subCategories, {
    keys: ['name'],
    threshold: 0.1,
  });

  const filteredCategories = useMemo(() => {
    // Start with a shallow copy of subCategories using slice()
    let filtered = subCategories.slice();

    if (search) {
      filtered = fuse.search(search).map((result) => result.item);
    }

    if (visibilityFilter !== 'all') {
      filtered = filtered.filter((c) => c.visibility === (visibilityFilter === 'visible'));
    }

    if (filtered.length === 0) return [];

    switch (sortOrder) {
      case 'asc':
        return filtered.slice().sort((a, b) => a.name.localeCompare(b.name));
      case 'desc':
        return filtered.slice().sort((a, b) => b.name.localeCompare(a.name));
      default:
        return filtered;
    }
  }, [subCategories, search, visibilityFilter, sortOrder, fuse]);

  const editCategory = useCallback((category: CategoryType) => {
    if (category.parentCategoryIds.length > 0) {
      setSelectSingleParentCat(category.parentCategoryIds[0]);
    }
    setCategoryStep('EDIT_SUB_CATEGORY');
    setVisibility(category.visibility ?? false);
    setAvailability(category.availability ?? false);
    setImagePreview(category.coverImage ?? null);
    setIdCheck(category.parentCategoryIds);
    setRecommendationIds(category.dishIds);
    setRemoveRecommendationIds(category.dishIds);
    setCategoryName(category.name);
    setCategoryInfo(category.categoryInfo || '');
    setCatId(category._id?.toString() ?? '');
    setOpenMenu(true);
    setEditingSubCat(true);
    setTimings(category.timings ?? []);
  }, []);

  const { mutateAsync: saveSequenceToAPI } = useMutation({
    mutationFn: async (sequenceCategories: { categoryId: string; sequence: number }[]) => {
      const response = await apiRpc.categories.sequence[':businessId'].$post({
        param: {
          businessId,
        },
        json: sequenceCategories,
      });
      return response.json();
    },
    onSuccess: (data) => {
      if (!data?.err) {
        queryClient.invalidateQueries({ queryKey: ['parentCategories'] });
        setSequenceCategories([]);
        toast.success('Sequence updated successfully');
      } else {
        toast.error(data?.message);
      }
    },
    onError: () => {
      toast.error('Failed to update sequence');
    },
  });

  const toggleSequenceMode = async () => {
    if (sequenceMode) {
      const formattedSequenceCategories = sequenceCategories.map((category) => ({
        categoryId: category._id,
        sequence: category.sequence,
        hierarchy: 'CHILD',
      }));
      await saveSequenceToAPI(formattedSequenceCategories);
    }
    setSequenceMode((prev) => !prev);
    setSelected(null);
    if (!sequenceMode) {
      const updatedSequenceCategories = subCategories.map((category, index) => ({
        _id: category._id,
        sequence: category.sequence === 0 ? index + 1 : category.sequence,
        hierarchy: 'CHILD',
      }));
      setSequenceCategories(updatedSequenceCategories);
      setSubCategories(
        subCategories.map((category, index) => ({
          ...category,
          sequence: category.sequence === 0 ? index + 1 : category.sequence,
          hierarchy: 'CHILD',
        })),
      );
    }
  };

  const handleSwap = useCallback(
    (category) => {
      if (!selected) {
        setSelected(category);
      } else {
        const updatedCategories = [...subCategories];
        const firstIndex = updatedCategories.findIndex((c) => c._id === selected._id);
        const secondIndex = updatedCategories.findIndex((c) => c._id === category._id);

        if (firstIndex !== -1 && secondIndex !== -1) {
          // Swap the categories
          [updatedCategories[firstIndex], updatedCategories[secondIndex]] = [updatedCategories[secondIndex], updatedCategories[firstIndex]];

          // Swap the sequence values
          const tempSequence = updatedCategories[firstIndex].sequence;
          updatedCategories[firstIndex].sequence = updatedCategories[secondIndex].sequence;
          updatedCategories[secondIndex].sequence = tempSequence;

          setSequenceCategories(updatedCategories.map(({ _id, sequence }) => ({ _id, sequence })));
          setSubCategories(updatedCategories);
        }
        setSelected(null);
      }
    },
    [selected, subCategories, setSubCategories],
  );

  const isManage = !pathname.includes('allservices');
  const isServiceManager = pathname.includes('serviceManager');

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <section className="relative mx-4 flex flex-wrap justify-start gap-4 py-[7rem] lg:py-[5rem]">
      <h3 className="absolute left-0 top-[4rem] text-xl font-semibold text-black lg:top-[2rem]">
        {outLetType === 'OTHER' ? 'Catalogue' : 'Categories'} ({filteredCategories?.length})
      </h3>{' '}
      {filteredCategories ? (
        filteredCategories?.map((category, index) => (
          <div
            onKeyDown={() => (sequenceMode ? handleSwap(category) : null)}
            onClick={() => (sequenceMode ? handleSwap(category) : null)}
            key={category.name}
            className="relative w-full max-w-[28rem]"
          >
            {sequenceMode && (
              <div className="absolute inset-0 z-10 flex items-center justify-center rounded-2xl bg-black/25">
                <span className="text-4xl font-bold text-white">{category.sequence || index + 1}</span>
              </div>
            )}
            <button
              type="button"
              key={category.name}
              onClick={() => editCategory(category)}
              className={`flex h-[4.5rem] w-full max-w-[28rem] items-center justify-between rounded-2xl bg-white p-4 shadow transition ${
                sequenceMode ? 'cursor-pointer border-2' : ''
              } ${selected?._id === category._id ? 'ring-2 ring-green-500 ring-offset-2' : ''}`}
            >
              {isManage ? (
                <figure className="flex items-center gap-4">
                  {category.coverImage ? (
                    <img src={category.coverImage} alt={category.name} className="h-12 w-12 rounded-xl" />
                  ) : (
                    <div className="rounded-xl bg-[#A5A5A5] p-4 opacity-50">
                      <RiImageAddFill />
                    </div>
                  )}
                  <article className="flex flex-col items-start">
                    <h3 className="-mt-1 mb-2 font-semibold">{category.name}</h3>
                    {sequenceMode && <span className="text-xs text-gray-500">Position: {category.sequence || index + 1}</span>}
                    <div className="flex gap-2">
                      {category.visibility ? null : <FaEyeSlash className="text-red-500" />}
                      {category.coverImage ? null : <PiCameraSlashFill className="text-red-500" />}
                    </div>
                  </article>
                </figure>
              ) : (
                <h3 className="mb-2 text-lg font-semibold">{category.name}</h3>
              )}

              <article className="flex">
                {!isMenuManager ? (
                  <div>{category.visibility ? <FaEye className="text-green-500" /> : <FaEyeSlash className="text-red-500" />}</div>
                ) : (
                  <div className="flex items-center gap-1 font-semibold opacity-50">
                    <FaCodeBranch className="rotate-180" />
                    {category.subCategoryIds.length}
                  </div>
                )}
                <button type="button" className="pl-4 text-black">
                  <BiSolidEditAlt />
                </button>
              </article>
            </button>
          </div>
        ))
      ) : (
        <center>No Sub Category</center>
      )}
      {isServiceManager ? (
        <BottomButton fixed buttons={[{ text: sequenceMode ? 'Done' : 'Sequence', onClick: toggleSequenceMode, type: 'button' }]} />
      ) : null}
    </section>
  );
};
const ListOfChildCategory = memo(MemoListOfChildCategory);
export default ListOfChildCategory;
