import { memo, useCallback, useState } from "react"
import { useAddStaffStore } from "@/components/store/useAddStaffStore"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"
import BottomButton from "@/components/atom/bottomButton"
import { removeUnwanted } from "@/components/utils/helper"
import { Check } from "lucide-react"

const AddPermissions = () => {
  const { selectedPermissions, setPageToggle, permissions, isEditing, addPermission, setSelectedPermissions } =
    useAddStaffStore()

  const [isAllSelected, setIsAllSelected] = useState(false)

  const goBack = useCallback(() => {
    setPageToggle(isEditing ? "EDIT_STAFF" : "ADD_STAFF")
  }, [isEditing, setPageToggle])

  const togglePermission = (permId: string) => {
    addPermission(permId)
  }

  const toggleAllPermissions = () => {
    if (isAllSelected) {
      setSelectedPermissions([])
    } else {
      setSelectedPermissions(permissions.map((perm) => perm._id))
    }
    setIsAllSelected(!isAllSelected)
  }

  return (
    <section className="px-4 mx-auto pb-[7rem]">
      <Card className="mt-4">
        <CardHeader className="sticky top-0 z-20 flex flex-row items-center justify-between bg-background">
          <CardTitle className="flex-grow text-center">{isEditing ? "Edit" : "Add"} Permissions</CardTitle>
          <Button variant="outline" size="sm" onClick={toggleAllPermissions} className="flex items-center gap-2">
            {isAllSelected ? <Check className="w-4 h-4" /> : null}
            {isAllSelected ? "Deselect All" : "Select All"}
          </Button>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[calc(100vh-16rem)]">
            {permissions.length > 0 ? (
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                {permissions.map((perm) => {
                  const isSelected = selectedPermissions.includes(perm._id)
                  return (
                    <Button
                      key={perm._id}
                      onClick={() => togglePermission(perm._id)}
                      variant={isSelected ? "default" : "outline"}
                      className={cn(
                        "w-full justify-start font-medium text-sm h-auto py-2 px-3",
                        isSelected
                          ? "bg-primary text-base-100 hover:bg-primary/90"
                          : "bg-background text-foreground hover:bg-accent hover:text-accent-foreground",
                      )}
                    >
                      {isSelected && <Check className="flex-shrink-0 w-4 h-4 mr-2" />}
                      <span className="truncate">{removeUnwanted(perm?.name)}</span>
                    </Button>
                  )
                })}
              </div>
            ) : (
              <p className="text-center text-muted-foreground">No permissions available</p>
            )}
          </ScrollArea>
        </CardContent>
      </Card>

      <BottomButton
        buttons={[
          { text: "Back", onClick: goBack, type: "button" },
          {
            text: "Save",
            onClick: () => setPageToggle(isEditing ? "EDIT_STAFF" : "ADD_STAFF"),
            type: "button",
          },
        ]}
      />
    </section>
  )
}

const MemoizedAddPermissions = memo(AddPermissions)
export default MemoizedAddPermissions

