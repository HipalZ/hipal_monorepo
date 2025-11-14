// src/components/molecules/staff/StaffWizard/ReviewStep.tsx
import { memo } from "react";
import { useAddStaffStore } from "@/components/store/useAddStaffStore";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { removeUnwanted } from "@/components/utils/helper";

const ReviewStepComponent = () => {
  const name = useAddStaffStore((s) => s.name);
  const phone = useAddStaffStore((s) => s.phone);
  const selectedRole = useAddStaffStore((s) => s.selectedRole);
  const selectedPermissions = useAddStaffStore((s) => s.selectedPermissions);
  const permissions = useAddStaffStore((s) => s.permissions);
  const isEditing = useAddStaffStore((s) => s.isEditing);

  const permissionNames = selectedPermissions
    .map((id) => permissions.find((p) => p._id === id)?.name)
    .filter(Boolean) as string[];

  return (
    <section className="mx-4 pb-[7rem] md:mx-0">
      <Card className="mt-4">
        <CardHeader>
          <CardTitle>
            {isEditing ? "Review Changes" : "Review Staff Details"}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm">
          <div>
            <h3 className="text-xs font-semibold text-muted-foreground">
              BASIC INFO
            </h3>
            <p>
              <span className="font-medium">Name:</span> {name || "-"}
            </p>
            <p>
              <span className="font-medium">Phone:</span> {phone || "-"}
            </p>
          </div>

          <div>
            <h3 className="text-xs font-semibold text-muted-foreground">
              ROLE
            </h3>
            <p>{selectedRole || "-"}</p>
          </div>

          <div>
            <h3 className="text-xs font-semibold text-muted-foreground">
              PERMISSIONS
            </h3>
            {permissionNames.length > 0 ? (
              <div className="mt-2 flex flex-wrap gap-2">
                {permissionNames.map((perm) => (
                  <Badge key={perm} variant="outline">
                    {removeUnwanted(perm)}
                  </Badge>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">No permissions selected</p>
            )}
          </div>
        </CardContent>
      </Card>
    </section>
  );
};

export const ReviewStep = memo(ReviewStepComponent);
