// HotelStaffMain.tsx
"use client";

import useBusinessData from "@/components/store/useBusinessData";
import {
  type IHotel_Roll,
  type IHotelRoll,
  type IHotelStaff,
  useDeleteStaffFromHotel,
  useGetAllHotelStaff,
} from "@/hooks/useHotelStaff";
import {
  BadgeAlert,
  Edit,
  MoreVertical,
  Phone,
  Trash,
  User,
  UserCircle,
  Plus,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import useStaffStore, {
  type IStaffMember,
} from "@/components/store/hotel/useHotelStaff";
import { useCallback, useState } from "react";
import EscalationAssignmentModal from "./EscalationAssignmentModal";
import PopUp from "@/components/atom/popUp/index.tsx";
import BulkEscalationAssignmentPanel from "./BulkEscalation.tsx";

const roleBadgeColors: Record<string, string> = {
  MANAGER: "bg-purple-100 text-purple-800 hover:bg-purple-100",
  FRONT_OFFICE: "bg-blue-100 text-blue-800 hover:bg-blue-100",
  RECEPTIONIST: "bg-amber-100 text-amber-800 hover:bg-amber-100",
  MAINTENANCE: "bg-orange-100 text-orange-800 hover:bg-orange-100",
  ELECTRICIAN: "bg-yellow-100 text-yellow-800 hover:bg-yellow-100",
  PLUMBER: "bg-cyan-100 text-cyan-800 hover:bg-cyan-100",
  SECURITY: "bg-red-100 text-red-800 hover:bg-red-100",
  HOUSEKEEPING: "bg-green-100 text-green-800 hover:bg-green-100",
  CLEANER: "bg-emerald-100 text-emerald-800 hover:bg-emerald-100",
  LAUNDRY: "bg-sky-100 text-sky-800 hover:bg-sky-100",
  WAITER: "bg-indigo-100 text-indigo-800 hover:bg-indigo-100",
  KITCHEN: "bg-rose-100 text-rose-800 hover:bg-rose-100",
};

const getBadgeColor = (role: string) =>
  roleBadgeColors[role] || "bg-gray-100 text-gray-800 hover:bg-gray-100";

const HotelStaffMain = () => {
  const businessId = useBusinessData((s) => s.outletInfo?.businessId);
  const { staffLoading, staffData = [] } = useGetAllHotelStaff(
    businessId as string,
  );
  const { deleteStaffLoader, deleteStaff } = useDeleteStaffFromHotel();

  const setStaffModal = useStaffStore((s) => s.setStaffModal);
  const initializeFormForEdit = useStaffStore((s) => s.initializeFormForEdit);
  const setEditRoleStr = useStaffStore((s) => s.setEditRoleStr);
  const setEditServiceIds = useStaffStore((s) => s.setEditServiceIds);

  const [escalationModalOpen, setEscalationModalOpen] = useState(false);
  const [selectedStaffForEscalation, setSelectedStaffForEscalation] =
    useState<IStaffMember | null>(null);

  const [bulkModalOpen, setBulkModalOpen] = useState(false);

  const handleEditStaff = useCallback(
    (staff: IStaffMember) => {
      initializeFormForEdit(staff);
      const role = staff?.customRole?.[0]?.role as IHotelRoll;
      setEditRoleStr(role);
      const serviceIds = (staff?.customRole?.[0] as any)?.serviceIds || [];
      if (serviceIds?.length > 0) setEditServiceIds(serviceIds);
      setStaffModal(true);
    },
    [initializeFormForEdit, setEditRoleStr, setEditServiceIds, setStaffModal],
  );

  const handleDeleteStaff = useCallback(
    (id: string) => {
      deleteStaff(id);
    },
    [deleteStaff],
  );

  const handleAddStaff = useCallback(
    () => setStaffModal(true),
    [setStaffModal],
  );

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
                <Skeleton className="w-10 h-10 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="w-24 h-4" />
                  <Skeleton className="w-32 h-3" />
                </div>
              </div>
              <Skeleton className="w-8 h-8 rounded-md" />
            </div>
            <div className="mt-3">
              <Skeleton className="w-20 h-5" />
            </div>
          </CardContent>
        </Card>
      ));

  const renderEmptyState = () => (
    <Card className="p-8 mt-8 text-center">
      <div className="flex flex-col items-center justify-center space-y-3">
        <User className="w-12 h-12 text-muted-foreground" />
        <h3 className="text-lg font-medium">No staff members yet</h3>
        <p className="text-sm text-muted-foreground">
          Add staff members to help manage your hotel operations
        </p>
        <Button onClick={handleAddStaff} className="mt-2">
          <User className="w-4 h-4 mr-2" />
          Add Staff
        </Button>
      </div>
    </Card>
  );

  return (
    <div className=" p-4 mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Hotel Staff</h2>

        <div className="flex items-center gap-3">
          {/* Show "Add to Escalation" only if there is at least one staff */}
          {staffData.length > 0 && (
            <Button
              variant="default"
              onClick={() => setBulkModalOpen(true)}
              className="flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add to Escalation
            </Button>
          )}
          <Badge variant="outline" className="px-3 py-1">
            {staffData.length} Staff
          </Badge>
        </div>
      </div>

      {staffLoading || deleteStaffLoader ? (
        renderSkeletons()
      ) : staffData.length ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {staffData.map((staff: IHotelStaff) => (
            <Card key={staff._id} className="overflow-hidden">
              <CardContent className="p-0">
                <div className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 rounded-full bg-primary/10">
                        <UserCircle className="w-8 h-8 text-primary" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold">{staff?.name}</h3>
                        <div className="flex items-center text-muted-foreground">
                          <Phone className="w-3 h-3 mr-1" />
                          <span className="text-sm">{staff?.phone}</span>
                        </div>
                      </div>
                    </div>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="w-5 h-5" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => handleEditStaff(staff as any)}
                        >
                          <Edit className="w-4 h-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDeleteStaff(staff?._id)}
                          className="text-destructive focus:text-destructive"
                        >
                          <Trash className="w-4 h-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => escalationAssign(staff as any)}
                        >
                          <BadgeAlert className="w-4 h-4 mr-2" />
                          Assign to Escalation
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>

                {staff?.customRole?.length > 0 && (
                  <>
                    <Separator />
                    <div className="p-4 pt-3 bg-muted/30">
                      <div className="flex flex-wrap gap-2">
                        {staff?.customRole?.map((role: IHotel_Roll) => (
                          <div key={role._id} className="flex flex-col">
                            <Badge
                              variant="secondary"
                              className={getBadgeColor(role?.role)}
                            >
                              {role.role.replace(/_/g, " ")}
                            </Badge>
                            {role?.nickName && (
                              <span className="mt-1 text-xs text-muted-foreground">
                                Nickname: {role?.nickName}
                              </span>
                            )}
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
        >
          <EscalationAssignmentModal
            isOpen={escalationModalOpen}
            onClose={handleCloseEscalationModal}
            staff={selectedStaffForEscalation as any}
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
