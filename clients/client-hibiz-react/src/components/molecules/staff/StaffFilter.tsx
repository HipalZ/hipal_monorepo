import AdvancedBottomButton from '@/components/atom/bottomButton/advancedBottomButton';
import PopUp from '@/components/atom/popUp';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { removeUnwanted } from '@/components/utils/helper';
import { useScreenSize } from '@/hooks/useScreenSize';
import { cn } from '@/lib/utils';
import { Check, Filter, SlidersHorizontal } from 'lucide-react';
import { memo, useCallback, useMemo, useState } from 'react';

export interface StaffFilterProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  permissions: { _id: string; name: string }[];
  selectedPermissionIds: string[];
  onSelectedPermissionIdsChange: (ids: string[]) => void;
}

const StaffFilterComponent = ({
  searchTerm,
  onSearchChange,
  permissions,
  selectedPermissionIds,
  onSelectedPermissionIdsChange,
}: StaffFilterProps) => {
  // --- screen size ---
  const screen = useScreenSize();
  const isXs = screen === 'xs'; // assuming your hook returns 'xs' | 'sm' | ...

  const [showPermissionModal, setShowPermissionModal] = useState(false);

  const allSelected = useMemo(
    () => permissions.length > 0 && selectedPermissionIds.length === permissions.length,
    [permissions.length, selectedPermissionIds.length],
  );

  const hasPermissionFilter = selectedPermissionIds.length > 0;

  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onSearchChange(e.target.value);
    },
    [onSearchChange],
  );

  const handleToggleAllPermissions = useCallback(() => {
    if (allSelected) {
      onSelectedPermissionIdsChange([]);
    } else {
      onSelectedPermissionIdsChange(permissions.map((p) => p._id));
    }
  }, [allSelected, onSelectedPermissionIdsChange, permissions]);

  const handleTogglePermission = useCallback(
    (id: string) => {
      if (selectedPermissionIds.includes(id)) {
        onSelectedPermissionIdsChange(selectedPermissionIds.filter((pId) => pId !== id));
      } else {
        onSelectedPermissionIdsChange([...selectedPermissionIds, id]);
      }
    },
    [onSelectedPermissionIdsChange, selectedPermissionIds],
  );

  const closePermissionModal = useCallback(() => {
    setShowPermissionModal(false);
  }, []);

  return (
    <section className="mb-4 rounded-2xl border bg-white/80 p-3 shadow-sm backdrop-blur-sm">
      {/* Top row: search */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-2">
          <Filter className="text-muted-foreground h-4 w-4" />
          <span className="text-muted-foreground text-sm font-semibold">Filter Staff</span>
          {hasPermissionFilter && <span className="ml-1 inline-flex h-2 w-2 rounded-full bg-red-500" />}
        </div>

        <Input value={searchTerm} onChange={handleSearchChange} placeholder="Search by name, mobile, or role" className="h-9 max-w-md" />
      </div>

      {/* Permissions */}
      <div className="mt-3">
        <div className="mb-2 flex items-center justify-between gap-2">
          <span className="text-muted-foreground text-xs font-medium">Filter by permissions (multi-select)</span>

          {isXs ? (
            // Mobile (xs) — open modal
            <button
              type="button"
              onClick={() => setShowPermissionModal(true)}
              className="text-muted-foreground hover:bg-muted/60 relative flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-medium"
            >
              <SlidersHorizontal className="h-3 w-3" />
              <span>{hasPermissionFilter ? `${selectedPermissionIds.length} selected` : 'Open permissions'}</span>
              {hasPermissionFilter && <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-red-500" />}
            </button>
          ) : (
            // Desktop / tablet — inline "Select All" button
            <Button type="button" size="sm" variant="outline" onClick={handleToggleAllPermissions} className="h-7 px-2 text-xs">
              {allSelected && permissions.length > 0 && <Check className="mr-1 h-3 w-3" />}
              {allSelected ? 'Deselect All' : 'Select All'}
            </Button>
          )}
        </div>

        {/* Inline permissions only for non-xs */}
        {!isXs && (
          <ScrollArea className="bg-muted/40 max-h-36 rounded-md border p-1">
            {permissions.length === 0 ? (
              <p className="text-muted-foreground px-1 py-2 text-xs">Permissions not loaded</p>
            ) : (
              <div className="flex flex-wrap gap-1.5">
                {permissions.map((perm) => {
                  const isSelected = selectedPermissionIds.includes(perm._id);
                  return (
                    <Button key={perm._id} onClick={() => handleTogglePermission(perm._id)} size="sm" variant={isSelected ? 'default' : 'outline'}>
                      {isSelected && <Check className="h-3 w-3" />}
                      <span className="max-w-[140px] truncate">{removeUnwanted(perm.name)}</span>
                    </Button>
                  );
                })}
              </div>
            )}
          </ScrollArea>
        )}
      </div>

      {/* MOBILE PERMISSION MODAL (xs) */}
      {isXs && showPermissionModal && (
        <PopUp rightTopBack hide height="h-[85dvh]" show={showPermissionModal} onClose={() => setShowPermissionModal(false)}>
          <div className="w-full rounded-2xl bg-white p-4">
            <h2 className="mb-4 text-sm font-semibold">Filter by permissions</h2>

            <section className="hide-scrollbar h-[70dvh] overflow-auto rounded-md pb-20">
              {permissions.length === 0 ? (
                <p className="text-muted-foreground px-1 py-2 text-xs">Permissions not loaded</p>
              ) : (
                <div className="grid h-[85dvh] grid-cols-2 gap-1 overflow-auto">
                  {permissions.map((perm) => {
                    const isSelected = selectedPermissionIds.includes(perm._id);
                    return (
                      <Button
                        key={perm._id}
                        type="button"
                        onClick={() => handleTogglePermission(perm._id)}
                        variant={isSelected ? 'default' : 'outline'}
                        size="lg"
                        className={cn('relative h-[3rem] w-full justify-start text-wrap text-sm')}
                      >
                        {isSelected && <Check className="absolute left-2 mr-1 h-3 w-3" />}
                        {removeUnwanted(perm.name)}
                      </Button>
                    );
                  })}
                </div>
              )}
            </section>
          </div>

          <AdvancedBottomButton
            fixed
            maxWidth="30rem"
            buttons={[
              {
                text: 'Close',
                onClick: closePermissionModal,
              },
              {
                text: allSelected ? 'Deselect All' : 'Select All',
                onClick: handleToggleAllPermissions,
                className: 'rounded-md',
              },
            ]}
          />
        </PopUp>
      )}
    </section>
  );
};

export const StaffFilter = memo(StaffFilterComponent);
export default StaffFilter;
