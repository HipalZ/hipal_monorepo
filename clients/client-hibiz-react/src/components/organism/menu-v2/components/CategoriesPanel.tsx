import useBusinessData from '@/components/store/useBusinessData';
import { useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { HiPlus } from 'react-icons/hi';
import { DraftOpsRepository } from '../db/DraftOpsRepository';
import { useMenuViewData } from '../hooks/useMenuViewData';
import '../styles/brutalist.css';
import type { MenuCategory, MenuLayout } from '../types';
import { CategoryRow } from './CategoryRow';
import { ParentCategoryRow } from './ParentCategoryRow';
import { CategoryEditModal } from './modals/CategoryEditModal';
import { CategoryModalV2 } from './modals/CategoryModalV2';

export const CategoriesPanel = () => {
  const businessId = useBusinessData((s) => s.outletInfo?.businessId);
  const { parentCategories, childCategories, dishCountByCategoryId, menus, selectedMenuId } = useMenuViewData({ businessId });
  const [search, setSearch] = useState('');
  const [innerTab, setInnerTab] = useState<'parent' | 'child'>('child');
  const [editingCategory, setEditingCategory] = useState<MenuCategory | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [createHierarchy, setCreateHierarchy] = useState<'PARENT' | 'CHILD'>('PARENT');

  // Get selected menu's menuType to determine category filtering
  const selectedMenu = useMemo<MenuLayout | null>(() => {
    if (selectedMenuId === 'ALL' || !menus) return null;
    return menus.find((m) => m._id === selectedMenuId) || null;
  }, [menus, selectedMenuId]);

  // For menuType 2 (SUB_DISH), only show child categories. For menuType 1, show parent-child hierarchy
  const displayParentCategories = useMemo(() => {
    if (!selectedMenu) return parentCategories;
    // If menuType is 2 (SUB_DISH), don't show parent categories in parent tab
    if (selectedMenu.menuType === 2) return [];
    return parentCategories;
  }, [parentCategories, selectedMenu]);

  const displayChildCategories = useMemo(() => {
    if (!selectedMenu) return childCategories;
    // If menuType is 2 (SUB_DISH), show all child categories. If menuType is 1, show only children with parents
    if (selectedMenu.menuType === 2) return childCategories;
    return childCategories;
  }, [childCategories, selectedMenu]);

  const filteredParents = useMemo(() => {
    if (!search.trim()) return displayParentCategories;
    const q = search.toLowerCase();
    return displayParentCategories.filter((c) => c.name?.toLowerCase().includes(q));
  }, [displayParentCategories, search]);

  const filteredChildren = useMemo(() => {
    if (!search.trim()) return displayChildCategories;
    const q = search.toLowerCase();
    return displayChildCategories.filter((c) => c.name?.toLowerCase().includes(q));
  }, [displayChildCategories, search]);

  // Get child categories for each parent
  const getChildCategoriesForParent = (parentId: string): MenuCategory[] => {
    return filteredChildren.filter((c) => c.parentId === parentId || c.parentCategoryIds?.includes(parentId));
  };

  const handleToggleVisibility = async (categoryId: string, visibility: boolean) => {
    if (!businessId) return;
    try {
      await DraftOpsRepository.updateCategory(categoryId, businessId, { visibility });
      toast.success('Visibility updated');
    } catch (error) {
      toast.error('Failed to update visibility');
    }
  };

  return (
    <div className="brutal-card">
      <div className="flex flex-wrap items-center gap-3 px-4 py-3" style={{ borderBottom: '3px solid #000000' }}>
        <input
          type="text"
          placeholder="SEARCH CATEGORIES"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="brutal-input"
          style={{ width: '256px', padding: '8px 12px', fontSize: '0.875rem' }}
        />

        {/* Show Parent button only if menuType === 1 */}
        {selectedMenu?.menuType === 1 && (
          <button
            type="button"
            onClick={() => {
              setCreateHierarchy('PARENT');
              setIsCreateModalOpen(true);
            }}
            disabled={selectedMenuId === 'ALL'}
            className="brutal-button-primary bg-yellow-400 text-xs disabled:opacity-50"
            style={{ padding: '8px 16px', fontWeight: 800 }}
          >
            <HiPlus className="mr-1 inline h-4 w-4" /> ADD PARENT CATEGORY
          </button>
        )}

        {/* Show Child button for both menuType 1 and 2 */}
        {selectedMenu && selectedMenu.menuType !== 2 && (
          <button
            type="button"
            onClick={() => {
              setCreateHierarchy('PARENT');
              setIsCreateModalOpen(true);
            }}
            disabled={selectedMenuId === 'ALL'}
            className="brutal-button-primary bg-yellow-400 text-xs disabled:opacity-50"
            style={{ padding: '8px 16px', fontWeight: 800 }}
          >
            <HiPlus className="mr-1 inline h-4 w-4" /> ADD PARENT CATEGORY
          </button>
        )}
        {selectedMenu && (
          <button
            type="button"
            onClick={() => {
              setCreateHierarchy('CHILD');
              setIsCreateModalOpen(true);
            }}
            disabled={selectedMenuId === 'ALL'}
            className="brutal-button-primary bg-yellow-400 text-xs disabled:opacity-50"
            style={{ padding: '8px 16px', fontWeight: 800 }}
          >
            <HiPlus className="mr-1 inline h-4 w-4" /> ADD CHILD CATEGORY
          </button>
        )}
      </div>

      <div className="mx-4 mt-3 flex gap-0" style={{ background: '#FFFFFF', border: '3px solid #000000', display: 'inline-flex' }}>
        {selectedMenu && selectedMenu.menuType !== 2 && (
          <button
            type="button"
            onClick={() => setInnerTab('parent')}
            className="brutal-button"
            style={{
              padding: '8px 16px',
              fontSize: '0.875rem',
              background: innerTab === 'parent' ? '#FFEB3B' : '#FFFFFF',
              borderRight: '3px solid #000000',
            }}
          >
            PARENT CATEGORY
          </button>
        )}
        <button
          type="button"
          onClick={() => setInnerTab('child')}
          className="brutal-button"
          style={{
            padding: '8px 16px',
            fontSize: '0.875rem',
            background: innerTab === 'child' ? '#FFEB3B' : '#FFFFFF',
            borderRight: selectedMenu && selectedMenu.menuType !== 2 ? '3px solid #000000' : 'none',
          }}
        >
          CHILD CATEGORY
        </button>
      </div>

      {innerTab === 'parent' && (
        <div className="max-h-[620px] overflow-y-auto px-4 py-3">
          {filteredParents.length === 0 ? (
            <div className="brutal-body flex h-48 items-center justify-center" style={{ fontSize: '0.875rem' }}>
              NO PARENT CATEGORIES
            </div>
          ) : (
            <div className="space-y-2">
              <div className="brutal-table-header grid grid-cols-7 gap-4 px-3 pb-2" style={{ fontSize: '0.75rem', letterSpacing: '0.05em' }}>
                <span>PARENT NAME</span>
                <span>CHILD CATEGORIES</span>
                <span>LINKED STATUS</span>
                <span>DATES</span>
                <span>VISIBILITY</span>
                <span />
                <span>ACTIONS</span>
              </div>
              {filteredParents.map((cat) => {
                const childCategories = getChildCategoriesForParent(cat._id);
                return (
                  <ParentCategoryRow
                    key={cat._id}
                    category={cat}
                    childCategories={childCategories}
                    dishCountByCategoryId={dishCountByCategoryId}
                    businessId={businessId || ''}
                    onEdit={setEditingCategory}
                    onToggleVisibility={handleToggleVisibility}
                  />
                );
              })}
            </div>
          )}
        </div>
      )}

      {innerTab === 'child' && (
        <div className="max-h-[620px] overflow-y-auto px-4 py-3">
          {filteredChildren.length === 0 ? (
            <div className="brutal-body flex h-48 items-center justify-center" style={{ fontSize: '0.875rem' }}>
              NO CATEGORIES
            </div>
          ) : (
            <div className="space-y-2">
              <div className="brutal-table-header grid grid-cols-6 gap-4 px-3 pb-2" style={{ fontSize: '0.75rem', letterSpacing: '0.05em' }}>
                <span>NAME</span>
                <span>PARENT</span>
                <span>DISH COUNT</span>
                <span>DATES</span>
                <span>VISIBILITY</span>
                <span>ACTIONS</span>
              </div>
              {filteredChildren.map((cat) => {
                const dishCount = dishCountByCategoryId.get(cat._id || '') || 0;
                const parentName =
                  parentCategories.find((p) => p._id === cat.parentId || cat.parentCategoryIds?.includes(p._id))?.name || 'Unassigned';
                return (
                  <CategoryRow
                    key={cat._id}
                    category={cat}
                    dishCount={dishCount}
                    businessId={businessId || ''}
                    onEdit={setEditingCategory}
                    onToggleVisibility={handleToggleVisibility}
                    parentName={parentName}
                  />
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Create Category Modal V2 */}
      <CategoryModalV2
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        category={null}
        hierarchy={createHierarchy}
        businessId={businessId || ''}
        selectedMenuId={selectedMenuId}
        menuLayout={selectedMenu || undefined}
        allParentCategories={parentCategories}
        allChildCategories={childCategories}
        isMergeMode={false}
      />

      {/* Edit Category Modal */}
      {editingCategory && (
        <CategoryEditModal
          category={editingCategory}
          isOpen={!!editingCategory}
          onClose={() => setEditingCategory(null)}
          businessId={businessId || ''}
        />
      )}
    </div>
  );
};
