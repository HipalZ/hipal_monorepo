"use client"
import { useActiveClass } from "@/components/store/useActiveClass"
import { cn } from "@hi/common"
import type { CategoryType, DishType } from "@hi/db-models/src/validators"
import { memo, useCallback, useMemo, useState } from "react"
import CustomModal from "./customModal"
import { _useAllBusiness } from "@/components/store/useAllBusiness"
import { useCartStore } from "@/components/store/useCartStore"
import Bell from "@/assets/cart/bell.png"
import Image from "next/image"
import { useSearch } from "@/components/store/useSearch"
import { useParams } from "next/navigation"

interface IMainTypes {
  parentCategory: CategoryType[]
  childCategory: CategoryType[]
  primaryColor?: string
  secondaryColor?: string
}

const filterDishesByType = (category: CategoryType, activeDishType: string): boolean => {
  return (
    category.hierarchy === "CHILD" &&
    category.dishIds &&
    category.dishIds.length > 0 &&
    category.dishIds.some((dish: DishType) => {
      const typeMap: Record<string, string[]> = {
        all: [], // Show all dishes
        nonveg: ["NON_VEG", "ALCOHOL", "NON_ALCOHOL"],
        non_veg: ["NON_VEG", "ALCOHOL", "NON_ALCOHOL"],
        veg: ["VEG", "ALCOHOL", "NON_ALCOHOL"],
        vegan: ["VEGAN", "ALCOHOL", "NON_ALCOHOL"],
        alcoholic: ["ALCOHOL"],
        nonalcoholic: ["NON_ALCOHOL"],
      }

      const allowedTypes = typeMap[activeDishType.toLowerCase()] || []

      return (
        !dish.isDeleted &&
        dish.visibility &&
        (activeDishType.toLowerCase() === "all" || dish.dishTypes?.some((type) => allowedTypes.includes(type)))
      )
    })
  )
}

// Group subcategories by parent category
const groupSubcategoriesByParent = (
  parentCategories: CategoryType[],
  childCategories: CategoryType[],
  activeDishType: string,
) => {
  const result: Record<string, { parent: CategoryType; subcategories: CategoryType[] }> = {}

  parentCategories.forEach((parent) => {
    if (parent.visibility && parent.subCategoryIds?.length > 0) {
      const subcats = childCategories.filter(
        (child) => child.parentCategoryIds?.includes(parent._id || "") && filterDishesByType(child, activeDishType),
      )

      if (subcats.length > 0) {
        result[parent._id || ""] = {
          parent,
          subcategories: subcats,
        }
      }
    }
  })

  return result
}

