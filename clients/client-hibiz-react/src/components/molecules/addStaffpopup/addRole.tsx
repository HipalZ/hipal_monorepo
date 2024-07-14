import { useCallback, lazy, memo } from "react";
import { cn } from "@/components/utils/helper";
import {
  type IRoles,
  type role,
  useAddStaffStore,
} from "@/components/store/useAddStaffStore";
import { useQuery } from "@tanstack/react-query";
import { useUserToken } from "@/components/store/useUserToken";
import useBusinessData from "@/components/store/useBusinessData";
import { apiRpc } from "@hi/common";
import toast from "react-hot-toast";

const MultipleBottomButtons = lazy(
  () => import("@/components/atom/multipleButtons"),
);

const AddRole = () => {
  const {
    selectedRole,
    setSelectedRole,
    pageToggle,
    setPageToggle,
    setRoles,
    roles,
    isEditing
  } = useAddStaffStore();

  const handleRoleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const role = event.target.value as role
    setSelectedRole(role);
  };
  const { accessToken, refreshToken } = useUserToken((s) => ({
    accessToken: s.accessToken,
    refreshToken: s.refreshToken,
  }));
  const businessData = useBusinessData((s) => s.businessData);

  const saveRole = () => {
    if (!selectedRole) {
      toast.error("Please select a role");
      return;
    }
    if (selectedRole) {
      setPageToggle("ADD_STAFF")
    }
  };

  const getAllRoles = async () => {
    const res = await apiRpc.businesses[":businessId"].users.$get({
      header: {
        x_access_token: accessToken,
        x_refresh_token: refreshToken,
      },
      param: {
        businessId: businessData?._id,
      },
    });
    const response = (await res.json()).data;
    if (res.status === 400 || res.status === 403 || res.status === 409) {
      toast.error("roles not found")
    }
    if (res.status === 200 || res.status === 201) {
      setRoles(response);
    }
    return response;
  };

  const goBack = useCallback(() => {
    if (isEditing) {
      setPageToggle("EDIT_STAFF")
      return
    }
    setPageToggle("ADD_STAFF");
  }, [pageToggle, setPageToggle]);

  useQuery({
    queryKey: ["roles", accessToken, refreshToken, businessData?._id],
    queryFn: getAllRoles,
    enabled: !!businessData?._id && !!accessToken && !!refreshToken,
  });

  return (
    <section className="relative px-4 rounded-4">
      <center className="sticky top-0 z-20 p-2 my-4 text-xl font-semibold bg-[#f4f4f4]">
        {
          isEditing ? "Edit Staff" : "Add Staff"
        }
      </center>
      {roles.length > 0 && (
        <section>
          {roles?.map((item: IRoles) => (
            <div
              key={item._id}
              className={cn(
                "p-4 mb-4 bg-white rounded-2xl",
                selectedRole === item.name && "border border-purple-500",
              )}
            >
              <label className="flex items-center mb-2">
                <input
                  type="radio"
                  name="role"
                  value={item.name}
                  checked={selectedRole === item.name}
                  onChange={handleRoleChange}
                  className="mr-2"
                />
                <span className="font-bold">
                  {item.name.split("_").join(" ")}
                </span>
              </label>
              <p className="text-sm opacity-50">{item.description}</p>
            </div>
          ))}
        </section>
      )}

      <MultipleBottomButtons
        buttons={[
          {
            text: "Back",
            onClick: goBack,
            className: "bg-white border border-black text-black",
          },
          {
            text: "Save",
            onClick: saveRole,
            className: "bg-black text-white",
          },
        ]}
      />
    </section>
  );
};

const MemoAddRole = memo(AddRole);

export default MemoAddRole;
