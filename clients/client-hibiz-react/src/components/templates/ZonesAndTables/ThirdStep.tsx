import { useState } from "react"
import useBusinessData from "@/components/store/useBusinessData"
import useZoneStore from "@/components/store/useZone"
import { Label } from "@/components/ui/label"
import { useGetAllStaff } from "@/hooks/useStaff"
import { Checkbox } from "@/components/ui/checkbox"
import {  SearchIcon } from "lucide-react"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"

const ThirdStep = () => {
  const { allStaff, selectedStaffIds ,toggleStaffId} = useZoneStore()
  const businessId = useBusinessData((s) => s?.businessData?._id)
  const { isLoadingStaff } = useGetAllStaff(businessId as string)
  const [searchTerm, setSearchTerm] = useState("")

  const filteredStaff = allStaff.filter((staff) => staff.name.toLowerCase().includes(searchTerm.toLowerCase()))

  const handleStaffToggle = (staffId: string) => {
    toggleStaffId(staffId)
  }

  return (
  
        <form onSubmit={(e) => e.preventDefault()}>
          <fieldset>
            <legend className="sr-only">Select Staff for the Table</legend>
            <div className="space-y-4">
              <Label htmlFor="staff-search" className="text-lg font-semibold">
                Search and Select Staff
              </Label>
              <div className="relative">
                <SearchIcon className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="staff-search"
                  type="text"
                  placeholder="Search staff..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
              <ScrollArea className="h-[200px] border rounded-md p-4">
                {isLoadingStaff ? (
                  <p>Loading staff...</p>
                ) : filteredStaff.length === 0 ? (
                  <p>No staff found</p>
                ) : (
                  filteredStaff.map((staff) => (
                    <div key={staff._id} className="flex items-center py-2 space-x-2">
                      <Checkbox
                        id={staff._id}
                        checked={selectedStaffIds.includes(staff._id)}
                        onCheckedChange={() => handleStaffToggle(staff._id)}
                      />
                      <Label
                        htmlFor={staff._id}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        {staff.name}
                      </Label>
                    </div>
                  ))
                )}
              </ScrollArea>
              <p className="mt-2 text-sm text-muted-foreground">
                Assign staff members who will be responsible for this table
              </p>
            </div>
          </fieldset>
        </form>
     
  )
}

export default ThirdStep

