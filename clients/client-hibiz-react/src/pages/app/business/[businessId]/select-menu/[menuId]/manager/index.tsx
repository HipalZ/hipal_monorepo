import MemoizedHeader from "@/components/molecules/header"
import useBusinessData from "@/components/store/useBusinessData"
import { memo, useCallback, useEffect, useMemo } from "react"
import { useLocation, useParams } from "react-router-dom"
import Hi from "@/assets/svg/hi.svg"
import { FaArrowLeft } from "react-icons/fa"
import useMenuPageStore, { type MenuPageType } from "@/components/store/useMenuStorage"
import Sidebar from "@/components/templates/menu/sideNavbaar"
import { cn } from "@hi/common/src/error-handler"
import PopUp from "@/components/atom/popUp"
import { HiX } from "react-icons/hi"
import Search from "@/components/templates/menu/category/search"
import Filter from "@/components/templates/menu/category/filter"
import EditDish from "@/components/templates/menu/dish/[editDish]/editDish"
import DishesManager from "@/components/templates/manager/dish/dishesManager"
import ListOfParentCategory from "@/components/templates/menu/category/listOfParentCategory"
import ListOfChildCategory from "@/components/templates/menu/category/listOfChildCategories"
import ListOfAddOn from "@/components/templates/menu/addonPage/listOfAddOn"
import AddOnForm from "@/components/templates/menu/addonPage/addOnform"
import CreateCategory from "@/components/templates/menu/category/createCategory"
import CreateDish from "@/components/templates/menu/dish/createDish"
import QuickMenu from "@/components/templates/menu/QuickMenu"
import { useGetMenuLayout } from "@/hooks/useMenuLayout"
import { MenuType } from "@/components/store/useMenuCreationStore"
import LoadingSpinner from "@/components/atom/loadingSpinner"
import {
  Breadcrumb as UIBreadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Link } from "react-router-dom"
