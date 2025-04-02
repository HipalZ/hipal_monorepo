
import { memo, forwardRef } from "react"
import { Category, Dish } from "@/components/store/useMenuCreationStore"


interface CategoryEdgePreviewProps {
  categories: Category[]
  dishes: Dish[]
  activeCategory?: string
  primaryColor: string
  secondaryColor: string
  onCategoryClick?: (categoryId: string) => void
}

const CategoryEdgePreview = memo(
  forwardRef<HTMLDivElement, CategoryEdgePreviewProps>(
    ({ categories, dishes, activeCategory, primaryColor, secondaryColor, onCategoryClick }, ref) => {
      // Limit to first 5 categories and 6 dishes for preview
      const previewCategories = categories.slice(0, 5)
      const previewDishes = dishes.slice(0, 6)

      return (
        <div ref={ref} className="flex w-full h-full overflow-hidden bg-white border border-gray-200 rounded-lg">
          {/* Left sidebar - 20% width */}
          <div className="w-1/5 h-full p-2 overflow-y-auto border-r border-gray-200">
            {previewCategories.map((category) => (
              <button
                key={category._id}
                className={`w-full mb-2 p-2 rounded-md text-xs font-medium flex items-center transition-colors ${
                  category._id === activeCategory
                    ? `bg-[${primaryColor}] text-white border-l-4 border-[${primaryColor}]`
                    : "hover:bg-gray-100"
                }`}
                onClick={() => onCategoryClick?.(category._id)}
              >
                {category.coverImage ? (
                  <div className="w-6 h-6 mr-1 overflow-hidden rounded-full">
                    <img
                      src={category.coverImage || "/placeholder.svg"}
                      alt={category.name}
                      className="object-cover w-full h-full"
                    />
                  </div>
                ) : (
                  <div
                    className="flex items-center justify-center w-6 h-6 mr-1 text-gray-600 rounded-full"
                    style={{ backgroundColor: secondaryColor }}
                  >
                    {category.name.charAt(0)}
                  </div>
                )}
                <span className="truncate">{category.name}</span>
              </button>
            ))}
          </div>

          {/* Right content - 80% width */}
          <div className="w-4/5 p-2 overflow-y-auto">
            <div className="grid grid-cols-2 gap-2">
              {previewDishes.map((dish) => (
                <div key={dish._id} className="p-2 border border-gray-200 rounded-md">
                  {dish.images && dish.images.length > 0 ? (
                    <div className="w-full h-20 mb-1 overflow-hidden bg-gray-100 rounded-md">
                      <img
                        src={dish.images[0] || "/placeholder.svg"}
                        alt={dish.name}
                        className="object-cover w-full h-full"
                      />
                    </div>
                  ) : (
                    <div
                      className="flex items-center justify-center w-full h-20 mb-1 rounded-md"
                      style={{ backgroundColor: secondaryColor }}
                    >
                      <span className="text-2xl" style={{ color: primaryColor }}>
                        🍽️
                      </span>
                    </div>
                  )}
                  <h3 className="text-sm font-medium truncate" style={{ color: primaryColor }}>
                    {dish.name}
                  </h3>
                  <p className="text-sm" style={{ color: primaryColor }}>
                    ${dish.price.toFixed(2)}
                  </p>
                  <p className="mt-1 text-xs text-gray-500 line-clamp-2">
                    {dish.description || "No description available"}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )
    },
  ),
)

CategoryEdgePreview.displayName = "CategoryEdgePreview"
export default CategoryEdgePreview

