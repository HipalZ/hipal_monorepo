import PopUp from '@/components/atom/popUp/index.tsx';
import type { IService } from '@/components/store/hotel/useHotelServices.ts';
import useStaffStore, { type IStaffMember } from '@/components/store/hotel/useHotelStaff';
import useBusinessData from '@/components/store/useBusinessData';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { findRole } from '@/components/utils/helper';
import {
  type IHotel_Roll,
  type IHotelRoll,
  type IHotelStaff,
  useDeleteStaffFromHotel,
  useGetAllHotelServices,
  useGetAllHotelStaff,
} from '@/hooks/useHotelStaff';
import { BadgeAlert, Edit, MoreVertical, Phone, Plus, Trash, User, UserCircle } from 'lucide-react';
import { useCallback, useMemo, useState } from 'react';
import BulkEscalationAssignmentPanel from './BulkEscalation.tsx';
import EscalationAssignmentModal from './EscalationAssignmentModal';

const roleBadgeColors: Record<string, string> = {
  MANAGER: 'bg-purple-100 text-purple-800 hover:bg-purple-100',
  FRONT_OFFICE: 'bg-blue-100 text-blue-800 hover:bg-blue-100',
  RECEPTIONIST: 'bg-amber-100 text-amber-800 hover:bg-amber-100',
  MAINTENANCE: 'bg-orange-100 text-orange-800 hover:bg-orange-100',
  ELECTRICIAN: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100',
  PLUMBER: 'bg-cyan-100 text-cyan-800 hover:bg-cyan-100',
  SECURITY: 'bg-red-100 text-red-800 hover:bg-red-100',
  HOUSEKEEPING: 'bg-green-100 text-green-800 hover:bg-green-100',
  CLEANER: 'bg-emerald-100 text-emerald-800 hover:bg-emerald-100',
  LAUNDRY: 'bg-sky-100 text-sky-800 hover:bg-sky-100',
  WAITER: 'bg-indigo-100 text-indigo-800 hover:bg-indigo-100',
  KITCHEN: 'bg-rose-100 text-rose-800 hover:bg-rose-100',
};

const getBadgeColor = (role: string) => roleBadgeColors[role] || 'bg-gray-100 text-gray-800 hover:bg-gray-100';

