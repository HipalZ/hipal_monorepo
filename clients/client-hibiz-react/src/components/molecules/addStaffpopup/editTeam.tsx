import { memo, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { RiDeleteBin5Line } from "react-icons/ri";
import { MdEdit } from "react-icons/md";
import { apiRpc } from "@hi/common";
import { useAddStaffStore } from "@/components/store/useAddStaffStore";
import useBusinessData from "@/components/store/useBusinessData";
import BottomButton from "@/components/atom/bottomButton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { removeUnwanted } from "@/components/utils/helper";

const MemoiseEditTeam = () => {
  const queryClient = useQueryClient();
  const {
    name,
    phone,
    selectedRole,
    setPageToggle,
    editStaffId,
    setIsEditing,
    setIsEditStaffOpen,
    selectedPermissions,
    permissions,
    removeStaffStore,
  } = useAddStaffStore();

  const businessData = useBusinessData((s) => s.businessData);

  const deleteStaff = useCallback(async () => {
    if (!window.confirm("Are you sure you want to delete this staff member?")) {
      return;
    }
    try {
      const res = await apiRpc.users[":staffId"][":businessId"].$delete({
        param: {
          staffId: editStaffId,
          businessId: businessData?._id || "",
        },
        json: {},
      });

      if (res.status === 200 || res.status === 201) {
        setIsEditStaffOpen(false);
        setIsEditing(false);
        toast.success("Staff deleted successfully");
        queryClient.invalidateQueries({ queryKey: ["getStaffs"] });
      } else {
        throw new Error("Failed to delete staff");
      }
    } catch (error) {
      toast.error("Failed to delete staff");
    }
  }, [
    editStaffId,
    queryClient,
    setIsEditStaffOpen,
    setIsEditing,
    businessData?._id,
  ]);

  const saveEdits = useCallback(async () => {
    try {
      const res = await apiRpc.users[":staffId"].staff.$put({
        param: { staffId: editStaffId },
        json: {
          businessId: businessData?._id || "",
          role: selectedRole || "CAPTAIN",
          permissionIds: selectedPermissions,
        },
      });

      if (res.status === 200 || res.status === 201) {
        toast.success("Staff updated successfully");
        setIsEditStaffOpen(false);
        setIsEditing(false);
        removeStaffStore();
        queryClient.invalidateQueries({ queryKey: ["getStaffs"] });
      } else {
        throw new Error("Failed to update staff");
      }
    } catch (error) {
      toast.error("Failed to update staff");
    }
  }, [
    businessData?._id,
    editStaffId,
    selectedRole,
    selectedPermissions,
    queryClient,
    setIsEditStaffOpen,
    setIsEditing,
  ]);

  const selectedPermissionNames = selectedPermissions
    .map((permId) => permissions.find((perm) => perm._id === permId)?.name)
    .filter((name) => name);

  return (
    <div className="container max-w-2xl pb-20 mx-auto">
      <header className="flex items-center justify-between px-4 py-6 md:px-0">
        <h1 className="text-2xl font-semibold">Edit Staff</h1>
        <Button
          onClick={deleteStaff}
          variant="destructive"
          size="icon"
          className="rounded-full"
        >
          <RiDeleteBin5Line className="w-5 h-5" />
        </Button>
      </header>

      <section className="grid grid-cols-1 gap-6 mx-4 md:mx-0 md:grid-cols-2">
        <Card className="">
          <CardHeader>
            <CardTitle>Staff Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              type="text"
              value={name}
              className="w-full"
              placeholder="Enter your name"
              maxLength={20}
              required
              disabled
            />
            <Input
              type="tel"
              value={phone}
              className="w-full"
              placeholder="Enter phone number"
              maxLength={10}
              required
              disabled
            />
          </CardContent>
        </Card>

        <Card className="">
          <CardHeader>
            <CardTitle>Role</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {selectedRole ? (
              <Badge variant="destructive" className="text-lg">
                {selectedRole}
              </Badge>
            ) : (
              <p className="text-muted-foreground">No role assigned</p>
            )}
            <Button
              onClick={() => setPageToggle("ADD_ROLE")}
              variant="outline"
              className="w-full"
            >
              <MdEdit className="mr-2" /> Edit Role
            </Button>
          </CardContent>
        </Card>
      </section>

      {selectedRole && (
        <Card className="mx-4 my-6 md:mx-0">
          <CardHeader>
            <CardTitle>Customize Permissions for {selectedRole}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {selectedPermissionNames.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {selectedPermissionNames.map((permName) => (
                  <Badge key={permName} variant="outline">
                    {removeUnwanted(permName)}
                  </Badge>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">No permissions assigned</p>
            )}
            <Button
              onClick={() => setPageToggle("ADD_PERMISSIONS")}
              variant="outline"
              className="w-full"
            >
              <MdEdit className="mr-2" /> Edit Permissions
            </Button>
          </CardContent>
        </Card>
      )}

      <BottomButton
        buttons={[{ text: "Save Changes", onClick: saveEdits, type: "button" }]}
      />
    </div>
  );
};

const EditTeam = memo(MemoiseEditTeam);
export default EditTeam;
