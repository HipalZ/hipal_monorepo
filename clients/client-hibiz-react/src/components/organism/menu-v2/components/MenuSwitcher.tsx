import { useMenuCreationStore } from '@/components/store/useMenuCreationStore';
import { ChevronDown, Edit, Layers, XCircle } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMenuViewData } from '../hooks/useMenuViewData';
import { useMenuUIStore } from '../store/useMenuUIStore';
import '../styles/brutalist.css';
import { MergeMenusModal } from './modals/MergeMenusModal';

interface MenuSwitcherProps {
  businessId: string | undefined;
}

export const MenuSwitcher = ({ businessId }: MenuSwitcherProps) => {
  const navigate = useNavigate();
  const setSelectedMenuId = useMenuUIStore((s) => s.setSelectedMenuId);
  const selectedMenuId = useMenuUIStore((s) => s.selectedMenuId);
  const mergeMode = useMenuUIStore((s) => s.mergeMode);
  const mergedMenuIds = useMenuUIStore((s) => s.mergedMenuIds);
  const setMergeMode = useMenuUIStore((s) => s.setMergeMode);
  const setMergedMenuIds = useMenuUIStore((s) => s.setMergedMenuIds);

  const { menus } = useMenuViewData({ businessId });
  const [isOpen, setIsOpen] = useState(false);
  const [showMergeModal, setShowMergeModal] = useState(false);
  const [hoveredMenuId, setHoveredMenuId] = useState<string | null>(null);

  const { resetStore, setMenuData, setEditingMenuId, setShowCreationFlow } = useMenuCreationStore((s) => ({
    resetStore: s.resetStore,
    setMenuData: s.setMenuData,
    setEditingMenuId: s.setEditingMenuId,
    setShowCreationFlow: s.setShowCreationFlow,
  }));

  useEffect(() => {
    // If NOT in merge mode and current selection is ALL, auto-select first available menu
    if (!mergeMode && selectedMenuId === 'ALL' && menus.length > 0) {
      setSelectedMenuId(menus[0]._id);
    }
  }, [mergeMode, selectedMenuId, menus, setSelectedMenuId]);

  const options = useMemo(() => {
    return menus.map((m) => ({ value: m._id, label: (m.name || 'UNTITLED').toUpperCase() }));
  }, [menus]);

  // Determine display label
  let selectedLabel = 'SELECT MENU';
  if (mergeMode && selectedMenuId === 'ALL') {
    const names = menus
      .filter((m) => mergedMenuIds.includes(m._id || ''))
      .map((m) => m.name?.slice(0, 3).toUpperCase())
      .join('+');
    selectedLabel = `MERGED: ${names}`;
  } else {
    selectedLabel = options.find((o) => o.value === selectedMenuId)?.label || 'SELECT MENU';
  }

  const handleEditMenu = (e: React.MouseEvent, menuId: string) => {
    e.stopPropagation();
    const menu = menus.find((m) => m._id === menuId);
    if (!menu || !businessId) return;

    resetStore();
    // @ts-ignore
    setMenuData(menu as any);
    setEditingMenuId(menuId);
    setShowCreationFlow(true);
    navigate(`/app/business/${businessId}/select-menu`);
    setIsOpen(false);
  };

  const handleExitMerge = () => {
    setMergeMode(false);
    setMergedMenuIds([]);
    setSelectedMenuId('ALL'); // Reset to ALL (which will now show empty state until menu selected)
  };

  return (
    <div className="relative flex flex-col gap-1">
      <div className="flex items-center justify-between">
        <span className="brutal-body" style={{ fontSize: '0.75rem', fontWeight: 700 }}>
          MENU
        </span>

        {!mergeMode ? (
          <button type="button" onClick={() => setShowMergeModal(true)} className="flex items-center gap-1 text-[10px] font-bold hover:underline">
            <Layers className="h-3 w-3" /> MERGE
          </button>
        ) : (
          <button type="button" onClick={handleExitMerge} className="flex items-center gap-1 text-[10px] font-bold text-red-600 hover:underline">
            <XCircle className="h-3 w-3" /> EXIT MERGE
          </button>
        )}
      </div>

      <div className="relative">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={`brutal-button ${mergeMode ? 'bg-yellow-50' : ''}`}
          style={{
            width: '224px',
            padding: '8px 12px',
            fontSize: '0.875rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            border: mergeMode ? '3px solid #000000' : undefined,
          }}
        >
          <span className="truncate pr-2">{selectedLabel}</span>
          <ChevronDown className="brutal-icon flex-shrink-0" style={{ width: '16px', height: '16px' }} />
        </button>
        {isOpen && (
          <>
            <div
              className="brutal-card absolute z-50 mt-1"
              style={{
                width: '224px',
                border: '3px solid #000000',
                boxShadow: '4px 4px 0px 0px #000000',
              }}
            >
              {options.map((o) => (
                <div
                  key={o.value}
                  className="relative"
                  style={{
                    borderBottom: '2px solid #000000',
                  }}
                  onMouseEnter={() => o.value !== 'ALL' && setHoveredMenuId(o.value)}
                  onMouseLeave={() => setHoveredMenuId(null)}
                >
                  <button
                    type="button"
                    onClick={() => {
                      if (mergeMode) {
                        // Switching menu in merge mode exits merge mode?
                        // Or just switches view?
                        // Requirement: "Remove AUTO merge... ALL should ONLY mean... per-menu"
                        // If user explicitly clicks another menu, we should probably exit merge mode?
                        setMergeMode(false);
                        setMergedMenuIds([]);
                      }
                      setSelectedMenuId(o.value);
                      setIsOpen(false);
                    }}
                    className="brutal-body w-full px-3 py-2 text-left"
                    style={{
                      fontSize: '0.875rem',
                      background: selectedMenuId === o.value ? '#FFEB3B' : '#FFFFFF',
                      fontWeight: selectedMenuId === o.value ? 900 : 600,
                      paddingRight: '12px',
                    }}
                  >
                    {o.label}
                  </button>
                  {o.value !== 'ALL' && hoveredMenuId === o.value && (
                    <button
                      type="button"
                      onClick={(e) => handleEditMenu(e, o.value)}
                      className="brutal-button absolute right-2"
                      style={{
                        width: '28px',
                        height: '28px',
                        padding: 0,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: '#000000',
                        color: '#FFFFFF',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        border: '2px solid #000000',
                      }}
                      title="Edit menu configuration"
                    >
                      <Edit style={{ width: '14px', height: '14px' }} />
                    </button>
                  )}
                </div>
              ))}
            </div>
            <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} style={{ background: 'transparent' }} />
          </>
        )}
      </div>

      <MergeMenusModal isOpen={showMergeModal} onClose={() => setShowMergeModal(false)} menus={menus} />
    </div>
  );
};
