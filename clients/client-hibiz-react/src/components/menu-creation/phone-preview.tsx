import { memo, useState, useEffect, useCallback } from "react"
import { useMenuCreationStore, MenuType, CategoryLayout, CardLayout, Category, Dish } from "@/components/store/useMenuCreationStore"
import { FaUtensils, FaTimes, FaShoppingCart } from "react-icons/fa"
import { cn } from "@/lib/utils"

// Define parent category type
interface ParentCategory {
    _id: string
    name: string
    coverImage?: string
    subCategoryIds: string[]
}

interface PhonePreviewProps {
    categories: Category[]
    dishes: Dish[]
    parentCategories?: ParentCategory[]
    showDishLayout?: boolean
    showFinalPreview?: boolean
}

const PhonePreview = memo(
    ({
        categories,
        dishes,
        parentCategories = [],
        showDishLayout = false,
        showFinalPreview = false,
    }: PhonePreviewProps) => {
        const { menuType, categoryLayout, cardLayout, primaryColor, secondaryColor } = useMenuCreationStore((state) => ({
            menuType: state.menuType,
            categoryLayout: state.categoryLayout,
            cardLayout: state.cardLayout,
            primaryColor: state.primaryColor,
            secondaryColor: state.secondaryColor,
        }))

        const [activeParentCategory, setActiveParentCategory] = useState<string | null>(null)
        const [activeCategory, setActiveCategory] = useState<string | null>(null)
        const [selectedDish, setSelectedDish] = useState<Dish | null>(null)
        const [showMenuModal, setShowMenuModal] = useState(false)

        // Set first parent category and subcategory as active when data changes
        useEffect(() => {
            if (menuType === MenuType.MAIN_SUB_DISH && parentCategories.length > 0 && !activeParentCategory) {
                setActiveParentCategory(parentCategories[0]._id)
            }

            if (categories.length > 0 && !activeCategory) {
                setActiveCategory(categories[0]._id)
            }
        }, [categories, parentCategories, activeParentCategory, activeCategory, menuType])

        // Get subcategories for the active parent category
        const activeSubcategories = useCallback(() => {
            if (menuType !== MenuType.MAIN_SUB_DISH || !activeParentCategory) return categories

            const parent = parentCategories.find((p) => p._id === activeParentCategory)
            if (!parent) return categories

            return categories.filter((c) => parent.subCategoryIds.includes(c._id))
        }, [activeParentCategory, categories, parentCategories, menuType])

        // Get dishes for the active category
        const activeCategoryDishes = useCallback(() => {
            if (!activeCategory) return dishes.slice(0, 4)

            const category = categories.find((c) => c._id === activeCategory)
            if (category && category.dishIds && category.dishIds.length) {
                return category.dishIds.slice(0, 4)
            }
            return dishes.slice(0, 4)
        }, [activeCategory, categories, dishes])

        const handleParentCategoryClick = useCallback(
            (categoryId: string) => {
                setActiveParentCategory(categoryId)

                // Set first subcategory of this parent as active
                const parent = parentCategories.find((p) => p._id === categoryId)
                if (parent && parent.subCategoryIds.length > 0) {
                    const firstSubCategoryId = parent.subCategoryIds[0]
                    setActiveCategory(firstSubCategoryId)
                }
            },
            [parentCategories],
        )

        const handleCategoryClick = useCallback((categoryId: string) => {
            setActiveCategory(categoryId)
        }, [])

        const handleDishClick = useCallback((dish: Dish) => {
            setSelectedDish(dish)
        }, [])

        const handleCloseModal = useCallback(() => {
            setSelectedDish(null)
        }, [])

        const toggleMenuModal = useCallback(() => {
            setShowMenuModal((prev) => !prev)
        }, [])

        const renderDishCard = useCallback(
            (dish: Dish) => {
                if (cardLayout === CardLayout.GRID || (!showDishLayout && !showFinalPreview)) {
                    // Grid layout
                    return (
                        <div
                            className="overflow-hidden transition-shadow bg-white border border-gray-200 rounded-md cursor-pointer hover:shadow-md"
                            onClick={() => handleDishClick(dish)}
                        >
                            {/* Image area */}
                            <div className="flex items-center justify-center w-full bg-gray-100 aspect-square">
                                {dish.images && dish.images.length > 0 ? (
                                    <img
                                        src={dish.images[0] || "/placeholder.svg"}
                                        alt={dish.name}
                                        className="object-cover w-full h-full"
                                    />
                                ) : (
                                    <div
                                        className="flex items-center justify-center w-full h-full"
                                        style={{ backgroundColor: secondaryColor }}
                                    >
                                        <FaUtensils className="text-2xl" style={{ color: primaryColor }} />
                                    </div>
                                )}
                            </div>

                            {/* Info area */}
                            <div className="p-2">
                                <h4 className="text-sm font-medium truncate" style={{ color: primaryColor }}>
                                    {dish.name}
                                </h4>
                                <p className="text-sm" style={{ color: primaryColor }}>
                                    ${dish.price.toFixed(2)}
                                </p>
                                <p className="mt-1 text-xs text-gray-500 line-clamp-2">
                                    {dish.description || "No description available"}
                                </p>
                            </div>
                        </div>
                    )
                } else {
                    return (
                        <div
                            className="flex overflow-hidden transition-shadow bg-white border border-gray-200 rounded-md cursor-pointer hover:shadow-md"
                            onClick={() => handleDishClick(dish)}
                        >
                            {/* Info area */}
                            <div className="flex-1 p-2 w-[60%]">
                                <h4 className="text-sm font-medium truncate" style={{ color: primaryColor }}>
                                    {dish.name}
                                </h4>
                                <p className="text-sm" style={{ color: primaryColor }}>
                                    ${dish.price.toFixed(2)}
                                </p>
                                <p className="mt-1 text-xs text-gray-500 line-clamp-2">
                                    {dish.description || "No description available"}
                                </p>
                            </div>

                            {/* Image area */}
                            <div className="flex items-center justify-center w-20 h-24">
                                {dish.images && dish.images.length > 0 ? (
                                    <img
                                        src={dish.images[0] || "/placeholder.svg"}
                                        alt={dish.name}
                                        className="object-cover w-full h-full"
                                    />
                                ) : (
                                    <div
                                        className="flex items-center justify-center w-full h-full"
                                        style={{ backgroundColor: secondaryColor }}
                                    >
                                        <FaUtensils className="text-xl" style={{ color: primaryColor }} />
                                    </div>
                                )}
                            </div>
                        </div>
                    )
                }
            },
            [cardLayout, showDishLayout, showFinalPreview, primaryColor, secondaryColor, handleDishClick],
        )

        // Render Edge layout
        const renderEdgeLayout = useCallback(() => {
            return (
                <div className="flex h-full hide-scrollbar">
                    {/* Left sidebar - 25% width */}
                    <div className="w-1/4 h-full overflow-y-auto pb-[5rem]  border-r border-gray-200 hide-scrollbar">
                        {/* Subcategories */}
                        <div className="py-2">
                            {menuType === MenuType.MAIN_SUB_DISH && (
                                <h4 className="pl-2 mb-1 text-xs font-bold text-gray-500">SUB-CAT</h4>
                            )}
                            {activeSubcategories()
                                .slice(0, 6)
                                .map((category) => (
                                    <button
                                        key={category._id}
                                        style={{
                                            color: category._id === activeCategory ? primaryColor : "black",
                                            borderColor: category._id === activeCategory ? primaryColor : "transparent",
                                            borderStyle: "solid",
                                            borderWidth: "0 4px 0 0",
                                        }}
                                        className={cn("w-full mb-2 p-2 text-xs font-medium flex flex-col items-center transition-colors", )}
                                        onClick={() => handleCategoryClick(category._id)}
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
                                                    backgroundColor: category._id === activeCategory ? "white" : secondaryColor,
                                                    color: category._id === activeCategory ? primaryColor : "gray",
                                                }}
                                            >
                                                {category.name.charAt(0)}
                                            </div>
                                        )}
                                        <span className="w-full text-center truncate">{category.name}</span>
                                    </button>
                                ))}
                        </div>
                    </div>

                    {/* Right content - 75% width */}
                    <div className="w-3/4 p-2 overflow-y-auto bg-gray-50 pb-[5rem] hide-scrollbar">
                        <div className={`grid ${cardLayout === CardLayout.GRID ? "grid-cols-2" : "grid-cols-1"} gap-2`}>
                            {activeCategoryDishes().map((dish) => (
                                <div key={dish._id} className="w-full">
                                    {renderDishCard(dish)}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )
        }, [
            menuType,
            categories,
            activeCategory,
            primaryColor,
            secondaryColor,
            handleCategoryClick,
            activeCategoryDishes,
            renderDishCard,
            cardLayout,
            activeSubcategories,
        ])

        // Render Classic layout
        const renderClassicLayout = useCallback(() => {
            return (
                <div className="flex flex-col h-full">
                    {/* Subcategories */}
                    <div
                        className="flex items-center h-20 p-2 space-x-2 overflow-x-auto bg-white hide-scrollbar">
                        {activeSubcategories()
                            .slice(0, 6)
                            .map((category) => (
                                <button
                                    key={category._id}
                                    style={{
                                        color: category._id === activeCategory ? primaryColor : "black",
                                        borderColor: category._id === activeCategory ? primaryColor : "transparent",
                                        borderStyle: "solid",
                                        borderWidth: "0 0 4px 0",
                                    }}
                                    className={cn(
                                        "p-2 text-xs font-medium flex flex-col items-center transition-colors min-w-[60px]",
                                    )}
                                    onClick={() => handleCategoryClick(category._id)}
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
                                                backgroundColor: secondaryColor,
                                                color: category._id === activeCategory ? primaryColor : "gray",
                                            }}
                                        >
                                            {category.name.charAt(0)}
                                        </div>
                                    )}
                                    <span className="w-full text-center truncate">{category.name}</span>
                                </button>
                            ))}
                    </div>

                    {/* Dishes below */}
                    <div className="flex-1 p-2 overflow-y-auto bg-gray-50 pb-[5rem] hide-scrollbar">
                        <div className={`grid ${cardLayout === CardLayout.GRID ? "grid-cols-2" : "grid-cols-1"} gap-2`}>
                            {activeCategoryDishes().map((dish) => (
                                <div key={dish._id} className="w-full">
                                    {renderDishCard(dish)}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )
        }, [
            activeCategory,
            primaryColor,
            secondaryColor,
            handleCategoryClick,
            activeCategoryDishes,
            renderDishCard,
            cardLayout,
            activeSubcategories,
        ])

        // Render dish detail modal
        const renderDishModal = useCallback(() => {
            if (!selectedDish) return null

            return (
                <div className="absolute inset-0 z-10 flex items-center justify-center bg-black bg-opacity-50 rounded-[32px]">
                    <div className="w-full mt-[7.5rem] max-h-[90%] bg-white rounded-xl overflow-hidden flex flex-col">
                        {/* Modal header with c6ose button */}
                        <div className="relative">
                            {/* Dish image */}
                            <div className="w-full h-48 bg-gray-100">
                                {selectedDish.images && selectedDish.images.length > 0 ? (
                                    <img
                                        src={selectedDish.images[0] || "/placeholder.svg"}
                                        alt={selectedDish.name}
                                        className="object-cover w-full h-full"
                                    />
                                ) : (
                                    <div
                                        className="flex items-center justify-center w-full h-full"
                                        style={{ backgroundColor: secondaryColor }}
                                    >
                                        <FaUtensils className="text-4xl" style={{ color: primaryColor }} />
                                    </div>
                                )}

                                {/* Close button */}
                                <button
                                    className="absolute flex items-center justify-center w-8 h-8 text-gray-800 bg-white rounded-full top-2 right-2 bg-opacity-70 hover:bg-opacity-100"
                                    onClick={handleCloseModal}
                                >
                                    <FaTimes />
                                </button>
                            </div>

                            {/* Dish details */}
                            <div className="px-4 pt-2 pb-4">
                                <h3 className="text-lg font-bold truncate" style={{ color: primaryColor }}>
                                    {selectedDish.name}
                                </h3>
                                <p className="text-sm font-bold" style={{ color: primaryColor }}>
                                    ₹{selectedDish.price.toFixed(2)}
                                </p>

                                <div className="mt-2 h-[3rem]">
                                    <p className="text-xs font-semibold text-gray-500 line-clamp-2">{selectedDish.description || "No description available"}</p>
                                </div>

                                {/* Add to cart button */}
                                <button
                                    className="flex items-center justify-center w-full gap-2 py-3 font-medium text-white rounded-lg"
                                    style={{ backgroundColor: primaryColor }}
                                    onClick={handleCloseModal}
                                >
                                    <FaShoppingCart />
                                    <span>Add to Cart</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )
        }, [selectedDish, primaryColor, secondaryColor, handleCloseModal])

        // Render menu modal
        const renderMenuModal = useCallback(() => {
            if (!showMenuModal) return null

            return (
                <div className="absolute inset-0 z-10 flex items-center justify-center bg-black bg-opacity-50 rounded-[32px]">
                    <div
                        className="w-[90%] max-h-[90%] rounded-xl overflow-hidden flex flex-col overflow-y-auto"
                        style={{ backgroundColor: secondaryColor }}
                    >
                        {/* Modal header with close button */}
                        <div className="sticky top-0 flex items-center justify-between p-3 bg-white border-b border-gray-200">
                            <h3 className="text-base font-bold" style={{ color: primaryColor }}>
                                Menu Categories
                            </h3>
                            <button
                                className="flex items-center justify-center w-8 h-8 text-gray-800 rounded-full hover:bg-gray-100"
                                onClick={toggleMenuModal}
                            >
                                <FaTimes />
                            </button>
                        </div>

                        {/* Menu content */}
                        <div className="p-4 overflow-y-auto hide-scrollbar">
                            {parentCategories.map((parent) => (
                                <div key={parent._id} className="mb-6">
                                    <div
                                        className="flex items-center gap-2 pb-1 mb-2 border-b border-gray-200"
                                        onClick={() => {
                                            handleParentCategoryClick(parent._id)
                                            toggleMenuModal()
                                        }}
                                    >
                                        {parent.coverImage ? (
                                            <div className="w-8 h-8 overflow-hidden rounded-full">
                                                <img
                                                    src={parent.coverImage || "/placeholder.svg"}
                                                    alt={parent.name}
                                                    className="object-cover w-full h-full"
                                                />
                                            </div>
                                        ) : (
                                            <div
                                                className="flex items-center justify-center w-8 h-8 rounded-full"
                                                style={{ backgroundColor: "white", color: primaryColor }}
                                            >
                                                {parent.name.charAt(0)}
                                            </div>
                                        )}
                                        <h4 className="text-sm font-bold cursor-pointer" style={{ color: primaryColor }}>
                                            {parent.name}
                                        </h4>
                                    </div>

                                    <div className="grid grid-cols-2 gap-2">
                                        {categories
                                            .filter((c) => parent.subCategoryIds.includes(c._id))
                                            .map((subCategory) => (
                                                <button
                                                    key={subCategory._id}
                                                    className="flex items-center gap-1 p-2 bg-white rounded-md hover:bg-gray-50"
                                                    onClick={() => {
                                                        handleParentCategoryClick(parent._id)
                                                        handleCategoryClick(subCategory._id)
                                                        toggleMenuModal()
                                                    }}
                                                >
                                                    {subCategory.coverImage ? (
                                                        <div className="w-6 h-6 overflow-hidden rounded-full">
                                                            <img
                                                                src={subCategory.coverImage || "/placeholder.svg"}
                                                                alt={subCategory.name}
                                                                className="object-cover w-full h-full"
                                                            />
                                                        </div>
                                                    ) : (
                                                        <div
                                                            className="flex items-center justify-center w-6 h-6 rounded-full"
                                                            style={{ backgroundColor: secondaryColor, color: primaryColor }}
                                                        >
                                                            {subCategory.name.charAt(0)}
                                                        </div>
                                                    )}
                                                    <span className="text-xs truncate">{subCategory.name}</span>
                                                </button>
                                            ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )
        }, [
            showMenuModal,
            parentCategories,
            categories,
            primaryColor,
            secondaryColor,
            toggleMenuModal,
            handleParentCategoryClick,
            handleCategoryClick,
        ])

        return (
            <div className="flex flex-col items-center lg:scale-110">
                {/* iPhone frame */}
                <div className="relative w-[17rem] h-[500px] bg-black rounded-[40px] p-2 shadow-xl">
                    {/* Notch */}
                    <div className="absolute z-10 w-24 h-6 transform -translate-x-1/2 bg-black top-3 left-1/2 rounded-xl"></div>

                    {/* Screen */}
                    <div className="w-full h-full bg-gray-50 rounded-[32px] overflow-hidden relative">
                        {/* Status bar */}
                        <div className="flex items-center justify-between w-full h-6 px-4 text-xs font-medium bg-white">
                            <span>9:41</span>
                            <div className="flex items-center gap-1">
                                <span>📶</span>
                                <span>🔋</span>
                            </div>
                        </div>

                        {/* App header */}
                        <div className="flex items-center w-full h-10 px-4 bg-white border-b border-gray-200">
                            <h3 className="text-sm font-bold" style={{ color: primaryColor }}>
                                Restaurant Menu
                            </h3>
                        </div>

                        {/* Parent categories if using MAIN_SUB_DISH */}
                        {menuType === MenuType.MAIN_SUB_DISH && (
                            <div style={{
                                backgroundColor: secondaryColor,
                                color: primaryColor,
                            }} className="flex items-center h-12 p-2 space-x-2 overflow-x-auto border-b border-gray-200 hide-scrollbar">
                                {parentCategories.slice(0, 6).map((category) => (
                                    <button
                                        key={category._id}
                                        style={{
                                            color: category._id === activeParentCategory ? "white" : "black",
                                            backgroundColor: category._id === activeParentCategory ? primaryColor : "white",
                                        }}
                                        className={cn(
                                            "p-2 rounded-md text-xs font-medium flex gap-2  transition-colors",

                                        )}
                                        onClick={() => handleParentCategoryClick(category._id)}
                                    >
                                        {category.coverImage ? (
                                            <div className="w-4 h-4 overflow-hidden rounded-full">
                                                <img
                                                    src={category.coverImage || "/placeholder.svg"}
                                                    alt={category.name}
                                                    className="object-cover w-full h-full"
                                                />
                                            </div>
                                        ) : (
                                            <div
                                                className="flex items-center justify-center w-4 h-4 rounded-full"
                                                style={{
                                                    backgroundColor: category._id === activeParentCategory ? "white" : secondaryColor,
                                                    color: category._id === activeParentCategory ? primaryColor : "gray",
                                                }}
                                            >
                                                {category.name.charAt(0)}
                                            </div>
                                        )}
                                        <span className="w-full text-center truncate">{category.name}</span>
                                    </button>
                                ))}
                            </div>
                        )}

                        {/* Menu content */}
                        <div
                            className={`flex-1 ${menuType === MenuType.MAIN_SUB_DISH ? "h-[calc(100%-48px-64px)]" : "h-[calc(100%-48px)]"}`}
                        >
                            {categoryLayout === CategoryLayout.EDGE ? renderEdgeLayout() : renderClassicLayout()}
                        </div>

                        {/* Menu button */}
                        <button
                            className="absolute z-0 flex items-center justify-center w-12 h-8 px-4 text-xs text-white rounded-md shadow-lg left-2 bottom-4"
                            style={{ backgroundColor: primaryColor }}
                            onClick={toggleMenuModal}
                        >
                            {/* <FaBars className="text-white" /> */}
                            Menu
                        </button>

                        {/* Dish detail modal */}
                        {selectedDish && renderDishModal()}

                        {/* Menu modal */}
                        {renderMenuModal()}
                    </div>

                    {/* Home indicator */}
                    <div className="absolute w-32 h-1 transform -translate-x-1/2 bg-white rounded-full bottom-1 left-1/2"></div>
                </div>

                <p className="max-w-xs mt-4 text-sm text-center text-gray-500">
                    {showFinalPreview
                        ? "Final preview of how your menu will appear to customers"
                        : showDishLayout
                            ? "Preview of your selected category and dish layout"
                            : "Preview of your selected category layout"}
                </p>
            </div>
        )
    },
)

PhonePreview.displayName = "PhonePreview"
export default PhonePreview

