import { useEffect } from "react"
import useZoneStore from "@/components/store/useZone"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import {  CheckCircle2 } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"

const SecondStep = () => {
  const { allZones, setSelectZone, selectZone } = useZoneStore()

  useEffect(() => {
    if (!selectZone && allZones.length > 0) {
      setSelectZone(allZones[0])
    }
  }, [selectZone, allZones, setSelectZone])

  const handleZoneChange = (zone: (typeof allZones)[0]) => {
    setSelectZone(zone)
  }

  return (

        <form onSubmit={(e) => e.preventDefault()}>
          <fieldset>
            <legend className="sr-only">Select a Zone for the Table</legend>
            <div className="space-y-4">
              <Label htmlFor="zone" className="text-lg font-semibold">
                Choose a Zone
              </Label>
              <ScrollArea className="h-[370px] w-full rounded-md border p-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {allZones.map((zone) => (
                    <Card
                      key={zone._id}
                      className={`cursor-pointer transition-all ${
                        selectZone?._id === zone._id ? "border-primary shadow-lg" : "hover:border-primary/50"
                      }`}
                      onClick={() => handleZoneChange(zone)}
                    >
                      <CardContent className="flex items-center justify-between p-4">
                        <div>
                          <h3 className="font-semibold">{zone.name}</h3>
                          <p className="text-sm text-muted-foreground">{zone.tableIds?.length || 0} tables</p>
                        </div>
                        {selectZone?._id === zone._id && <CheckCircle2 className="w-5 h-5 text-primary" />}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
              <p className="mt-2 text-sm text-muted-foreground">
                Assign this table to a specific zone in your establishment
              </p>
            </div>
          </fieldset>
        </form>
     
  )
}

export default SecondStep

