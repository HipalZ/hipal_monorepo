import { memo, useCallback } from "react"
import { CardLayout, useMenuCreationStore, MenuType, Dish } from "@/components/store/useMenuCreationStore"
import { ParentCategory, CategoryData } from "@/configs/test"
import { FaUtensils } from "react-icons/fa"
import PhonePreview from "./phone-preview"

// Sample parent categories based on the provided data
const sampleParentCategories = ParentCategory

interface Step3DishLayoutProps {
  sampleDishes: Dish[]
}

const Step3DishLayout = memo(({ sampleDishes }: Step3DishLayoutProps) => {
  const { cardLayout, setCardLayout, primaryColor, menuType } = useMenuCreationStore((state) => ({
    cardLayout: state.cardLayout,
    setCardLayout: state.setCardLayout,
    primaryColor: state.primaryColor,
    menuType: state.menuType,
  }))

  const handleSelectLayout = useCallback(
    (layout: CardLayout) => {
      setCardLayout(layout)
    },
    [setCardLayout],
  )

  // Get first 2 dishes for preview
  const previewDishes = sampleDishes.slice(0, 2)

  return (
    <div className="flex flex-col gap-6 p-4">
      <h2 className="text-xl font-semibold text-center">Choose Dish Card Layout</h2>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 pb-[10rem]">
        {/* Phone Preview */}
        <div className="flex items-center justify-center">
          <PhonePreview
            categories={CategoryData}
            dishes={sampleDishes}
            parentCategories={menuType === MenuType.MAIN_SUB_DISH ? sampleParentCategories : []}
            showDishLayout={true}
          />
        </div>
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-1 gap-4">
            {/* Grid Layout */}
            <button
              onClick={() => handleSelectLayout(CardLayout.GRID)}
              className={`flex flex-col items-center p-4 border-2 rounded-lg transition-all ${cardLayout === CardLayout.GRID
                ? "border-primary bg-primary/5"
                : "border-gray-200 hover:border-primary/50"
                }`}
            >
              <h3 className="mb-2 text-lg font-medium">Grid Layout</h3>
              <p className="mb-4 text-sm text-center text-gray-500">
                Large frames displayed 2 at a time. Works best for items with good images.
              </p>

              <div className="w-full max-w-xs p-3 overflow-hidden bg-white border border-gray-200 rounded-lg shadow-sm">
                <div className="grid grid-cols-2 gap-3">
                  {previewDishes.map((dish, index) => (
                    <div key={dish._id || index} className="overflow-hidden border border-gray-200 rounded-md">
                      {/* Image area */}
                      <div className="flex items-center justify-center w-full bg-gray-100 aspect-square">
                        {dish.images && dish.images.length > 0 ? (
                          <img
                            src={dish.images[0] || "/placeholder.svg"}
                            alt={dish.name}
                            className="object-cover w-full h-full"
                          />
                        ) : (
                          <FaUtensils className="text-2xl text-gray-400" />
                        )}
                      </div>

                      {/* Info area */}
                      <div className="p-2">
                        <h4 className="text-sm font-medium truncate">{dish.name}</h4>
                        <p className="text-sm" style={{ color: primaryColor }}>
                          ${dish.price.toFixed(2)}
                        </p>
                        <p className="mt-1 text-xs text-gray-500 line-clamp-2">
                          {dish.description || "No description available"}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </button>

            {/* Horizontal Layout */}
            <button
              onClick={() => handleSelectLayout(CardLayout.HORIZONTAL)}
              className={`flex flex-col items-center p-4 border-2 rounded-lg transition-all ${cardLayout === CardLayout.HORIZONTAL
                ? "border-primary bg-primary/5"
                : "border-gray-200 hover:border-primary/50"
                }`}
            >
              <h3 className="mb-2 text-lg font-medium">Horizontal Layout</h3>
              <p className="mb-4 text-sm text-center text-gray-500">
                Information on the left, image on the right. Works well for all types of dishes.
              </p>

              <div className="w-full max-w-xs p-3 overflow-hidden bg-white border border-gray-200 rounded-lg shadow-sm">
                <div className="flex flex-col gap-3">
                  {previewDishes.map((dish, index) => (
                    <div key={dish._id || index} className="flex overflow-hidden border border-gray-200 rounded-md">
                      {/* Info area */}
                      <div className="flex-1 p-2">
                        <h4 className="text-sm font-medium">{dish.name}</h4>
                        <p className="text-sm" style={{ color: primaryColor }}>
                          ${dish.price.toFixed(2)}
                        </p>
                        <p className="mt-1 text-xs text-gray-500 line-clamp-2">
                          {dish.description || "No description available"}
                        </p>
                      </div>

                      {/* Image area */}
                      <div className="flex items-center justify-center w-20 h-20 bg-gray-100">
                        {dish.images && dish.images.length > 0 ? (
                          <img
                            src={dish.images[0] || "/placeholder.svg"}
                            alt={dish.name}
                            className="object-cover w-full h-full"
                          />
                        ) : (
                          <FaUtensils className="text-2xl text-gray-400" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
})

Step3DishLayout.displayName = "Step3DishLayout"
export default Step3DishLayout

