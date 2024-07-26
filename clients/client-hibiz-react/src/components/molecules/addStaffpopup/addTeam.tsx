import { MdEdit } from "react-icons/md";
import { useAddStaffStore } from "@/components/store/useAddStaffStore";
import { useCallback } from "react";
import useBusinessData from "@/components/store/useBusinessData";
import { apiRpc } from "@hi/common";
import toast from "react-hot-toast";
import BottomButton from "@/components/atom/bottomButton";

const AddTeam = ({ getUser }: { getUser: () => void }) => {
  const {
    setPageToggle,
    name,
    setName,
    phone,
    setPhone,
    pageToggle,
    selectedRole,
    selectedPermissions,
    permissions,
    setIsAddStaffOpen,
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
  }, [permissions, selectedPermissions, selectedRole]);

  const formattedPermissions = formatPermissions();

  const addStaff = async () => {
    if (!name || !phone || !selectedRole) {
      toast.error("Please fill all the fields");
      return;
    }
    if (phone.length !== 10) {
      toast.error("Phone number should be of 10 digits");
    }
    const res = await apiRpc.users.addStaff.$post({
      json: {
        businessId: businessData?._id || "",
        name: name,
        phone: phone,
        role: selectedRole || "CAPTAIN",
        permissions: formatPermissions(),
      },
    });
    if (res.status === 400 || res.status === 403 || res.status === 409) {
      toast.error("Failed to add staff");
    }
    if (res.status === 201 || res.status === 200) {
      toast.success("Staff added successfully");
      setIsAddStaffOpen(false);
      getUser();
    }
  };
  const goToRoles = useCallback(() => {
    setPageToggle("ADD_ROLE");
  }, [pageToggle]);

  return (
    <>
      <center className="pt-6 text-2xl font-semibold">Add Staff</center>
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
          onClick={goToRoles}
          className="flex items-center justify-center px-4 py-2 rounded-2xl bg-[#EFEFF3] w-full"
        >
          <MdEdit /> Assign Role
        </button>
      </section>

      {selectedRole !== "" && (
        <>
          {" "}
          <h6 className="mx-4 mt-6 mb-2 opacity-50">
            Customize Permissions for Co owner
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
              <MdEdit /> Manage Permissions{" "}
            </button>
          </section>
        </>
      )}

      <BottomButton  buttons={[
            { text: "Send Invite", onClick: addStaff, type: "button" },
          ]} />
    </>
  );
};

export default AddTeam;
