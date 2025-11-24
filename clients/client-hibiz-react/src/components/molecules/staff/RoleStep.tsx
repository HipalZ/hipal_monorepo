// src/components/molecules/staff/StaffWizard/RoleStep.tsx
import { memo, useCallback } from "react";
import { useAddStaffStore } from "@/components/store/useAddStaffStore";
import useBusinessData from "@/components/store/useBusinessData";
import { useQuery } from "@tanstack/react-query";
import { apiRpc } from "@hi/common";
import toast from "react-hot-toast";
import { cn } from "@/lib/utils";

const RoleStepComponent = () => {
  const selectedRole = useAddStaffStore((s) => s.selectedRole);
  const setSelectedRole = useAddStaffStore((s) => s.setSelectedRole);
  const roles = useAddStaffStore((s) => s.roles);
  const setRoles = useAddStaffStore((s) => s.setRoles);
  const isEditing = useAddStaffStore((s) => s.isEditing);

  const businessData = useBusinessData((s) => s.businessData);

  const handleRoleChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setSelectedRole(event.target.value as any);
    },
    [setSelectedRole],
  );

  const getAllRoles = useCallback(async () => {
    const res = await apiRpc.businesses[":businessId"].users.$get({
      param: {
        businessId: businessData?._id,
      },
    });
    const response = (await res.json()).data;
    if ([400, 403, 409].includes(res.status)) {
      toast.error("Roles not found");
    }
    if ([200, 201].includes(res.status)) {
      setRoles(response);
    }
    return response;
  }, [businessData?._id, setRoles]);

  useQuery({
    queryKey: ["roles", businessData?._id],
    queryFn: getAllRoles,
    enabled: !!businessData?._id && roles.length === 0,
  });

  return (
    <section className="pb-[7rem]">
      <center className="my-2 text-lg font-semibold">
        {isEditing ? "Edit Staff Role" : "Select Staff Role"}
      </center>

      {roles?.length > 0 && (
        <section className="space-y-4 px-4 pb-10">
          {roles.map((item) => (
            <div
              key={item._id}
              className={cn(
                "mb-2 rounded-2xl bg-white p-4 shadow-sm",
                selectedRole === item.name && "border border-purple-500",
              )}
            >
              <label className="mb-2 flex items-center">
                <input
                  type="radio"
                  name="role"
                  value={item.name}
                  checked={selectedRole === item.name}
                  onChange={handleRoleChange}
                  className="radio mr-2"
                />
                <span className="font-bold">
                  {item.name.split("_").join(" ")}
                </span>
              </label>
              <p className="text-sm text-muted-foreground">
                {item.description}
              </p>
            </div>
          ))}
        </section>
      )}
    </section>
  );
};

export const RoleStep = memo(RoleStepComponent);
