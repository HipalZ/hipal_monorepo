'use client';
import SubTypes from '@/components/molecules/categoryTypes/subTypes';
import Header from '@/components/molecules/header';
import { useDishesStore } from '@/components/store/useDishesStore';
import { useSearch } from '@/components/store/useSearch';
import type { IMenuLayout, TimingType } from '@/components/types/businessData';
import { cn } from '@hi/common';
import type { CategoryType, DishType } from '@hi/db-models/src/validators';
import dynamic from 'next/dynamic';
import { memo, useEffect, useMemo, useState } from 'react';
import {
  applyCategoryTimingAvailability,
  type CategoryWithTimingState,
} from '@/components/utils/categoryAvailability';

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
  const [availabilityTick, setAvailabilityTick] = useState(() => Date.now());

  const primaryColor = menuLayout?.primaryColor || '#000000';
  const secondaryColor = menuLayout?.secondaryColor || '#ffffff';

  const categoryLayout = menuLayout?.categoryLayout;
  const isEdgeLayout = categoryLayout === 1;
  const isClassicLayout = categoryLayout === 2;
  const isCollapseLayout = categoryLayout === 3;

  const isHorizontalCard = menuLayout?.cardLayout === 1;
  const { setDishes } = useDishesStore();

  useEffect(() => {
    const intervalId = window.setInterval(() => setAvailabilityTick(Date.now()), 30000);
    return () => window.clearInterval(intervalId);
  }, []);

  const timedChildCategories = useMemo(() => {
    const now = new Date(availabilityTick);
    return (childCategory || []).map((category) => applyCategoryTimingAvailability(category, now));
  }, [childCategory, availabilityTick]);

  const timedParentCategories = useMemo(() => {
    const now = new Date(availabilityTick);
    return (parentCategory || []).map((category) => applyCategoryTimingAvailability(category, now));
  }, [parentCategory, availabilityTick]);

  const subTypes = useMemo(() => {
    const hasVisibleDishes = (category: CategoryWithTimingState): boolean => {
      return category.hierarchy === 'CHILD' && category.dishIds && category.dishIds.length > 0;
    };

    if (timedParentCategories && timedParentCategories.length > 0) {
      const uniqueSubCategoryIds = new Set<string>();

      for (const parentCat of timedParentCategories) {
        if (parentCat.subCategoryIds && parentCat.subCategoryIds.length > 0) {
          for (const id of parentCat.subCategoryIds) {
            uniqueSubCategoryIds.add(id);
          }
        }
      }

      const orderedSubTypes = Array.from(uniqueSubCategoryIds)
        .map((subCatId: string) => {
          return timedChildCategories.find((childCat) => childCat._id === subCatId);
        })
        .filter((cat): cat is CategoryWithTimingState => Boolean(cat));

      return orderedSubTypes.filter(hasVisibleDishes);
    }
    return timedChildCategories?.filter(hasVisibleDishes);
  }, [timedChildCategories, timedParentCategories]);

  useEffect(() => {
    const allDishes = timedChildCategories
      .filter((category) => category.dishIds && category.dishIds.length > 0)
      .flatMap((category) => category.dishIds || [])
      .filter((dish) => typeof dish !== 'string') as unknown as DishType[];
    setDishes(allDishes);
  }, [timedChildCategories, setDishes]);

  return (
    <>
      <section className={cn('sticky top-0 z-50 bg-white text-[#000000]')}>
        <Header categories={timedChildCategories} primaryColor={primaryColor} secondaryColor={secondaryColor} />
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
          parentCategories={timedParentCategories || []}
          childCategories={timedChildCategories || []}
          primaryColor={primaryColor}
          secondaryColor={secondaryColor}
        />
      )}

      {!isCollapseLayout && (
        <MainTypes parentCategory={timedParentCategories || []} childCategory={subTypes || []} primaryColor={primaryColor} secondaryColor={secondaryColor} />
      )}
    </>
  );
};

export default memo(DishesList);
