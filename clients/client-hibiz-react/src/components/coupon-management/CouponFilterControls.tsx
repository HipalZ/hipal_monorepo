
import { memo } from "react"
import { Search, Percent, DollarSign, CheckCircle, XCircle } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

type CouponFilterControlsProps = {
  searchTerm: string
  filterType: string
  filterHasAllocations: string
  onSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  onFilterTypeChange: (value: string) => void
  onAllocationFilterChange: (value: string) => void
}

const CouponFilterControls = ({
  searchTerm,
  filterType,
  filterHasAllocations,
  onSearchChange,
  onFilterTypeChange,
  onAllocationFilterChange,
}: CouponFilterControlsProps) => {
  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input placeholder="Search coupons..." value={searchTerm} onChange={onSearchChange} className="pl-10 h-10" />
      </div>

      <div className="space-y-3">
        <div>
          <Label className="text-xs font-medium text-gray-700 mb-2 block">Discount Type</Label>
          <Tabs defaultValue="all" value={filterType} onValueChange={onFilterTypeChange}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="all" className="text-xs">
                All Types
              </TabsTrigger>
              <TabsTrigger value="percentage" className="text-xs flex items-center gap-1">
                <Percent size={12} />
                Percentage
              </TabsTrigger>
              <TabsTrigger value="amount" className="text-xs flex items-center gap-1">
                <DollarSign size={12} />
                Fixed
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <div>
          <Label className="text-xs font-medium text-gray-700 mb-2 block">Allocation Status</Label>
          <Tabs defaultValue="all" value={filterHasAllocations} onValueChange={onAllocationFilterChange}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="all" className="text-xs">
                All Coupons
              </TabsTrigger>
              <TabsTrigger value="yes" className="text-xs flex items-center gap-1">
                <CheckCircle size={12} className="text-green-500" />
                Allocated
              </TabsTrigger>
              <TabsTrigger value="no" className="text-xs flex items-center gap-1">
                <XCircle size={12} className="text-red-500" />
                Unallocated
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>
    </div>
  )
}

export default memo(CouponFilterControls)
