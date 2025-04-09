"use client"
import { type FC, memo, useMemo } from "react"
import type { CategoryType } from "@hi/db-models/src/validators"
import { cn } from "@hi/common"
import SubTypes from "@/components/molecules/categoryTypes/subTypes"
import { useSearch } from "@/components/store/useSearch"
import type { IMenuLayout, TimingType } from "@/components/types/businessData"
import Header from "@/components/molecules/header"
import EdgeFlow from "./EdgeFlow"
import MainTypes from "@/components/molecules/categoryTypes/mainTypes"
import { useDishesStore } from "@/components/store/useDishesStore"

interface IDishesProps {
  childCategory: CategoryType[]
  parentCategory: CategoryType[]
  timings: TimingType
  menuLayout: IMenuLayout
}

const DishesList: FC<IDishesProps> = (props) => {
  const { childCategory, parentCategory, menuLayout } = props
  const { isSearchActive } = useSearch()

  const primaryColor = menuLayout?.primaryColor || "#ec4899"
  const secondaryColor = menuLayout?.secondaryColor || "#fce7f3"
  const isClassicLayout = menuLayout?.categoryLayout === 2
  const isHorizontalCard = menuLayout?.cardLayout === 2
  const { setDishes } = useDishesStore()

  const subTypes = useMemo(() => {
    const hasVisibleDishes = (category: CategoryType): boolean => {
      return category.hierarchy === "CHILD" && category.dishIds && category.dishIds.length > 0
    }

    if (parentCategory && parentCategory.length > 0) {
      const uniqueSubCategoryIds = new Set<string>()

      parentCategory.forEach((parentCat: CategoryType) => {
        if (parentCat.subCategoryIds && parentCat.subCategoryIds.length > 0) {
          parentCat.subCategoryIds.forEach((id) => uniqueSubCategoryIds.add(id))
        }
      })

      const orderedSubTypes = Array.from(uniqueSubCategoryIds)
        .map((subCatId: string) => {
          return childCategory.find((childCat: CategoryType) => childCat._id === subCatId)
        })
        .filter((cat): cat is CategoryType => Boolean(cat))

      return orderedSubTypes.filter(hasVisibleDishes)
    } else {
      return childCategory?.filter(hasVisibleDishes)
    }
  }, [childCategory, parentCategory])

  useMemo(() => {
    const allDishes = childCategory
      .filter((category) => category.dishIds && category.dishIds.length > 0)
      .flatMap((category) => category.dishIds || [])

    setDishes(allDishes)
  }, [childCategory, setDishes])



  return (
    <>
      <section className={cn("sticky z-50 text-[#000000] bg-white top-0")}>
        <Header
          categories={childCategory}
          primaryColor={primaryColor}
          secondaryColor={secondaryColor}
        />
      </section>

      {isClassicLayout ? (
        <>
          {!isSearchActive && (
            <SubTypes
              childCategory={subTypes}
              primaryColor={primaryColor}
              secondaryColor={secondaryColor}
              isHorizontalCard={isHorizontalCard}
            />
          )}
        </>
      ) : (
        <EdgeFlow
          childCategory={subTypes}
          isHorizontalCard={!isHorizontalCard}
          primaryColor={primaryColor}
          secondaryColor={secondaryColor}
        />
      )}
      <MainTypes
        parentCategory={parentCategory || []}
        childCategory={subTypes || []}
        primaryColor={primaryColor || "#ec4899"}
        secondaryColor={secondaryColor || "#fce7f3"}
      />
    </>
  )
}

export default memo(DishesList)

