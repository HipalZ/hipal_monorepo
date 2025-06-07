import ReactDOM from "react-dom/client"
import { useCallback, useState, useMemo, memo } from "react"
import BottomButton from "@/components/atom/bottomButton"
import PopUp from "@/components/atom/popUp"
import useZoneStore, { type ITable, type IZone } from "@/components/store/useZone"
import CreateTable from "./CreateTable"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { SearchIcon, UsersIcon, MapPinIcon, Download } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { useError } from "@/components/store/useError"
import BulkUploadTables from "./BulkTableUpload"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import QRCode from "react-qr-code"
import { toPng } from "html-to-image"
import { Button } from "@/components/ui/button"

interface User {
  _id: string
  name: string
}

const MemoTablesMain = () => {
  const {
    createTableModal,
    setCreateTableModal,
    bulkCreateTableModal,
    setBulkCreateTableModal,
    setEditTable,
    allTables,
    allZones,
    allStaff,
  } = useZoneStore()
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedZone, setSelectedZone] = useState<string>("all")
  const { setError, setOpenErrorModal } = useError()

  const openTableModalFunc = useCallback(() => {
    setCreateTableModal(true)
  }, [setCreateTableModal])

  const openBulkCreat = useCallback(() => {
    setBulkCreateTableModal(true)
  }, [setBulkCreateTableModal])

  const getZoneName = (zoneId: string) => {
    const zone = allZones.find((z: IZone) => z._id === zoneId)
    return zone ? zone.name : "Unknown Zone"
  }

  const getUserName = (userId: string) => {
    const user = allStaff.find((u: User) => u._id === userId)
    return user ? user.name : "Unassigned"
  }

  const filteredTables = useMemo(() => {
    return allTables.filter((table: ITable) => {
      const matchesSearch =
        table.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        getZoneName(table.internalZoneId).toLowerCase().includes(searchTerm.toLowerCase()) ||
        table.staffIds.some((id) => getUserName(id).toLowerCase().includes(searchTerm.toLowerCase()))

      const matchesZone = selectedZone === "all" || table.internalZoneId === selectedZone

      return matchesSearch && matchesZone
    })
  }, [allTables, searchTerm, selectedZone, allStaff, getUserName, getZoneName])

  const groupedTables = useMemo(() => {
    const groups: { [key: string]: ITable[] } = {}
    filteredTables.forEach((table) => {
      const zoneName = getZoneName(table.internalZoneId)
      if (!groups[zoneName]) {
        groups[zoneName] = []
      }
      groups[zoneName].push(table)
    })
    return groups
  }, [filteredTables])

  const editTableFunc = useCallback(
    (table: ITable) => {
      if (table.status !== "EMPTY") {
        setError("This table is active, you can't edit it.")
        setOpenErrorModal(true)
        return
      }
      setEditTable(table)
      setCreateTableModal(true)
    },
    [setError, setOpenErrorModal, setEditTable, setCreateTableModal],
  )

  const downloadQRCodeImage = async (table: ITable) => {
    const container = document.createElement("div")
    container.style.position = "absolute"
    container.style.top = "-10000px"
    container.style.left = "-10000px"
    document.body.appendChild(container)

    const root = ReactDOM.createRoot(container)
    root.render(
      <div
        style={{
          padding: "20px",
          background: "white",
          border: "1px solid #ccc",
          display: "inline-block",
        }}
      >
        <QRCode value={table.tableLink} size={1080} />
        <div className="capitalise" style={{ textAlign: "center", marginTop: "40px", fontSize: "80px", fontWeight: "bold" }}>
          {table.name}
        </div>
      </div>
    )

    await new Promise((resolve) => setTimeout(resolve, 100))

    try {
      if (container.firstChild) {
        const dataUrl = await toPng(container.firstChild as HTMLElement)
        const link = document.createElement("a")
        link.download = `${table.name}.png`
        link.href = dataUrl
        link.click()
      }
    } catch (error) {
      console.error("Failed to generate QR code image:", error)
    } finally {
      root.unmount()
      document.body.removeChild(container)
    }
  }

  const downloadAllQRCodes = async (tables: ITable[]) => {
    for (const table of tables) {
      await downloadQRCodeImage(table)
    }
  }

  return (
    <section className="p-4">
      <div className="flex items-center mb-4 space-x-2">
        <SearchIcon className="w-5 h-5 text-muted-foreground" />
        <Input
          placeholder="Search tables, zones, or staff..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1"
        />
        <Select value={selectedZone} onValueChange={setSelectedZone}>
          <SelectTrigger className="w-[120px]">
            <SelectValue placeholder="Filter by Zone" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Zones</SelectItem>
            {allZones.map((zone) => (
              <SelectItem key={zone._id} value={zone._id}>
                {zone.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <ScrollArea className="w-full mb-[7rem]">
        {Object.entries(groupedTables).map(([zoneName, tables]) => (
          <div key={zoneName} className="mb-6">
            <div className="flex items-center gap-4 mb-3">
              <h2 className="text-xl font-semibold">{zoneName}</h2>
              {
                zoneName !== "Unknown Zone" &&
                <Button
                  type="button"
                  onClick={() => downloadAllQRCodes(tables)}
                >
                  <Download />
                  All QR
                </Button>
              }
             
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {tables.map((table: ITable) => (
                <Card
                  onClick={() => editTableFunc(table)}
                  key={table._id}
                  className="relative flex flex-col justify-between"
                >
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="text-lg font-semibold">{table.name}</h3>
                      <Badge variant={table.status === "EMPTY" ? "secondary" : "destructive"}>
                        {table.status}
                      </Badge>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center text-muted-foreground">
                        <MapPinIcon className="w-4 h-4 mr-2" />
                        {getZoneName(table.internalZoneId)}
                      </div>
                      <div className="flex items-start">
                        <UsersIcon className="w-4 h-4 mt-1 mr-2" />
                        <div>
                          <p className="font-medium">Staff:</p>
                          <ul className="pl-2 list-disc list-inside">
                            {table.staffIds.map((id) => (
                              <li key={id}>{getUserName(id)}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                  {
                    table.tableLink &&
                    <Button
                      onClick={(e) => {
                        e.stopPropagation()
                        downloadQRCodeImage(table)
                      }}
                      className="absolute bottom-2 right-2"
                      variant="outline"
                    >
                      <Download />
                      QR
                    </Button>
                  }
                </Card>
              ))}
            </div>
          </div>
        ))}
      </ScrollArea>
      {createTableModal && (
        <PopUp
          width="w-[30rem]"
          height="h-[100dvh] lg:h-[80dvh]"
          hide
          show={createTableModal}
          onClose={() => setCreateTableModal(false)}
        >
          <CreateTable />
        </PopUp>
      )}
      {bulkCreateTableModal && (
        <PopUp
          width="w-[30rem]"
          height="h-[100dvh] lg:h-[80dvh]"
          hide
          show={bulkCreateTableModal}
          onClose={() => setBulkCreateTableModal(false)}
        >
          <BulkUploadTables />
        </PopUp>
      )}
      <BottomButton
        fixed
        buttons={[
          {
            text: "Bulk Upload",
            onClick: openBulkCreat,
          },
          {
            text: "Add Table",
            onClick: openTableModalFunc,
          },
        ]}
      />
    </section>
  )
}

const TablesMain = memo(MemoTablesMain)
export default TablesMain