const HotelStaffMain = () => {
  const businessId = useBusinessData((s) => s.outletInfo?.businessId);
  const { staffLoading, staffData = [] } = useGetAllHotelStaff(businessId as string);
  const { deleteStaffLoader, deleteStaff } = useDeleteStaffFromHotel();
  const [escalationModalOpen, setEscalationModalOpen] = useState(false);
  const [selectedStaffForEscalation, setSelectedStaffForEscalation] = useState<IStaffMember | null>(null);

  const { hotelServicesData } = useGetAllHotelServices(businessId as string);

  const [bulkModalOpen, setBulkModalOpen] = useState(false);

  const setStaffModal = useStaffStore((s) => s.setStaffModal);
  const initializeFormForEdit = useStaffStore((s) => s.initializeFormForEdit);
  const setEditRoleStr = useStaffStore((s) => s.setEditRoleStr);
  const setEditServiceIds = useStaffStore((s) => s.setEditServiceIds);

  // 🔎 New state for filters
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('ALL');
  const [serviceFilter, setServiceFilter] = useState<string>('ALL');

  const allServices = useMemo(() => {
    if (!hotelServicesData) return [];
    return hotelServicesData;
  }, [hotelServicesData]);

  // 🔎 Filter logic
  const filteredStaff = staffData.filter((staff: IHotelStaff) => {
    const matchesSearch = staff?.name?.toLowerCase().includes(searchTerm.toLowerCase()) || staff?.phone?.includes(searchTerm);

    const matchesRole = roleFilter === 'ALL' || staff?.customRole?.some((r) => r?.role === roleFilter);

    const matchesService = serviceFilter === 'ALL' || staff?.customRole?.some((r) => (r?.serviceIds || []).includes(serviceFilter));

    return matchesSearch && matchesRole && matchesService;
  });

  const handleEditStaff = useCallback(
    (staff: IStaffMember) => {
      initializeFormForEdit(staff);
      const role = findRole(staff.customRole, businessId) as IHotelRoll;
      setEditRoleStr(role);
      const serviceIds = findRole(staff.customRole, businessId)?.serviceIds || [];
      if (serviceIds?.length > 0) setEditServiceIds(serviceIds);
      setStaffModal(true);
    },
    [initializeFormForEdit, setEditRoleStr, setEditServiceIds, setStaffModal, businessId],
  );

  const handleDeleteStaff = useCallback(
    (id: string) => {
      deleteStaff(id);
    },
    [deleteStaff],
  );

  const handleAddStaff = useCallback(() => setStaffModal(true), [setStaffModal]);

  const escalationAssign = useCallback((staff: IStaffMember) => {
    setSelectedStaffForEscalation(staff);
    setEscalationModalOpen(true);
  }, []);

  const handleCloseEscalationModal = useCallback(() => {
    setEscalationModalOpen(false);
    setSelectedStaffForEscalation(null);
  }, []);

  const renderSkeletons = () =>
    Array(3)
      .fill(0)
      .map((_, index) => (
        <Card key={index} className="mb-4">
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-3">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-3 w-32" />
                </div>
              </div>
              <Skeleton className="h-8 w-8 rounded-md" />
            </div>
            <div className="mt-3">
              <Skeleton className="h-5 w-20" />
            </div>
          </CardContent>
        </Card>
      ));

  const renderEmptyState = () => (
    <Card className="mt-8 p-8 text-center">
      <div className="flex flex-col items-center justify-center space-y-3">
        <User className="text-muted-foreground h-12 w-12" />
        <h3 className="text-lg font-medium">No staff members yet</h3>
        <p className="text-muted-foreground text-sm">Add staff members to help manage your hotel operations</p>
        <Button onClick={handleAddStaff} className="mt-2">
          <User className="mr-2 h-4 w-4" />
          Add Staff
        </Button>
      </div>
    </Card>
  );

  return (
    <div className="mx-auto p-4">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-bold">Hotel Staff ({filteredStaff.length})</h2>

        {staffData.length > 0 && (
          <Button variant="default" onClick={() => setBulkModalOpen(true)} className="flex items-center gap-2 text-white">
            <Plus className="h-4 w-4" />
            Add to Escalation
          </Button>
        )}
      </div>

      <Input placeholder="Search staff by name or phone..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full" />

      <div className="my-4 flex gap-3 md:items-center">
        {/* Role filter */}
        <div className="relative">
          <Select value={roleFilter} onValueChange={setRoleFilter}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Filter by Role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Roles</SelectItem>
              {Object.keys(roleBadgeColors).map((role) => (
                <SelectItem key={role} value={role}>
                  {role.replace(/_/g, ' ')}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {roleFilter !== 'ALL' && (
            <span className="absolute -right-1 -top-1 flex h-3 w-3">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-500 opacity-75" />
              <span className="relative inline-flex h-3 w-3 rounded-full bg-red-600" />
            </span>
          )}
        </div>

        <div className="relative">
          <Select value={serviceFilter} onValueChange={setServiceFilter}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Filter by Service" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Services</SelectItem>
              {allServices.map((service: IService) => (
                <SelectItem key={service._id} value={service._id}>
                  {service.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {serviceFilter !== 'ALL' && (
            <span className="absolute -right-1 -top-1 flex h-3 w-3">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-500 opacity-75" />
              <span className="relative inline-flex h-3 w-3 rounded-full bg-red-600" />
            </span>
          )}
        </div>
      </div>

      {staffLoading || deleteStaffLoader ? (
        renderSkeletons()
      ) : filteredStaff.length ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredStaff.map((staff: IHotelStaff) => (
            <Card key={staff._id} className="overflow-hidden">
              <CardContent className="p-0">
                <div className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="bg-primary/10 rounded-full p-2">
                        <UserCircle className="text-primary h-8 w-8" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold">{staff?.name}</h3>
                        <div className="text-muted-foreground flex items-center">
                          <Phone className="mr-1 h-3 w-3" />
                          <span className="text-sm">{staff?.phone}</span>
                        </div>
                      </div>
                    </div>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-5 w-5" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleEditStaff(staff as IHotelStaff)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDeleteStaff(staff?._id)} className="text-destructive focus:text-destructive">
                          <Trash className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => escalationAssign(staff as IHotelStaff)}>
                          <BadgeAlert className="mr-2 h-4 w-4" />
                          Assign to Escalation
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>

                {staff?.customRole?.length > 0 && (
                  <>
                    <Separator />
                    <div className="bg-muted/30 p-4 pt-3">
                      <div className="flex flex-wrap gap-2">
                        {staff?.customRole?.map((role: IHotel_Roll) => (
                          <div key={role._id} className="flex flex-col">
                            <Badge variant="secondary" className={getBadgeColor(role?.role)}>
                              {role.role.replace(/_/g, ' ')}
                            </Badge>
                            {role?.nickName && <span className="text-muted-foreground mt-1 text-xs">Nickname: {role?.nickName}</span>}
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        renderEmptyState()
      )}

      {/* Single-user escalation modal */}
      {escalationModalOpen && (
        <PopUp
          show={escalationModalOpen}
          rightTopBack
          onClose={handleCloseEscalationModal}
          height="h-[100dvh] lg:h-[90dvh]"
          title="Assign staff to escalation"
          description="Choose escalation levels and handoff timings for the selected hotel staff member."
        >
          <EscalationAssignmentModal
            isOpen={escalationModalOpen}
            onClose={handleCloseEscalationModal}
            staff={selectedStaffForEscalation as IHotelStaff}
          />
        </PopUp>
      )}

      {/* Bulk add to escalation modal */}
      {bulkModalOpen && (
        <PopUp
          show={bulkModalOpen}
          rightTopBack
          onClose={() => setBulkModalOpen(false)}
          height="h-[100dvh] lg:h-[90dvh]"
          title="Add staff to escalation"
          description="Select multiple hotel staff members and add them to an escalation level."
        >
          <BulkEscalationAssignmentPanel
            onClose={() => setBulkModalOpen(false)}
            staffList={staffData}
          />
        </PopUp>
      )}
    </div>
  );
};

export default HotelStaffMain;