const MemoMainTypes = (props: IMainTypes) => {
  const { parentCategory, childCategory, primaryColor = "#000000", secondaryColor = "#f5f5f5" } = props
  const outletInfo = _useAllBusiness((s) => s.data.outletInfo)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const { cart } = useCartStore()
  const params = useParams()
  const menuName = "Menu"

  const { setActiveParentCategory, setActiveCategory, setObserverActive, isActiveDishType, setActiveChildCategory } =
    useActiveClass()

  const { isSearchActive } = useSearch()

  // Group subcategories by parent
  const categoriesByParent = useMemo(() => {
    return groupSubcategoriesByParent(parentCategory, childCategory, isActiveDishType)
  }, [parentCategory, childCategory, isActiveDishType])

  // For menus without parent categories
  const standaloneCategories = useMemo(() => {
    if (parentCategory.length === 0) {
      return childCategory.filter((cat) => filterDishesByType(cat, isActiveDishType))
    }
    return []
  }, [childCategory, parentCategory, isActiveDishType])

  const setActiveCategories = useCallback(
    (category: CategoryType) => {
      setObserverActive(false)

      // If category has parent, set active parent
      if (category.parentCategoryIds?.length > 0) {
        setActiveParentCategory(category.parentCategoryIds[0] || "")
      }

      setActiveCategory(category._id?.toString() || "")
      setActiveChildCategory(category._id?.toString() || "")

      const element = document.getElementById(category._id?.toString() || "")
      if (element) {
        element.style.scrollMarginTop = "110px"
        element.scrollIntoView({ behavior: "smooth" })
      }

      setTimeout(() => {
        setObserverActive(true)
      }, 1000)

      setIsModalOpen(false)
    },
    [setActiveCategory, setActiveParentCategory, setActiveChildCategory, setObserverActive],
  )

  if (isSearchActive || outletInfo?.outLetType === "OTHER") return null

  return (
    <>
      <button
        type="button"
        onClick={() => setIsModalOpen(true)}
        className={cn(
          "sticky flex items-center rounded-r-xl justify-between px-4 py-3 max-w-[30rem] z-50 left-0",
          cart.length > 0 ? "bottom-[8.5rem]" : "bottom-[5.25rem]",
        )}
        style={{
          backgroundColor: secondaryColor,
          color: primaryColor,
          boxShadow: "0 0 10px rgba(0, 0, 0, 0.1)",
        }}
      >
        <Image src={Bell || "/placeholder.svg"} alt="bell" width={24} height={24} className="mr-2" />
        {menuName}
      </button>

      <CustomModal
        show={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        backgroundColor="white"
        primaryColor={primaryColor}
      >
        <div className="flex flex-col w-full">
          {/* Header */}
          <div className="px-4 py-3 font-medium text-center border-b" style={{ color: primaryColor }}>
            Choose Category
          </div>

          {/* Categories by parent */}
          <div className="max-h-[70vh] overflow-y-auto">
            {Object.values(categoriesByParent).map(({ parent, subcategories }) => (
              <div key={parent._id} className="mb-4">
                {/* Parent category header */}
                <div className="flex items-center gap-2 px-4 py-2" style={{ color: primaryColor }}>
                  {parent.coverImage ? (
                    <div className="w-5 h-5 overflow-hidden rounded-full">
                      <img
                        src={parent.coverImage || "/placeholder.svg"}
                        alt={parent.name}
                        className="object-cover w-full h-full"
                      />
                    </div>
                  ) : (
                    <div
                      className="flex items-center justify-center w-5 h-5 rounded-full"
                      style={{ color: primaryColor }}
                    >
                      <span className="text-xs">{parent.name.charAt(0)}</span>
                    </div>
                  )}
                  <span className="font-medium">{parent.name}</span>
                </div>

                {/* Subcategories */}
                <div className="grid grid-cols-3 gap-2 px-4 py-2">
                  {subcategories.map((category) => (
                    <button
                      key={category._id}
                      className="flex flex-col items-center text-center"
                      onClick={() => setActiveCategories(category)}
                    >
                      <div className="w-16 h-16 mb-1 overflow-hidden bg-gray-100 rounded-full">
                        {category.coverImage ? (
                          <img
                            src={category.coverImage || "/placeholder.svg"}
                            alt={category.name}
                            className="object-cover w-full h-full"
                          />
                        ) : (
                          <div className="flex items-center justify-center w-full h-full bg-white">
                            <span style={{ color: primaryColor }}>{category.name.charAt(0)}</span>
                          </div>
                        )}
                      </div>
                      <span className="max-w-full text-xs line-clamp-2">{category.name}</span>
                    </button>
                  ))}
                </div>

                <div className="mx-4 my-2 border-b border-gray-100"></div>
              </div>
            ))}

            {/* Standalone categories (no parent) */}
            {standaloneCategories.length > 0 && (
              <div className="mb-4">
                <div className="flex items-center gap-2 px-4 py-2" style={{ color: primaryColor }}>
                  <span className="font-medium">Categories</span>
                </div>

                <div className="grid grid-cols-3 gap-2 px-4 py-2">
                  {standaloneCategories.map((category) => (
                    <button
                      key={category._id}
                      className="flex flex-col items-center text-center"
                      onClick={() => setActiveCategories(category)}
                    >
                      <div className="w-16 h-16 mb-1 overflow-hidden bg-gray-100 rounded-full">
                        {category.coverImage ? (
                          <img
                            src={category.coverImage || "/placeholder.svg"}
                            alt={category.name}
                            className="object-cover w-full h-full"
                          />
                        ) : (
                          <div className="flex items-center justify-center w-full h-full bg-white">
                            <span style={{ color: primaryColor }}>{category.name.charAt(0)}</span>
                          </div>
                        )}
                      </div>
                      <span className="max-w-full text-xs line-clamp-2">{category.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </CustomModal>
    </>
  )
}

const MainTypes = memo(MemoMainTypes)
export default MainTypes

