import { memo, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
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

const MemoAddTeam = () => {
  const queryClient = useQueryClient();
  const {
    setPageToggle,
    name,
    setName,
    phone,
    setPhone,
    password,
    setPassword,
    selectedRole,
    selectedPermissions,
    permissions,
    setIsAddStaffOpen,
    removeStaffStore,
  } = useAddStaffStore();

  const businessData = useBusinessData((s) => s.businessData);

  // Validate & Add Staff
  const addStaff = async () => {
    if (!name || !phone || !password || !selectedRole) {
      toast.error("All fields are required.");
      return;
    }
    if (phone.length !== 10) {
      toast.error("Phone number should be 10 digits.");
      return;
    }

    try {
      const res = await apiRpc.users.addStaff.$post({
        json: {
          businessId: businessData?._id || "",
          name,
          phone,
          password,
          role: selectedRole,
          permissionIds: selectedPermissions,
        },
      });

      if (res.status === 201 || res.status === 200) {
        toast.success("Staff added successfully.");
        setIsAddStaffOpen(false);
        removeStaffStore();
        queryClient.invalidateQueries({ queryKey: ["getStaffs"] });
      } else {
        throw new Error("Unexpected response from server.");
      }
    } catch (error) {
      console.error("Error adding staff:", error);
      toast.error("Failed to add staff. Please try again.");
    }
  };

  const goToRoles = useCallback(() => {
    setPageToggle("ADD_ROLE");
  }, [setPageToggle]);

  // Map selected permissions to their names
  const selectedPermissionNames = selectedPermissions
    .map((permId) => permissions.find((perm) => perm._id === permId)?.name)
    .filter((name) => name);

  return (
    <div className="px-0 pb-20 mx-auto md:px-4">
      <header className="flex items-center justify-between px-4 py-6 md:px-0">
        <h1 className="text-2xl font-semibold">Add Staff</h1>
      </header>

      <section className="grid grid-cols-1 gap-6 mx-4 md:mx-0 md:grid-cols-2">
        {/* Staff Information */}
        <Card>
          <CardHeader>
            <CardTitle>Staff Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter staff name"
              maxLength={20}
              required
            />
            <Input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Enter phone number"
              maxLength={10}
              required
            />
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              required
            />
          </CardContent>
        </Card>

        {/* Role Selection */}
        <Card>
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
            <Button onClick={goToRoles} variant="outline" className="w-full">
              <MdEdit className="mr-2" /> Assign Role
            </Button>
          </CardContent>
        </Card>
      </section>

      {/* Permissions Section */}
      {selectedRole && (
        <Card className="mx-4 my-6 md:mx-0">
          <CardHeader>
            <CardTitle>Permissions for {selectedRole}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {selectedPermissionNames.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {selectedPermissionNames?.map((permName) => (
                  <Badge key={permName} variant="outline">
                    {removeUnwanted(permName)}
                  </Badge>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">No permissions assigned</p>
            )}
            <Button onClick={() => setPageToggle("ADD_PERMISSIONS")} variant="outline" className="w-full">
              <MdEdit className="mr-2" /> Manage Permissions
            </Button>
          </CardContent>
        </Card>
      )}

      <BottomButton
        buttons={
          [
            {
              text: "Send Invite",
              onClick: addStaff,
            }
          ]
        } />
    </div>
  );
};

const AddTeam = memo(MemoAddTeam);
export default AddTeam;
