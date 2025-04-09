import { memo, useCallback } from "react"
import { FaLayerGroup, FaList } from "react-icons/fa"
import { MenuType, useMenuCreationStore } from "../store/useMenuCreationStore"

const Step1MenuType = memo(() => {
  const { menuType, setMenuType } = useMenuCreationStore((state) => ({
    menuType: state.menuType,
    setMenuType: state.setMenuType,
  }))

  const handleSelectType = useCallback(
    (type: MenuType) => {
      setMenuType(type)
    },
    [setMenuType],
  )

  return (
    <div className="flex flex-col gap-6 p-4">
      <h2 className="text-xl font-semibold text-center">Choose Menu Structure</h2>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 pb-[10rem]">
        {/* Main Category → Sub Category → Dishes */}
        <button
        type="button"
          onClick={() => handleSelectType(MenuType.MAIN_SUB_DISH)}
          className={`flex flex-col items-center p-6 border-2 rounded-lg transition-all ${
            menuType === MenuType.MAIN_SUB_DISH
              ? "border-primary bg-primary/5"
              : "border-gray-200 hover:border-primary/50"
          }`}
        >
          <div className="flex items-center justify-center w-32 h-32 mb-4">
            <div className="relative">
              <div className="absolute top-0 left-0 flex items-center justify-center w-16 h-16 rounded-lg bg-primary/20">
                <FaLayerGroup className="text-2xl text-primary" />
              </div>
              <div className="absolute flex items-center justify-center w-16 h-16 rounded-lg top-6 left-6 bg-primary/30">
                <FaList className="text-2xl text-primary" />
              </div>
              <div className="absolute flex items-center justify-center w-16 h-16 rounded-lg top-12 left-12 bg-primary/40">
                <div className="grid grid-cols-2 gap-1">
                  <div className="w-3 h-3 rounded bg-primary/60"></div>
                  <div className="w-3 h-3 rounded bg-primary/60"></div>
                  <div className="w-3 h-3 rounded bg-primary/60"></div>
                  <div className="w-3 h-3 rounded bg-primary/60"></div>
                </div>
              </div>
            </div>
          </div>

          <h3 className="text-lg font-medium">Main Category → Sub Category → Dishes</h3>
          <p className="mt-2 text-sm text-center text-gray-500">
            Organize dishes in a hierarchical structure with main categories and subcategories
          </p>
        </button>

        {/* Sub Category → Dishes */}
        <button
        type="button"
          onClick={() => handleSelectType(MenuType.SUB_DISH)}
          className={`flex flex-col items-center p-6 border-2 rounded-lg transition-all ${
            menuType === MenuType.SUB_DISH ? "border-primary bg-primary/5" : "border-gray-200 hover:border-primary/50"
          }`}
        >
          <div className="flex items-center justify-center w-32 h-32 mb-4">
            <div className="relative">
              <div className="absolute top-0 left-0 flex items-center justify-center w-16 h-16 rounded-lg bg-primary/30">
                <FaList className="text-2xl text-primary" />
              </div>
              <div className="absolute flex items-center justify-center w-16 h-16 rounded-lg top-12 left-12 bg-primary/40">
                <div className="grid grid-cols-2 gap-1">
                  <div className="w-3 h-3 rounded bg-primary/60"></div>
                  <div className="w-3 h-3 rounded bg-primary/60"></div>
                  <div className="w-3 h-3 rounded bg-primary/60"></div>
                  <div className="w-3 h-3 rounded bg-primary/60"></div>
                </div>
              </div>
            </div>
          </div>

          <h3 className="text-lg font-medium">Sub Category → Dishes</h3>
          <p className="mt-2 text-sm text-center text-gray-500">
            Simpler structure with subcategories directly linked to dishes
          </p>
        </button>
      </div>
    </div>
  )
})

Step1MenuType.displayName = "Step1MenuType"
export default Step1MenuType

