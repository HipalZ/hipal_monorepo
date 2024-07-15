import { useAddStaffStore } from "@/components/store/useAddStaffStore";
import useBusinessData from "@/components/store/useBusinessData";
import { useUserToken } from "@hi/common/src/useUserToken";
import { apiRpc } from "@hi/common";
import { MdEdit } from "react-icons/md";
import AddRole from "./addRole";
import AddPermissions from "./addPermissions";

const EditStaff = () => {
  const {
    name,
    phone,
    selectedRole,
    selectedPermissions,
    pageToggle,
    setName,
    setPhone,
    setSelectedRole,
    setPermissions,
    setPageToggle,
    editStaffId,
    isEditing
  } = useAddStaffStore();
  const { accessToken, refreshToken } = useUserToken();
  const businessData = useBusinessData((s) => s.businessData);

  // const saveEdits = async () => {
  //   const res = await apiRpc.users[editStaffId].$put({
  //     header: { x_access_token: accessToken, x_refresh_token: refreshToken },
  //     json: {
  //       name,
  //       phone,
  //       role: selectedRole,
  //       permissions: selectedPermissions,
  //     },
  //   });
  //   if (res.status === 200) {
  //     toast.success("Staff updated successfully");
  //   } else {
  //     toast.error("Failed to update staff");
  //   }
  // };

  return (
    <section className="min-h-auto h-auto max-h-[85vh] overflow-auto rounded-t-3xl bg-[#F4F4F4] pb-[7rem]">

      {pageToggle === "EDIT_STAFF" && (
        <>
          <center className="pt-6 text-2xl font-semibold">Edit Staff</center>
          <h6 className="mx-4 mt-4 -mb-2 opacity-50">Staff</h6>
          <section className="p-4 m-4 space-y-4 bg-white rounded-xl">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 border border-black rounded-2xl focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
              placeholder="Enter your name"
              maxLength={20}
              required
            />
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
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
              <MdEdit /> Assign Role
            </button>
          </section>
          {selectedRole !== "" && (
            <>
              <h6 className="mx-4 mt-6 mb-2 opacity-50">
                Customize Permissions for Co owner
              </h6>
              <section className="p-4 mx-4 space-y-4 bg-white rounded-xl">
                <button
                  type="button"
                  className="px-4 py-2 rounded-2xl bg-[#2C01A360] text-white"
                >
                  Owner
                </button>
                <button
                  type="button"
                  onClick={() => setPageToggle("ADD_PERMISSIONS")}
                  className="flex items-center justify-center px-4 py-2 rounded-2xl bg-[#EFEFF3] w-full"
                >
                  <MdEdit /> Manage Permissions
                </button>
              </section>
            </>
          )}
          <button type="button" className="bottom_btn">
            Save Changes
          </button>
        </>
      )}
      {pageToggle === "ADD_ROLE" && <AddRole />}
      {pageToggle === "ADD_PERMISSIONS" && <AddPermissions />}
    </section>
  );
};

export default EditStaff;
