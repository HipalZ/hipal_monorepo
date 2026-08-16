'use client';
import SubTypes from '@/components/molecules/categoryTypes/subTypes';
import Header from '@/components/molecules/header';
import { useDishesStore } from '@/components/store/useDishesStore';
import { useSearch } from '@/components/store/useSearch';
import type { IMenuLayout, TimingType } from '@/components/types/businessData';
import { cn } from '@hi/common';
import type { CategoryType, DishType } from '@hi/db-models/src/validators';
import dynamic from 'next/dynamic';
import { memo, useEffect, useMemo } from 'react';

const EdgeFlow = dynamic(() => import('./EdgeFlow'));
const MainTypes = dynamic(() => import('@/components/molecules/categoryTypes/mainTypes'));
const CollapseMenu = dynamic(() => import('./CollapseMenu'));

interface IDishesProps {
  childCategory: CategoryType[];
  parentCategory: CategoryType[];
  timings: TimingType;
  menuLayout: IMenuLayout;
}

const DishesList = ({ childCategory, parentCategory, menuLayout }: IDishesProps) => {
  const { isSearchActive } = useSearch();

  const primaryColor = menuLayout?.primaryColor || '#000000';
  const secondaryColor = menuLayout?.secondaryColor || '#ffffff';

  const categoryLayout = menuLayout?.categoryLayout;
  const isEdgeLayout = categoryLayout === 1;
  const isClassicLayout = categoryLayout === 2;
  const isCollapseLayout = categoryLayout === 3;

  const isHorizontalCard = menuLayout?.cardLayout === 1;
  const { setDishes } = useDishesStore();

  const subTypes = useMemo(() => {
    const hasVisibleDishes = (category: CategoryType): boolean => {
      return category.hierarchy === 'CHILD' && category.dishIds && category.dishIds.length > 0;
    };

    if (parentCategory && parentCategory.length > 0) {
      const uniqueSubCategoryIds = new Set<string>();

      for (const parentCat of parentCategory) {
        if (parentCat.subCategoryIds && parentCat.subCategoryIds.length > 0) {
          for (const id of parentCat.subCategoryIds) {
            uniqueSubCategoryIds.add(id);
          }
        }
      }

      const orderedSubTypes = Array.from(uniqueSubCategoryIds)
        .map((subCatId: string) => {
          return childCategory.find((childCat: CategoryType) => childCat._id === subCatId);
        })
        .filter((cat): cat is CategoryType => Boolean(cat));

      return orderedSubTypes.filter(hasVisibleDishes);
    }
    return childCategory?.filter(hasVisibleDishes);
  }, [childCategory, parentCategory]);

  useEffect(() => {
    const allDishes = childCategory
      .filter((category) => category.dishIds && category.dishIds.length > 0)
      .flatMap((category) => category.dishIds || [])
      .filter((dish) => typeof dish !== 'string') as unknown as DishType[];
    setDishes(allDishes);
  }, [childCategory, setDishes]);

  return (
    <>
      <section className={cn('sticky top-0 z-50 bg-white text-[#000000]')}>
        <Header categories={childCategory} primaryColor={primaryColor} secondaryColor={secondaryColor} />
      </section>

      {isClassicLayout && (
        <>
          {!isSearchActive && (
            <SubTypes childCategory={subTypes} primaryColor={primaryColor} secondaryColor={secondaryColor} isHorizontalCard={!isHorizontalCard} />
          )}
        </>
      )}

      {isEdgeLayout && (
        <EdgeFlow childCategory={subTypes} isHorizontalCard={!isHorizontalCard} primaryColor={primaryColor} secondaryColor={secondaryColor} />
      )}

      {isCollapseLayout && (
        <CollapseMenu
          parentCategories={parentCategory || []}
          childCategories={childCategory || []}
          primaryColor={primaryColor}
          secondaryColor={secondaryColor}
        />
      )}

      {!isCollapseLayout && (
        <MainTypes parentCategory={parentCategory || []} childCategory={subTypes || []} primaryColor={primaryColor} secondaryColor={secondaryColor} />
      )}
    </>
  );
};

export default memo(DishesList);
