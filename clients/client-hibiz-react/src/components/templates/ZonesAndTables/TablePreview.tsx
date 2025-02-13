import useZoneStore from "@/components/store/useZone"
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import {UsersIcon, MapPinIcon, UserIcon } from "lucide-react"

const TablePreview = () => {
  const { tableName, capacity, selectZone, selectedStaffIds, allStaff } = useZoneStore()

  const selectedStaff = allStaff.filter((staff) => selectedStaffIds.includes(staff._id))

  return (
   
        <div className="space-y-6">
          <Table>
            <TableBody>
              <TableRow>
                <TableCell className="font-medium">Table Name</TableCell>
                <TableCell className="text-base font-semibold capitalize opacity-80">{tableName}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Capacity</TableCell>
                <TableCell>
                  <Badge variant="secondary" className="text-lg">
                    <UsersIcon className="w-4 h-4 mr-1" />
                    {capacity}
                  </Badge>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Zone</TableCell>
                <TableCell >
                  <Badge variant="outline" className="flex items-center text-base capitalize border-none">
                    <MapPinIcon className="w-4 h-4 mr-1" />
                    {selectZone?.name || "No zone selected"}
                  </Badge>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>

          <div>
            <h3 className="flex items-center mb-2 text-lg font-semibold">
              <UserIcon className="w-5 h-5 mr-2" />
              Assigned Staff ({selectedStaffIds.length})
            </h3>
            <ScrollArea className="h-[15rem] border rounded-md p-4">
              {selectedStaff.length > 0 ? (
                <ul className="space-y-2">
                  {selectedStaff.map((staff) => (
                    <li key={staff._id} className="flex items-center">
                      <Badge variant="secondary" className="mr-2">
                        {staff.role}
                      </Badge>
                      {staff.name}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-muted-foreground">No staff assigned</p>
              )}
            </ScrollArea>
          </div>
        </div>
  )
}

export default TablePreview

