"use client"
import { type FC, memo,  useRef } from "react"
import { useActiveClass } from "@/components/store/useActiveClass"
import type { CategoryType, DishType } from "@hi/db-models/src/validators"
import { cn } from "@hi/common"
import { InView } from "react-intersection-observer"
import { _useAllBusiness } from "@/components/store/useAllBusiness"
import GridDishCard from "@/components/atoms/card/GridDishCard"
import HorizontalCard from "@/components/atoms/card/horizontalCard"

interface EdgeFlowProps {
  childCategory: CategoryType[]
  primaryColor?: string
  secondaryColor?: string
  isHorizontalCard?: boolean
}

const filterDishes = (visibleDishes: DishType[], isActiveDishType: string) => {
  const typeMap: Record<string, string[]> = {
    all: [],
    nonveg: ["NON_VEG", "ALCOHOL", "NON_ALCOHOL"],
    non_veg: ["NON_VEG", "ALCOHOL", "NON_ALCOHOL"],
    veg: ["VEG", "ALCOHOL", "NON_ALCOHOL"],
    vegan: ["VEGAN", "ALCOHOL", "NON_ALCOHOL"],
    alcohol: ["ALCOHOL"],
    nonalcohol: ["NON_ALCOHOL"],
    non_alcohol: ["NON_ALCOHOL"],
  }

  if (isActiveDishType.toLowerCase() === "all") {
    return visibleDishes
  }

  const allowedTypes = typeMap[isActiveDishType.toLowerCase()] || []

  return visibleDishes.filter((dish) => dish.dishTypes?.some((type) => allowedTypes.includes(type)))
}

const EdgeFlow: FC<EdgeFlowProps> = ({
  childCategory,
  primaryColor = "#000000",
  secondaryColor = "#f5f5f5",
  isHorizontalCard = false,
}) => {
  // const { setDishes } = useDishesStore()
  const {
    isActiveDishType,
    isActiveCategory,
    setActiveCategory,
    observerActive,
    setObserverActive,
  } = useActiveClass()



  const isGridLayout = isHorizontalCard

  const visibleCategoriesRef = useRef<{ [key: string]: number }>({})
  const updateActiveCategory = () => {
    if (!observerActive) return

    const entries = Object.entries(visibleCategoriesRef.current)
    if (entries.length === 0) return

    const closest = entries.reduce(
      (prev, curr) => {
        const currOffset = curr[1]
        if (currOffset < prev.offset) {
          return { id: curr[0], offset: currOffset }
        }
        return prev
      },
      { id: "", offset: Number.POSITIVE_INFINITY },
    )
    if (closest.id && isActiveCategory !== closest.id) {
      setActiveCategory(closest.id)
    }
  }

  return (
    <div className="flex h-[calc(100dvh-11rem)]">
      {/* Left sidebar for categories - Edge layout style */}
      <div className="w-[20%] h-full overflow-y-auto sticky top-[10rem] max-h-[calc(100vh-10rem)] hide-scrollbar">
        {childCategory.map((category: CategoryType) => (
          <button
            type="button"
            key={category._id}
            className={cn("w-full mb-2 p-2 text-xs font-medium flex flex-col items-center transition-colors")}
            style={{
              color: category._id === isActiveCategory ? primaryColor : "black",
              borderColor: category._id === isActiveCategory ? primaryColor : "transparent",
              borderStyle: "solid",
              borderWidth: "0 4px 0 0",
            }}
            onClick={() => {
              setObserverActive(false)
              setActiveCategory(category._id?.toString() || "")
              const element = document.getElementById(category._id?.toString() || "")
              if (element) {
                element.style.scrollMarginTop = "110px"
                element.scrollIntoView({ behavior: "smooth" })
              }
              setTimeout(() => {
                setObserverActive(true)
              }, 1000)
            }}
          >
            {category.coverImage ? (
              <div className="w-8 h-8 mb-1 overflow-hidden rounded-full">
                <img
                  src={category.coverImage || "/placeholder.svg"}
                  alt={category.name}
                  className="object-cover w-full h-full"
                />
              </div>
            ) : (
              <div
                className="flex items-center justify-center w-8 h-8 mb-1 rounded-full"
                style={{
                  backgroundColor: category._id === isActiveCategory ? "white" : secondaryColor,
                  color: category._id === isActiveCategory ? primaryColor : "gray",
                }}
              >
                {category.name.charAt(0)}
              </div>
            )}
            <span className="w-full text-center ">{category.name}</span>
          </button>
        ))}
      </div>

      {/* Right content area for dishes */}
      <div className="w-[80%] overflow-y-auto bg-white pb-[5rem] hide-scrollbar">
        {childCategory.map((category: CategoryType, index) => {
          const visibleDishes = category.dishIds.filter((dish: DishType) => dish.visibility)
          const dishesToRender = filterDishes(visibleDishes, isActiveDishType)

          if (dishesToRender.length === 0) return null

          return (
            <section
              key={`${category._id}${index}`}
              className={cn("w-full pb-4 overflow-hidden")}
              id={category._id?.toString()}
            >
              <InView
                rootMargin="-150px 0px 0px 0px"
                threshold={0.75}
                onChange={(inView, entry) => {
                  const categoryId = category._id?.toString()
                  if (categoryId) {
                    if (inView) {
                      visibleCategoriesRef.current[categoryId] = Math.abs(entry.boundingClientRect.top - 300)
                    } else {
                      delete visibleCategoriesRef.current[categoryId]
                    }
                    updateActiveCategory()
                  }
                }}
              >
                {({ ref }) => (
                  <div
                    ref={ref}
                    className={cn("z-40 flex items-center space-x-4 justify-between h-[4rem] px-4 font-bold prose")}
                    style={{
                      backgroundColor: `${secondaryColor}`,
                      borderBottom: `1px solid ${primaryColor}`,
                    }}
                  >
                    <h2
                      className="w-full text-2xl font-medium text-center capitalize truncate font-play"
                      style={{ color: primaryColor }}
                      title={category.name || "Unnamed Category"}
                    >
                      {category.name || "Unnamed Category"}
                    </h2>
                  </div>
                )}
              </InView>

              {isGridLayout ? (
                <div className="grid grid-cols-2 gap-2 p-2">
                  {dishesToRender.map((dishData: DishType, dishIndex) => (
                    <GridDishCard
                      key={`${dishData._id}-${dishIndex}`}
                      dishData={dishData}
                      primaryColor={primaryColor}
                      secondaryColor={secondaryColor}
                    />
                  ))}
                </div>
              ) : (
                <div className="flex flex-col divide-y divide-gray-100">
                  {dishesToRender.map((dishData: DishType, dishIndex) => (
                    <HorizontalCard
                      key={`${dishData._id}-${dishIndex}`}
                      dishData={dishData}
                      primaryColor={primaryColor}
                      secondaryColor={secondaryColor}
                    />
                  ))}
                </div>
              )}
            </section>
          )
        })}
      </div>
    </div>
  )
}

export default memo(EdgeFlow)

