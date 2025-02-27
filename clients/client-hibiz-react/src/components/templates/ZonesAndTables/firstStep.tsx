import useZoneStore from "@/components/store/useZone"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { InfoIcon } from "lucide-react"

const FirstStep = () => {
  const { tableName, setTableName, capacity, setCapacity } = useZoneStore()

  return (
  
        <form onSubmit={(e) => e.preventDefault()} className="space-y-6">
          <fieldset>
            <legend className="sr-only">Table Information</legend>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="tableName" className="text-lg font-semibold">
                  Table Name
                </Label>
                <Input
                  id="tableName"
                  value={tableName}
                  onChange={(e) => setTableName(e.target.value)}
                  placeholder="Enter table name"
                  required
                  className="w-full"
                />
                <p className="text-sm text-muted-foreground">
                  <InfoIcon className="inline-block w-4 h-4 mr-1" />
                  Provide a unique name for this table
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="capacity" className="text-lg font-semibold">
                  Seating Capacity
                </Label>
                <Input
                  id="capacity"
                  type="number"
                  value={capacity}
                  onChange={(e) => setCapacity(Number(e.target.value))}
                  placeholder="Enter seating capacity"
                  required
                  min={1}
                  className="w-full"
                />
                <p className="text-sm text-muted-foreground">
                  <InfoIcon className="inline-block w-4 h-4 mr-1" />
                  Specify the maximum number of guests this table can accommodate
                </p>
              </div>
            </div>
          </fieldset>
        </form>
  )
}

export default FirstStep

