import { useState, useEffect } from "react"
import useZoneStore from "@/components/store/useZone"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { InfoIcon } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

const FirstStepBulkupload = () => {
  const { tableName, setTableName, capacity, setCapacity } = useZoneStore()
  const [startNumber, setStartNumber] = useState<number>(1)
  const [endNumber, setEndNumber] = useState<number>(1)
  const [baseTableName, setBaseTableName] = useState("")

  useEffect(() => {
    if ( startNumber && endNumber && endNumber >= startNumber) {
      setTableName(`${baseTableName}${startNumber}-${endNumber}`)
    } else {
      setTableName(baseTableName)
    }
  }, [baseTableName, startNumber, endNumber, setTableName])

  return (
    <Card>
      <CardContent>
        <form onSubmit={(e) => e.preventDefault()} className="space-y-6">
          <fieldset>
            <legend className="sr-only">Table Information</legend>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="baseTableName" className="text-lg font-semibold">
                  Base Table Name
                </Label>
                <Input
                  id="baseTableName"
                  value={baseTableName}
                  onChange={(e) => setBaseTableName(e.target.value)}
                  placeholder="Enter base table name"
                  required
                  className="w-full"
                />
                <p className="text-sm text-muted-foreground">
                  <InfoIcon className="inline-block w-4 h-4 mr-1" />
                  Provide a base name for the table(s)
                </p>
              </div>
              <div className="flex space-x-4">
                <div className="flex-1 space-y-2">
                  <Label htmlFor="startNumber" className="text-lg font-semibold">
                    Start Number
                  </Label>
                  <Input
                    id="startNumber"
                    type="number"
                    value={startNumber}
                    onChange={(e) => setStartNumber(Number(e.target.value))}
                    placeholder="Start number"
                    required
                    min={1}
                    className="w-full"
                  />
                </div>
                <div className="flex-1 space-y-2">
                  <Label htmlFor="endNumber" className="text-lg font-semibold">
                    End Number
                  </Label>
                  <Input
                    id="endNumber"
                    type="number"
                    value={endNumber}
                    onChange={(e) => setEndNumber(Number(e.target.value))}
                    placeholder="End number"
                    required
                    min={startNumber}
                    className="w-full"
                  />
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                <InfoIcon className="inline-block w-4 h-4 mr-1" />
                Specify the range of table numbers (End must be greater than or equal to Start)
              </p>
              <div className="space-y-2">
                <Label htmlFor="tableName" className="text-lg font-semibold">
                  Generated Table Name
                </Label>
                <Input id="tableName" value={tableName} readOnly className="w-full bg-muted" />
                <p className="text-sm text-muted-foreground">
                  <InfoIcon className="inline-block w-4 h-4 mr-1" />
                  This is the generated table name based on your input
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
                  Specify the maximum number of guests each table can accommodate
                </p>
              </div>
            </div>
          </fieldset>
        </form>
      </CardContent>
    </Card>
  )
}

export default FirstStepBulkupload

