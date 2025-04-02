

import { memo, useState, useEffect } from "react"
import useBusinessData from "@/components/store/useBusinessData"
import { Check, ChevronsUpDown, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { useGetAllZones } from "@/hooks/useZone"
import { useMenuCreationStore } from "../store/useMenuCreationStore"

const Step6ZoneSelection = memo(() => {
  const businessId = useBusinessData((s) => s.businessData?._id) || ""
  const { data: zones, isLoading } = useGetAllZones(businessId)

  const { menuName, selectedZoneIds, setMenuName, toggleZoneSelection } = useMenuCreationStore(
    (state) => ({
      menuName: state.name,
      selectedZoneIds: state.selectedZoneIds,
      setMenuName: state.setMenuName,
      toggleZoneSelection: state.toggleZoneSelection,
    }),
  )

  const [open, setOpen] = useState(false)
  const [inputValue, setInputValue] = useState(menuName || "")

  // Update menu name in store when input changes
  useEffect(() => {
    if (inputValue !== menuName) {
      setMenuName(inputValue)
    }
  }, [inputValue, menuName, setMenuName])

  // Get selected zone names for display
  const selectedZones = zones?.filter((zone) => selectedZoneIds.includes(zone._id || "")) || []

  // Remove a zone from selection
  const removeZone = (zoneId: string) => {
    toggleZoneSelection(zoneId)
  }

  return (
    <div className="flex flex-col gap-6 p-4">
      <h2 className="text-xl font-semibold text-center">Menu Name & Zones</h2>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="menu-name">Menu Name</Label>
            <Input
              id="menu-name"
              placeholder="Enter menu name"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <Label>Select Zones</Label>
            <Popover open={open} onOpenChange={setOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={open}
                  className="justify-between w-full"
                  disabled={isLoading}
                >
                  {selectedZones.length > 0
                    ? `${selectedZones.length} zone${selectedZones.length !== 1 ? "s" : ""} selected`
                    : "Select zones..."}
                  <ChevronsUpDown className="w-4 h-4 ml-2 opacity-50 shrink-0" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-full p-0">
                <Command>
                  <CommandInput placeholder="Search zones..." />
                  <CommandList>
                    <CommandEmpty>No zone found.</CommandEmpty>
                    <CommandGroup className="overflow-y-auto max-h-60">
                      {zones?.map((zone) => (
                        <CommandItem
                          key={zone._id}
                          value={zone.name}
                          onSelect={() => {
                            toggleZoneSelection(zone._id || "")
                          }}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              selectedZoneIds.includes(zone._id || "") ? "opacity-100" : "opacity-0",
                            )}
                          />
                          {zone.name}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>

          {/* Selected zones display */}
          {selectedZones.length > 0 && (
            <div className="mt-2">
              <Label className="block mb-2">Selected Zones</Label>
              <div className="flex flex-wrap gap-2">
                {selectedZones.map((zone) => (
                  <Badge key={zone._id} variant="secondary" className="flex items-center gap-1">
                    {zone.name}
                    <button
                      type="button"
                      onClick={() => removeZone(zone._id || "")}
                      className="ml-1 rounded-full hover:bg-gray-200 p-0.5"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="p-4 rounded-lg bg-gray-50">
          <h3 className="mb-2 font-medium">Preview</h3>
          <div className="p-4 bg-white border border-gray-200 rounded shadow-sm">
            <p className="font-medium">{inputValue || "Menu Name"}</p>

            {selectedZones.length > 0 ? (
              <div className="mt-2">
                <p className="mb-1 text-sm text-gray-500">Available in zones:</p>
                <div className="flex flex-wrap gap-1">
                  {selectedZones.map((zone) => (
                    <Badge key={zone._id} variant="outline" className="text-xs">
                      {zone.name}
                    </Badge>
                  ))}
                </div>
              </div>
            ) : (
              <p className="mt-1 text-sm text-gray-500">No zones selected</p>
            )}

            <div className="mt-4 text-xs text-gray-400">This menu will be available in the selected zones.</div>
          </div>
        </div>
      </div>
    </div>
  )
})

Step6ZoneSelection.displayName = "Step6ZoneSelection"
export default Step6ZoneSelection

