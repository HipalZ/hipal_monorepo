import { memo, useCallback, useEffect, useMemo, useState } from "react"
import { useLocation, useNavigate, useParams } from "react-router-dom"
import { FaArrowLeft } from "react-icons/fa"
import { BiPlus } from "react-icons/bi"
import { HiX } from "react-icons/hi"

// Components
import MemoizedHeader from "@/components/molecules/header"
import Sidebar from "@/components/templates/menu/sideNavbaar"
import PopUp from "@/components/atom/popUp"
import CreateCategory from "@/components/templates/menu/category/createCategory"
import ListOfParentCategory from "@/components/templates/menu/category/listOfParentCategory"
import ListOfChildCategory from "@/components/templates/menu/category/listOfChildCategories"
import Search from "@/components/templates/menu/category/search"
import Filter from "@/components/templates/menu/category/filter"
import CreateDish from "@/components/templates/menu/dish/createDish"
import ListOfDishes from "@/components/templates/menu/dish/dishesList"
import EditDish from "@/components/templates/menu/dish/[editDish]/editDish"
import AddOnForm from "@/components/templates/menu/addonPage/addOnform"
import ListOfAddOn from "@/components/templates/menu/addonPage/listOfAddOn"
import AlertClosePopup from "@/components/common/alertClosePopup"
import LoadingSpinner from "@/components/atom/loadingSpinner"

// Hooks and utilities
import useMenuPageStore, { type MenuPageType } from "@/components/store/useMenuStorage"
import { cn } from "@hi/common/src/error-handler"
import { useBulkUploadDishes } from "@/hooks/useCategory"
import { useGetMenuLayout } from "@/hooks/useMenuLayout"
import { MenuType } from "@/components/store/useMenuCreationStore"

// Assets
import Hi from "@/assets/svg/hi.svg"

// UI Components
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Link } from "react-router-dom"
import BulkUploadModal from "@/components/templates/menu/dish/BulkUploadModal.tsx"

