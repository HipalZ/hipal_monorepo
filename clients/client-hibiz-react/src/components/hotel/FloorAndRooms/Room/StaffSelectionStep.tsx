import { useStaffDataStore } from '@/components/store/hotel/useHotelStaff';
import useBusinessData from '@/components/store/useBusinessData';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Label } from '@/components/ui/label';
import { findBusinessRole } from '@/components/utils/helper';
import { useGetAllHotelStaff } from '@/hooks/useHotelStaff';
import { Filter, Search, Users, X } from 'lucide-react';
import { memo, useMemo, useState } from 'react';
import type { StepProps } from './types';

const StaffSelectionStep = ({ formData, toggleStaff }: StepProps) => {
  const businessId = useBusinessData((s) => s.outletInfo?.businessId || s.businessData?._id) as string;
  useGetAllHotelStaff(businessId);
  const staffData = useStaffDataStore((state) => state.staffData);

  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [filterRole, setFilterRole] = useState<string | null>(null);

  const allRoles = useMemo(() => {
    const roleSet = new Set<string>();
    for (const s of staffData) {
      const role = findBusinessRole(s.customRole, businessId)?.role;
      if (role) roleSet.add(role.replace(/_/g, ' '));
    }
    return Array.from(roleSet);
  }, [businessId, staffData]);

  const filteredStaff = useMemo(() => {
    let filtered = [...staffData];
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((s) => s.name.toLowerCase().includes(query) || s.phone?.includes(query));
    }
    if (filterRole) {
      filtered = filtered.filter((s) => findBusinessRole(s.customRole, businessId)?.role.replace(/_/g, ' ') === filterRole);
    }
    return filtered;
  }, [businessId, searchQuery, filterRole, staffData]);

  const isAllSelected = filteredStaff.every((s) => formData.staffIds.includes(s._id));

  const toggleSelectAll = () => {
    const selectedSet = new Set(formData.staffIds);
    if (isAllSelected) {
      // Deselect all
      for (const s of filteredStaff) {
        if (selectedSet.has(s._id)) toggleStaff?.(s._id);
      }
    } else {
      // Select missing ones
      for (const s of filteredStaff) {
        if (!selectedSet.has(s._id)) toggleStaff?.(s._id);
      }
    }
  };

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Assign Staff</h2>
          <p className="text-muted-foreground text-sm leading-tight">Select staff members for this room</p>
        </div>

        {/* Filter + Search Controls */}
        <div className="flex flex-col items-end gap-2">
          <div className="flex gap-2">
            {/* Filter Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Filter className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={() => setFilterRole(null)} className={!filterRole ? 'text-primary font-medium' : ''}>
                  All Roles
                </DropdownMenuItem>
                {allRoles.map((role) => (
                  <DropdownMenuItem key={role} onClick={() => setFilterRole(role)} className={filterRole === role ? 'text-primary font-medium' : ''}>
                    {role}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Search Toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                setShowSearch((prev) => !prev);
                if (showSearch) setSearchQuery('');
              }}
            >
              {showSearch ? <X className="h-5 w-5" /> : <Search className="h-5 w-5" />}
            </Button>
          </div>

          {/* Filter Indicator */}
          {filterRole && (
            <Button variant="outline" className="text-primary bg-primary/10 flex items-center gap-1 rounded-md px-2 py-1 text-sm">
              <span>{filterRole}</span>
              <button type="button" onClick={() => setFilterRole(null)} className="ml-1 hover:text-red-500">
                <X className="h-4 w-4" />
              </button>
            </Button>
          )}
        </div>
      </div>

      {/* Search Input */}
      {showSearch && (
        <input
          type="text"
          placeholder="Search by name or phone"
          className="w-full rounded-md border px-3 py-2"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      )}

      {/* Select All */}
      {filteredStaff.length > 0 && (
        <div className="flex items-center gap-2">
          <Checkbox id="select-all" checked={isAllSelected} onCheckedChange={toggleSelectAll} />
          <Label htmlFor="select-all" className="cursor-pointer">
            Select All
          </Label>
        </div>
      )}

      {/* No Staff */}
      {filteredStaff.length === 0 ? (
        <Card className="p-6 text-center">
          <div className="flex flex-col items-center justify-center space-y-2">
            <Users className="text-muted-foreground h-8 w-8" />
            <h3 className="font-medium">No Staff Members</h3>
            <p className="text-muted-foreground text-sm">No staff members available to assign</p>
          </div>
        </Card>
      ) : (
        <>
          {/* Staff List */}
          <div className="max-h-[400px] space-y-3 overflow-y-auto pb-24 pr-2">
            {filteredStaff.map((staff) => (
              <Card
                key={staff._id}
                className={`cursor-pointer border transition-all ${formData.staffIds.includes(staff._id) ? 'border-primary' : ''}`}
                onClick={() => toggleStaff?.(staff._id)}
              >
                <CardContent className="flex items-center justify-between p-3">
                  <div className="flex items-center space-x-3">
                    <Checkbox
                      id={`staff-${staff._id}`}
                      checked={formData.staffIds.includes(staff._id)}
                      onCheckedChange={() => toggleStaff?.(staff._id)}
                      className="pointer-events-none"
                    />
                    <div>
                      <Label htmlFor={`staff-${staff._id}`} className="cursor-pointer font-medium">
                        {staff.name}
                      </Label>
                      {findBusinessRole(staff.customRole, businessId) && (
                        <div className="text-muted-foreground mt-1 text-xs">
                          {findBusinessRole(staff.customRole, businessId)?.role.replace(/_/g, ' ')}
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Footer */}
          <div className="pt-1">
            <p className="text-sm font-medium">Selected staff: {formData.staffIds.length}</p>
          </div>
        </>
      )}
    </div>
  );
};

export default memo(StaffSelectionStep);
