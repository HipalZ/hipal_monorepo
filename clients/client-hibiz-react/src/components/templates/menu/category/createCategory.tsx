import Hi from '@/assets/svg/hi.svg';
import MemoizedHeader from '@/components/molecules/header';
import useMenuPageStore from '@/components/store/useMenuStorage';
import { memo, useCallback } from 'react';
import { FaArrowLeft } from 'react-icons/fa';
import LinkItems from '../dish/[editDish]/linkItems';
import AddCatImage from './addCatImage';
import CategoryMainForm from './categoryMainForm';
import EditMainCategory from './editCategory';
import SelectCategory from './selectCategory';
import SelectSubCategory from './selectSubCategory';

const CreateCategoryMain = () => {
  const setOpenMenu = useMenuPageStore((s) => s.setOpenMenu);
  const categoryStep = useMenuPageStore((s) => s.categoryStep);
  const setCategoryStep = useMenuPageStore((s) => s.setCategoryStep);
  const catId = useMenuPageStore((s) => s.catId);
  const isMainEditing = useMenuPageStore((s) => s.editingMainCat);
  const isSubCategoryEditing = useMenuPageStore((s) => s.editingSubCat);
  const openMenu = useMenuPageStore((s) => s.openMenu);
  const setIsCatDelete = useMenuPageStore((s) => s.setIsCatDelete);
  const isCatDelete = useMenuPageStore((s) => s.isCatDelete);
  const categoryName = useMenuPageStore((s) => s.categoryName);

  const goBack = useCallback(() => {
    if (isMainEditing) {
      if (categoryStep === 'EDIT_MAIN_CATEGORY') {
        setOpenMenu(false);
        return;
      }
      if (categoryStep === 'LINK_MAIN_CATEGORY' || categoryStep === 'LINK_SUB_CATEGORY') {
        setCategoryStep('EDIT_MAIN_CATEGORY');
        return;
      }
    }

    if (isSubCategoryEditing) {
      setIsCatDelete(false);
      if (categoryStep === 'LINK_SUB_CATEGORY') {
        setOpenMenu(false);
        return;
      }
      if (categoryStep === 'LINK_MAIN_CATEGORY' || categoryStep === 'LINK_SUB_CATEGORY') {
        setCategoryStep('EDIT_SUB_CATEGORY');
        return;
      }
      if (categoryStep === 'LINK_DISH') {
        setCategoryStep('EDIT_SUB_CATEGORY');
        return;
      }
    }

    switch (categoryStep) {
      case 'CATEGORY_STEP_1':
        setOpenMenu(false);
        break;
      case 'CATEGORY_STEP_2':
        setCategoryStep('CATEGORY_STEP_1');
        break;
      case 'CATEGORY_STEP_3':
        setCategoryStep('CATEGORY_STEP_2');
        break;
      case 'LINK_MAIN_CATEGORY':
      case 'LINK_SUB_CATEGORY':
        setCategoryStep('CATEGORY_STEP_1');
        break;
      case 'LINK_DISH':
        setCategoryStep('CATEGORY_STEP_1');
        break;
      default:
        setOpenMenu(false);
        break;
    }
  }, [categoryStep, isMainEditing, openMenu, isCatDelete]);

  return (
    <>
      <header className="bg-base-100 sticky top-0 z-10 w-full rounded-t-2xl">
        <MemoizedHeader title={catId !== '' ? `${categoryName}` : 'Create Category'} onBack={goBack} leftIcon={<FaArrowLeft />} rightImage={Hi} />
      </header>
      {categoryStep === 'CATEGORY_STEP_1' && <CategoryMainForm />}
      {categoryStep === 'LINK_MAIN_CATEGORY' && <SelectCategory />}
      {categoryStep === 'LINK_SUB_CATEGORY' && <SelectSubCategory />}
      {categoryStep === 'CATEGORY_STEP_2' && <AddCatImage />}
      {(categoryStep === 'EDIT_MAIN_CATEGORY' || categoryStep === 'EDIT_SUB_CATEGORY') && <EditMainCategory />}
      {categoryStep === 'LINK_DISH' && <LinkItems />}
    </>
  );
};
const CreateCategory = memo(CreateCategoryMain);
export default CreateCategory;