const MemoiseManager = () => {
  // Get URL params to fetch menu layout
  const params = useParams<{ businessId?: string; menuId?: string }>()
  const { menuId ,businessId } = params
  const { isLoading, menuLayout } = useGetMenuLayout(menuId as string)
  const pathname = useLocation().pathname

  const {
    selectedPage,
    setIsMenuManager,
    setSelectedPage,
    resetStore,
    editOpenMenu,
    setEditOpenMenu,
    openMenu,
    setOpenMenu,
    isMenuManager,
  } = useMenuPageStore((s) => ({
    selectedPage: s.selectedPage,
    setSelectedPage: s.setSelectedPage,
    editOpenMenu: s.editOpenMenu,
    setEditOpenMenu: s.setEditOpenMenu,
    setSelectedCategory: s.setSelectedCategory,
    openMenu: s.openMenu,
    setOpenMenu: s.setOpenMenu,
    resetStore: s.resetStore,
    resetEditDish: s.resetEditDish,
    isMenuManager: s.isMenuManager,
    setIsMenuManager: s.setIsMenuManager,
  }))


  // Determine if this is a hierarchical menu (main → sub → dish) or flat (sub → dish)
  const isHierarchicalMenu = useMemo(() => {
    if (isLoading || !menuLayout?.data) return true // Default to hierarchical if loading
    return menuLayout.data.menuType === MenuType.MAIN_SUB_DISH
  }, [isLoading, menuLayout])

  useEffect(() => {
    const isManagerExists = pathname.includes("manager")
    setIsMenuManager(isManagerExists)
  }, [pathname, setIsMenuManager])

  const closeMenu = useCallback(() => {
    resetStore()
    setOpenMenu(false)
  }, [resetStore, setOpenMenu])

  const closeEditMenu = useCallback(() => {
    setEditOpenMenu(false)
  }, [setEditOpenMenu])

  // Generate sidebar items based on menu type
  const sidebarItems = useMemo(() => {
    const items = [
      { icon: Hi, text: "Dishes", onClick: () => setSelectedPage("DISHES") },
      {
        icon: Hi,
        text: "Sub-category",
        onClick: () => setSelectedPage("SUB_CATEGORY"),
      },
      { icon: Hi, text: "Add On", onClick: () => setSelectedPage("ADD_ON") },
      { icon: Hi, text: "Quick Menu", onClick: () => setSelectedPage("QUICK_MENU") },
    ]

    // Only include Main-category for hierarchical menus
    if (isHierarchicalMenu) {
      items.splice(1, 0, {
        icon: Hi,
        text: "Main-category",
        onClick: () => setSelectedPage("MAIN_CATEGORY"),
      })
    }

    return items
  }, [isHierarchicalMenu, setSelectedPage])

  // Helper to check if a page matches the selected page
  const isPageSelected = useCallback((page: MenuPageType, text: string) => {
    const normalize = (str: string) => str.toLowerCase().replace(/[^a-z0-9]/g, "")
    return normalize(page) === normalize(text)
  }, [])

  // Format page title for display
  const pageTitle = useMemo(() => {
    return selectedPage.split("_").join(" ")
  }, [selectedPage])

  // Show loading spinner while data is loading
  if (isLoading) {
    return <LoadingSpinner />
  }

  return (
    <main>
      <div className="sticky top-0 z-50 w-full">
        {/* Header */}
        <article className="linear_gradient_background">
          <MemoizedHeader  title={pageTitle} leftIcon={<FaArrowLeft />} />
        </article>

        <div className="px-4 py-2 font-semibold bg-white border-b border-gray-200">
          <UIBreadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link to={`/app/business/${businessId}/select-menu`}>Menu Layouts</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>

              {menuLayout?.data?.name && (
                <>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>
                    <BreadcrumbLink asChild>
                      <Link
                        to={`/app/business/${businessId}/select-menu/${menuId}`}
                        className="max-w-[150px] truncate"
                        title={menuLayout.data.name}
                      >
                        {menuLayout.data.name}
                      </Link>
                    </BreadcrumbLink>
                  </BreadcrumbItem>
                </>
              )}

              <BreadcrumbSeparator />

              <BreadcrumbItem>
                <BreadcrumbPage>{pageTitle}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </UIBreadcrumb>
        </div>

        {/* Mobile navigation */}
        <section className="absolute flex w-full px-4 space-x-4 overflow-auto text-sm text-nowrap flex-nowrap hide-scrollbar mobile-only">
          {sidebarItems.map((item) => (
            <button
              className={cn(
                "pb-3 pt-4",
                isPageSelected(selectedPage, item.text) ? "border-b-2 border-black transition-all" : "",
              )}
              key={item.text}
              type="button"
              onClick={item.onClick}
            >
              {item.text}
            </button>
          ))}
        </section>

        {/* Search and filter (except for Quick Menu) */}
        {selectedPage !== "QUICK_MENU" && (
          <>
            <Filter />
            <Search />
          </>
        )}
      </div>

      {/* Sidebar for desktop */}
      <Sidebar items={sidebarItems} />

      {/* Main content area */}
      <section className="min-h-[100dvh]">
        {selectedPage === "DISHES" && <DishesManager />}
        {selectedPage === "MAIN_CATEGORY" && isHierarchicalMenu && <ListOfParentCategory />}
        {selectedPage === "SUB_CATEGORY" && <ListOfChildCategory />}
        {selectedPage === "ADD_ON" && <ListOfAddOn />}
        {selectedPage === "QUICK_MENU" && isMenuManager && <QuickMenu />}
      </section>

      {/* Edit popup */}
      {editOpenMenu && (
        <PopUp show={editOpenMenu} onClose={closeEditMenu} hide>
          <section className="min-h-[90dvh] max-h-[90dvh] lg:min-h-[70dvh] lg:max-h-[70dvh] overflow-y-auto pb-[5rem] hide-scrollbar">
            <button
              className="absolute z-50 p-3 bg-white rounded-full top-6 right-4"
              type="button"
              onClick={closeEditMenu}
            >
              <HiX />
            </button>
            {selectedPage === "DISHES" && <EditDish />}
          </section>
        </PopUp>
      )}

      {/* Create popup */}
      {openMenu && (
        <PopUp show={openMenu} onClose={closeMenu} hide>
          <section className="min-h-[90dvh] max-h-[90dvh] lg:min-h-[70dvh] lg:max-h-[70dvh] overflow-y-auto pb-[5rem] hide-scrollbar">
            <button className="absolute z-50 p-3 bg-white rounded-full top-6 right-4" type="button" onClick={closeMenu}>
              <HiX />
            </button>
            {selectedPage === "DISHES" && <CreateDish />}
            {(selectedPage === "MAIN_CATEGORY" || selectedPage === "SUB_CATEGORY") && <CreateCategory />}
            {selectedPage === "ADD_ON" && <AddOnForm />}
          </section>
        </PopUp>
      )}
    </main>
  )
}

const MenuManager = memo(MemoiseManager)
export default MenuManager

