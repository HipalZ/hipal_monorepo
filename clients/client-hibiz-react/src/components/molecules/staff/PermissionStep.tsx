// src/components/molecules/staff/StaffWizard/PermissionsStep.tsx
import { memo, useCallback, useState } from "react";
import { useAddStaffStore } from "@/components/store/useAddStaffStore";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { removeUnwanted } from "@/components/utils/helper";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

const PermissionsStepComponent = () => {
  const permissions = useAddStaffStore((s) => s.permissions);
  const selectedPermissions = useAddStaffStore((s) => s.selectedPermissions);
  const addPermission = useAddStaffStore((s) => s.addPermission);
  const setSelectedPermissions = useAddStaffStore(
    (s) => s.setSelectedPermissions,
  );

  const [isAllSelected, setIsAllSelected] = useState(false);

  const togglePermission = useCallback(
    (permId: string) => {
      addPermission(permId);
    },
    [addPermission],
  );

  const toggleAllPermissions = useCallback(() => {
    setSelectedPermissions(
      isAllSelected ? [] : permissions.map((perm) => perm._id),
    );
    setIsAllSelected((prev) => !prev);
  }, [isAllSelected, permissions, setSelectedPermissions]);

  return (
    <Card className="mt-2">
      <CardHeader className="sticky top-0 z-20 flex flex-row items-center justify-between bg-background">
        <CardTitle className="flex-grow text-center">
          Select Permissions
        </CardTitle>
        <Button
          variant="outline"
          size="sm"
          onClick={toggleAllPermissions}
          className="flex items-center gap-2"
        >
          {isAllSelected ? <Check className="h-4 w-4" /> : null}
          {isAllSelected ? "Deselect All" : "Select All"}
        </Button>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[calc(100vh-16rem)]">
          {permissions.length > 0 ? (
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {permissions.map((perm) => {
                const isSelected = selectedPermissions.includes(perm._id);
                return (
                  <Button
                    key={perm._id}
                    onClick={() => togglePermission(perm._id)}
                    variant={isSelected ? "default" : "outline"}
                    className={cn(
                      "h-auto w-full justify-start px-3 py-2 text-sm font-medium",
                      isSelected
                        ? "bg-primary text-base-100 hover:bg-primary/90"
                        : "bg-background text-foreground hover:bg-accent hover:text-accent-foreground",
                    )}
                  >
                    {isSelected && (
                      <Check className="mr-2 h-4 w-4 flex-shrink-0" />
                    )}
                    <span className="truncate">
                      {removeUnwanted(perm?.name)}
                    </span>
                  </Button>
                );
              })}
            </div>
          ) : (
            <p className="text-center text-muted-foreground">
              No permissions available
            </p>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export const PermissionsStep = memo(PermissionsStepComponent);
