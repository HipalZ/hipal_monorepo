import { RiDeleteBin5Line } from "react-icons/ri";
import toast from "react-hot-toast";
import { apiRpc } from "@hi/common";
import { MdEdit } from "react-icons/md";
import { useAddStaffStore } from "@/components/store/useAddStaffStore";
import { memo, useCallback } from "react";
import useBusinessData from "@/components/store/useBusinessData";
import BottomButton from "@/components/atom/bottomButton";
import { useQueryClient } from "@tanstack/react-query";

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
    permissions,
    selectedPermissions,
  } = useAddStaffStore();

  const businessData = useBusinessData((s) => s.businessData);

  const formatPermissions = useCallback(() => {
    if (!selectedRole) return [];
    const perms = permissions[selectedRole] || [];
    return perms
      .map((permission) => ({
        title: permission.title,
        subPermissions: permission.subPermissions
          .filter((sp) => selectedPermissions.includes(sp.subTitle))
          .map((sp) => sp.subTitle),
      }))
      .filter((p) => p.subPermissions.length > 0);
  }, [selectedPermissions, selectedRole, permissions]);

  const formattedPermissions = formatPermissions();

  const deleteStaff = async () => {
    const res = await apiRpc.users[":staffId"].$delete({
      param: {
        staffId: editStaffId,
      },
    });
    if (res.status === 200 || res.status === 201) {
      setIsEditStaffOpen(false);
      setIsEditing(false);
      toast.success("Staff deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["getStaff"] });

    } else {
      toast.error("Failed to delete staff");
    }
  };

  const saveEdits = async () => {
    const res = await apiRpc.users[":staffId"].staff.$put({
      param: {
        staffId: editStaffId,
      },
      json: {
        businessId: businessData?._id || "",
        phone: phone,
        role: selectedRole || "CAPTAIN",
        permissions: formatPermissions(),
      },
    });
    if (res.status === 200 || res.status === 201) {
      toast.success("Staff updated successfully");
      setIsEditStaffOpen(false);
      setIsEditing(false);
      queryClient.invalidateQueries({ queryKey: ["getStaff"] });
    } else {
      toast.error("Failed to update staff");
    }
  };
  return (
    <section className="pb-[5rem]">
      <center className="pt-6 text-xl font-semibold">Edit Staff</center>
      <button
        onClick={deleteStaff}
        type="button"
        className="text-[#FF3B30] text-2xl bg-[#FF636356] float-right mr-6 -mt-8 px-4 py-1 border rounded-full"
      >
        <RiDeleteBin5Line />
      </button>
      <h6 className="mx-4 mt-4 -mb-2 opacity-50">Staff</h6>
      <section className="p-4 m-4 space-y-4 bg-white rounded-xl">
        <input
          type="text"
          value={name}
          // onChange={(e) => setName(e.target.value)}
          className="w-full px-4 py-3 border border-black rounded-2xl focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
          placeholder="Enter your name"
          maxLength={20}
          required
        />
        <input
          type="tel"
          value={phone}
          // onChange={(e) => setPhone(e.target.value)}
          className="w-full px-4 py-3 border border-black rounded-2xl focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
          placeholder="Enter phone number"
          maxLength={10}
          required
        />
      </section>
      <h6 className="mx-4 mt-6 mb-2 opacity-50">Role</h6>
      <section className="p-4 mx-4 space-y-4 bg-white rounded-xl">
        {selectedRole !== "" && (
          <button
            type="button"
            className="px-4 py-2 rounded-2xl bg-[#2C01A360] text-white inline-block"
          >
            {selectedRole}
          </button>
        )}
        <button
          type="button"
          onClick={() => setPageToggle("ADD_ROLE")}
          className="flex items-center justify-center px-4 py-2 rounded-2xl bg-[#EFEFF3] w-full"
        >
          <MdEdit /> Edit Role
        </button>
      </section>
      {selectedRole !== "" && (
        <>
          <h6 className="mx-4 mt-6 mb-2 opacity-50">
            Customize Permissions for {selectedRole}
          </h6>
          <section className="p-4 mx-4 space-y-4 bg-white rounded-xl">
            {formattedPermissions.length > 0 &&
              formattedPermissions.map((permission) => (
                <button
                  type="button"
                  key={permission.title}
                  className="px-4 py-2 mr-4 rounded-2xl bg-[#2C01A360] text-white"
                >
                  {permission.title}
                </button>
              ))}

            <button
              type="button"
              onClick={() => setPageToggle("ADD_PERMISSIONS")}
              className="flex items-center justify-center px-4 py-2 rounded-2xl bg-[#EFEFF3] w-full"
            >
              <MdEdit /> Edit Permissions
            </button>
          </section>
        </>
      )}

      <BottomButton
        buttons={[{ text: "Save Changes", onClick: saveEdits, type: "button" }]}
      />
    </section>
  );
};
const EditTeam = memo(MemoiseEditTeam);
export default EditTeam;
