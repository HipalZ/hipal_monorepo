import Hi from '@/assets/svg/hi.svg';
import LoadingSpinner from '@/components/atom/loadingSpinner';
import PopUp from '@/components/atom/popUp';
import MemoizedHeader from '@/components/molecules/header';
import { MenuType } from '@/components/store/useMenuCreationStore';
import useMenuPageStore, { type MenuPageType } from '@/components/store/useMenuStorage';
import DishesManager from '@/components/templates/manager/dish/dishesManager';
import AddOnForm from '@/components/templates/menu/addonPage/addOnform';
import ListOfAddOn from '@/components/templates/menu/addonPage/listOfAddOn';
import CreateCategory from '@/components/templates/menu/category/createCategory';
import Filter from '@/components/templates/menu/category/filter';
import ListOfChildCategory from '@/components/templates/menu/category/listOfChildCategories';
import ListOfParentCategory from '@/components/templates/menu/category/listOfParentCategory';
import Search from '@/components/templates/menu/category/search';
import EditDish from '@/components/templates/menu/dish/[editDish]/editDish';
import RestrictedEditDish from '@/components/templates/menu/dish/[editDish]/restrictedEditDish.tsx';
import CreateDish from '@/components/templates/menu/dish/createDish';
import QuickMenu from '@/components/templates/menu/QuickMenu';
import Sidebar from '@/components/templates/menu/sideNavbaar';
import {
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
  Breadcrumb as UIBreadcrumb,
} from '@/components/ui/breadcrumb';
import { useGetMenuLayout } from '@/hooks/useMenuLayout';
import { useDishPermission, useGetPosConfig } from '@/hooks/usePosHook.ts';
import { cn } from '@hi/common/src/error-handler';
import { memo, useCallback, useEffect, useMemo } from 'react';
import { FaArrowLeft } from 'react-icons/fa';
import { HiX } from 'react-icons/hi';
import { Link, useLocation, useParams } from 'react-router-dom';

