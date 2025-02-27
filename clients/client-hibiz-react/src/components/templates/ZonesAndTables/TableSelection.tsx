
import { useState } from "react"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { Search, X } from "lucide-react"
import AdvancedBottomButton from "@/components/atom/bottomButton/advancedBottomButton"
import PopUp from "@/components/atom/popUp"
import type { ITable } from "@/components/store/useZone"


interface TableSelectionPopupProps {
  show: boolean
  onClose: () => void
  allTables: ITable[]
  selectedTableIds: string[]
  toggleTableIds: (id: string) => void
  handleDownloadAll: () => void
}

const TableSelectionPopup: React.FC<TableSelectionPopupProps> = ({
  show,
  onClose,
  allTables,
  selectedTableIds,
  toggleTableIds,
  handleDownloadAll,
}) => {
  const [searchTerm, setSearchTerm] = useState("")

  const filteredTables = allTables.filter((table) => table.name.toLowerCase().includes(searchTerm.toLowerCase()))

  return (
    <PopUp hide show={show} onClose={onClose} width="w-[30rem]" height="h-[100dvh] lg:h-[80dvh]">
      <div className="flex flex-col h-full p-4 ">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold">Select Tables</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-6 h-6" />
          </Button>
        </div>
        <div className="relative mb-4">
          <Search className="absolute text-gray-400 transform -translate-y-1/2 left-3 top-1/2" />
          <Input
            type="text"
            placeholder="Search tables..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <ScrollArea className="flex-grow mb-4">
          <div className="space-y-2">
            {filteredTables.map((table) => (
              <div
                key={table._id}
                className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <Label htmlFor={table._id} className="flex-grow cursor-pointer">
                  {table.name}
                </Label>
                <Switch
                  id={table._id}
                  checked={selectedTableIds.includes(table._id)}
                  onCheckedChange={() => toggleTableIds(table._id)}
                />
              </div>
            ))}
          </div>
        </ScrollArea>
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500">
            {selectedTableIds.length} of {allTables.length} tables selected
          </p>
          <div className="space-x-2">
            <Button variant="outline" onClick={() => toggleTableIds("all")}>
              {selectedTableIds.length === allTables.length ? "Deselect All" : "Select All"}
            </Button>
          </div>
        </div>
        <AdvancedBottomButton
          fixed={false}
          maxWidth="100%"
          buttons={[
            {
              text: "Cancel",
              onClick: onClose,
              isBackButton: true,
              className: "rounded-md pl-3",
            },
            {
              text: "Download Selected",
              onClick: handleDownloadAll,
              className: "rounded-md",
              disable: selectedTableIds.length === 0,
            },
          ]}
        />
      </div>
    </PopUp>
  )
}

export default TableSelectionPopup