const MemoizeDishAndCat = () => {
  const navigate = useNavigate()
  const [showBulkUploadModal, setShowBulkUploadModal] = useState(false)

  const {
    selectedPage,
    setSelectedPage,
    openMenu,
    setOpenMenu,
    resetStore,
    editOpenMenu,
    setEditOpenMenu,
    setSelectedCategory,
    resetEditDish,
    setIsMenuManager,
    setTempPage,
  } = useMenuPageStore((s) => ({
    selectedPage: s.selectedPage,
    setSelectedPage: s.setSelectedPage,
    setSelectedCategory: s.setSelectedCategory,
    openMenu: s.openMenu,
    setOpenMenu: s.setOpenMenu,
    editOpenMenu: s.editOpenMenu,
    setEditOpenMenu: s.setEditOpenMenu,
    resetStore: s.resetStore,
    resetEditDish: s.resetEditDish,
    setIsMenuManager: s.setIsMenuManager,
    setTempPage: s.setTempPage,
  }))

  // File upload hooks
  const { mutate: handleFileUpload, isPending } = useBulkUploadDishes()

  // URL params and location
  const params = useParams<{ businessId?: string; menuId?: string }>()
  const { businessId, menuId } = params
  const { isLoading, menuLayout } = useGetMenuLayout(menuId as string)
  const pathname = useLocation().pathname

  // Determine if this is a hierarchical menu (main → sub → dish) or flat (sub → dish)
  const isHierarchicalMenu = useMemo(() => {
    if (isLoading || !menuLayout?.data) return true // Default to hierarchical if loading
    return menuLayout.data.menuType === MenuType.MAIN_SUB_DISH
  }, [isLoading, menuLayout])

  // Initialize page on component mount
  useEffect(() => {
    const isManagerExists = pathname.includes("dishandcat")
    setIsMenuManager(!isManagerExists)
    setSelectedPage("DISHES")
  }, [pathname, setIsMenuManager, setSelectedPage])

  // Open bulk upload modal
  const bulkUpload = useCallback(() => {
    setShowBulkUploadModal(true)
  }, [])

  // Handle file upload from modal
  const handleModalFileUpload = useCallback(
    (file: File) => {
      handleFileUpload(file)
      // Modal will be closed by the hook on success
    },
    [handleFileUpload],
  )

  // Open menu creation modal
  const openMenuModel = useCallback(() => {
    resetStore()
    if (selectedPage === "MAIN_CATEGORY") {
      setSelectedCategory("MAIN_CATEGORY")
    } else if (selectedPage === "SUB_CATEGORY") {
      setSelectedCategory("SUB_CATEGORY")
    }
    setOpenMenu(true)
    resetEditDish()
  }, [selectedPage, resetStore, resetEditDish, setSelectedCategory, setOpenMenu])

  // Close menu modal with confirmation
  const closeMenu = useCallback(() => {
    setTempPage(selectedPage)
    setSelectedPage("ALERT")
  }, [selectedPage, setSelectedPage, setTempPage])

  // Close edit menu modal
  const closeEditMenu = useCallback(() => {
    setEditOpenMenu(false)
  }, [setEditOpenMenu])

  // Show confirmation popup
  const showPopUp = useCallback(() => {
    setTempPage(selectedPage)
    setSelectedPage("ALERT")
  }, [setSelectedPage, setTempPage, selectedPage])

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

  // Dynamic heading based on selected page
  function dynamicHeading() {
    switch (selectedPage) {
      case "DISHES":
        return "Dishes"
      case "MAIN_CATEGORY":
        return "Main Category"
      case "SUB_CATEGORY":
        return "Sub Category"
      case "ADD_ON":
        return "Add On"
      default:
        return ""
    }
  }

  // Helper to check if a page matches the selected page
  const isPageSelected = useCallback((page: MenuPageType, text: string) => {
    const normalize = (str: string) => str.toLowerCase().replace(/[^a-z0-9]/g, "")
    return normalize(page) === normalize(text)
  }, [])

  // Handle back navigation
  const handleBack = useCallback(() => {
    navigate(`/app/business/${businessId}/select-menu/${menuId}`)
  }, [businessId, menuId, navigate])

  // Show loading spinner while data is loading
  if (isPending || isLoading) {
    return <LoadingSpinner />
  }

  return (
    <main>
      <div className="sticky top-0 z-50 w-full">
        {/* Header */}
        <article className="linear_gradient_background">
          <MemoizedHeader title={dynamicHeading()} leftIcon={<FaArrowLeft />} onBack={handleBack} />
        </article>

        {/* Mobile navigation */}
        <section className="absolute w-full px-4 space-x-4 text-sm mobile-only">
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

        {/* Search and filter */}
        <section className="w-full bg-base-100">
          <Filter />
          <Search />
        </section>
      </div>

      {/* Breadcrumb navigation */}
      <div className="px-4 py-4 font-semibold bg-white">
        <Breadcrumb>
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
              <BreadcrumbPage>{dynamicHeading()}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      {/* Sidebar for desktop */}
      <Sidebar items={sidebarItems} />

      {/* Main content area */}
      <section className="min-h-[100dvh]">
        {selectedPage === "DISHES" && <ListOfDishes />}
        {selectedPage === "MAIN_CATEGORY" && isHierarchicalMenu && <ListOfParentCategory />}
        {selectedPage === "SUB_CATEGORY" && <ListOfChildCategory />}
        {selectedPage === "ADD_ON" && <ListOfAddOn />}
      </section>

      {/* Edit popup */}
      {editOpenMenu && (
        <PopUp show={editOpenMenu} onClose={closeEditMenu} hide>
          <section className="min-h-[100dvh] max-h-[100dvh] lg:min-h-[70dvh] lg:max-h-[90dvh] overflow-y-auto pb-[5rem] hide-scrollbar">
            {selectedPage !== "ALERT" && (
              <button
                className="absolute z-50 p-3 bg-white rounded-full top-6 right-4"
                type="button"
                onClick={showPopUp}
              >
                <HiX />
              </button>
            )}
            {selectedPage === "DISHES" && <EditDish />}
            {selectedPage === "ALERT" && <AlertClosePopup />}
          </section>
        </PopUp>
      )}

      {/* Create popup */}
      {openMenu && (
        <PopUp show={openMenu} onClose={closeMenu} hide>
          <section className="min-h-[100dvh] max-h-[100dvh] lg:min-h-[70dvh] lg:max-h-[90dvh] overflow-y-auto pb-[5rem] hide-scrollbar">
            {selectedPage !== "ALERT" && (
              <button
                className="absolute z-50 p-3 bg-white rounded-full top-6 right-4"
                type="button"
                onClick={closeMenu}
              >
                <HiX />
              </button>
            )}
            {selectedPage === "DISHES" && <CreateDish />}
            {(selectedPage === "MAIN_CATEGORY" || selectedPage === "SUB_CATEGORY") && <CreateCategory />}
            {selectedPage === "ADD_ON" && <AddOnForm />}
            {selectedPage === "ALERT" && <AlertClosePopup />}
          </section>
        </PopUp>
      )}

      {/* Action buttons */}
      <div
        className={`${
          selectedPage === "MAIN_CATEGORY" ? "bottom-16" : "bottom-6"
        }  fixed z-50 flex flex-col items-end space-y-4 lg:sticky lg:float-right lg:bottom-6 right-6`}
      >
        {selectedPage === "DISHES" && (
          <>
            <button
              onClick={bulkUpload}
              className="z-50 flex items-center h-10 px-4 py-2 text-white bg-black rounded-full"
              type="button"
            >
              <BiPlus size={20} /> Bulk Upload Dishes
            </button>
          </>
        )}
        <button
          onClick={openMenuModel}
          className="z-50 flex items-center h-10 px-4 py-2 text-white capitalize bg-black rounded-full"
          type="button"
        >
          <BiPlus size={20} /> {selectedPage?.toLowerCase()}
        </button>
      </div>

      {/* Bulk upload modal */}
      {showBulkUploadModal && (
        <BulkUploadModal
          onClose={() => setShowBulkUploadModal(false)}
          onUpload={handleModalFileUpload}
          isLoading={isPending}
        />
      )}
    </main>
  )
}

const DishAndCat = memo(MemoizeDishAndCat)
export default DishAndCat