const MemoiseManager = () => {
  const { businessId, menuId } = useParams<{
    businessId?: string;
    menuId?: string;
  }>();
  const { isLoading, menuLayout } = useGetMenuLayout(menuId as string);
  const { posConfig } = useGetPosConfig(businessId as string);
  const pathname = useLocation().pathname;
  const isPetpoojaIntegration = useMemo(() => posConfig?.posName?.toLowerCase() === 'petpooja', [posConfig]);
  const { permissionLoading, posPermission } = useDishPermission(isPetpoojaIntegration);

  // const {
  //   selectedPage,
  //   setIsMenuManager,
  //   setSelectedPage,
  //   resetStore,
  //   editOpenMenu,
  //   setEditOpenMenu,
  //   openMenu,
  //   setOpenMenu,
  //   isMenuManager,
  // } = useMenuPageStore((s) => ({
  //   selectedPage: s.selectedPage,
  //   setSelectedPage: s.setSelectedPage,
  //   editOpenMenu: s.editOpenMenu,
  //   setEditOpenMenu: s.setEditOpenMenu,
  //   resetStore: s.resetStore,
  //   resetEditDish: s.resetEditDish,
  //   openMenu: s.openMenu,
  //   setOpenMenu: s.setOpenMenu,
  //   isMenuManager: s.isMenuManager,
  //   setIsMenuManager: s.setIsMenuManager,
  // }));
  const selectedPage = useMenuPageStore((s) => s.selectedPage);
  const setSelectedPage = useMenuPageStore((s) => s.setSelectedPage);
  const editOpenMenu = useMenuPageStore((s) => s.editOpenMenu);
  const setEditOpenMenu = useMenuPageStore((s) => s.setEditOpenMenu);
  const resetStore = useMenuPageStore((s) => s.resetStore);
  const setOpenMenu = useMenuPageStore((s) => s.setOpenMenu);
  const setIsMenuManager = useMenuPageStore((s) => s.setIsMenuManager);
  const openMenu = useMenuPageStore((s) => s.openMenu);
  const isMenuManager = useMenuPageStore((s) => s.isMenuManager);

  // detect PetPooja POS
  const onlyShowDishes = useMemo(() => posConfig?.posName?.toLowerCase() === 'petpooja', [posConfig]);

  const isHierarchicalMenu = useMemo(() => {
    if (isLoading || !menuLayout?.data) return true;
    return menuLayout.data.menuType === MenuType.MAIN_SUB_DISH;
  }, [isLoading, menuLayout]);

  useEffect(() => {
    setIsMenuManager(pathname.includes('manager'));
  }, [pathname, setIsMenuManager]);

  const closeMenu = useCallback(() => {
    resetStore();
    setOpenMenu(false);
  }, [resetStore, setOpenMenu]);

  const closeEditMenu = useCallback(() => {
    setEditOpenMenu(false);
  }, [setEditOpenMenu]);

  // build sidebar items, then filter down to just "Dishes" if needed
  const sidebarItems = useMemo(() => {
    const items: { icon: any; text: string; onClick: () => void }[] = [
      { icon: Hi, text: 'Dishes', onClick: () => setSelectedPage('DISHES') },
      {
        icon: Hi,
        text: 'Sub-category',
        onClick: () => setSelectedPage('SUB_CATEGORY'),
      },
      { icon: Hi, text: 'Add On', onClick: () => setSelectedPage('ADD_ON') },
      {
        icon: Hi,
        text: 'Quick Menu',
        onClick: () => setSelectedPage('QUICK_MENU'),
      },
    ];

    if (isHierarchicalMenu) {
      items.splice(1, 0, {
        icon: Hi,
        text: 'Main-category',
        onClick: () => setSelectedPage('MAIN_CATEGORY'),
      });
    }

    return onlyShowDishes ? items.filter((i) => i.text === 'Dishes' || i.text === 'Quick Menu') : items;
  }, [isHierarchicalMenu, setSelectedPage, onlyShowDishes]);

  const isPageSelected = useCallback((page: MenuPageType, text: string) => {
    const normalize = (str: string) => str.toLowerCase().replace(/[^a-z0-9]/g, '');
    return normalize(page) === normalize(text);
  }, []);

  const pageTitle = useMemo(() => selectedPage.split('_').join(' '), [selectedPage]);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <main>
      <div className="sticky top-0 z-50 w-full">
        <article className="linear_gradient_background">
          <MemoizedHeader title={pageTitle} leftIcon={<FaArrowLeft />} />
        </article>

        <section className="hide-scrollbar mobile-only absolute flex w-full flex-nowrap space-x-4 overflow-auto text-nowrap px-4 text-sm">
          {sidebarItems.map((item) => (
            <button
              key={item.text}
              type="button"
              className={cn('pb-3 pt-4', isPageSelected(selectedPage, item.text) ? 'border-b-2 border-black transition-all' : '')}
              onClick={item.onClick}
            >
              {item.text}
            </button>
          ))}
        </section>

        {selectedPage !== 'QUICK_MENU' && (
          <>
            <Filter />
            <Search />
          </>
        )}
      </div>

      <Sidebar items={sidebarItems} />

      <div className="bg-white px-4 py-4 font-semibold">
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
                    <Link to={`/app/business/${businessId}/select-menu/${menuId}`} className="max-w-[150px] truncate" title={menuLayout.data.name}>
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

      <section className="min-h-[100dvh]">
        {selectedPage === 'DISHES' && <DishesManager key={selectedPage} />}
        {selectedPage === 'MAIN_CATEGORY' && isHierarchicalMenu && <ListOfParentCategory />}
        {selectedPage === 'SUB_CATEGORY' && <ListOfChildCategory />}
        {selectedPage === 'ADD_ON' && <ListOfAddOn />}
        {selectedPage === 'QUICK_MENU' && isMenuManager && <QuickMenu isPetpoojaEnabled={isPetpoojaIntegration} />}
      </section>

      {editOpenMenu && (
        <PopUp show={editOpenMenu} onClose={closeEditMenu} hide>
          <section className="hide-scrollbar h-[100dvh] overflow-y-auto pb-[5rem] lg:max-h-[90dvh] lg:min-h-[90dvh]">
            <button className="absolute right-4 top-6 z-50 rounded-full bg-white p-3" type="button" onClick={closeEditMenu}>
              <HiX />
            </button>
            {selectedPage === 'DISHES' && (
              <>
                {permissionLoading ? (
                  <div className="flex h-[70dvh] items-center justify-center">
                    <LoadingSpinner /> <p className="ml-2">Loading permissions...</p>
                  </div>
                ) : posPermission ? (
                  <RestrictedEditDish posPermission={posPermission} />
                ) : (
                  <EditDish />
                )}
              </>
            )}
          </section>
        </PopUp>
      )}

      {openMenu && (
        <PopUp show={openMenu} onClose={closeMenu} hide>
          <section className="hide-scrollbar max-h-[90dvh] min-h-[90dvh] overflow-y-auto pb-[5rem] lg:max-h-[70dvh] lg:min-h-[70dvh]">
            <button className="absolute right-4 top-6 z-50 rounded-full bg-white p-3" type="button" onClick={closeMenu}>
              <HiX />
            </button>
            {selectedPage === 'DISHES' && <CreateDish />}
            {(selectedPage === 'MAIN_CATEGORY' || selectedPage === 'SUB_CATEGORY') && <CreateCategory />}
            {selectedPage === 'ADD_ON' && <AddOnForm />}
          </section>
        </PopUp>
      )}
    </main>
  );
};

const MenuManager = memo(MemoiseManager);
export default MenuManager;
