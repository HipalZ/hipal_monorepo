import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import type { IExistingPayments } from "@/components/types/businessData"

interface TableViewProps {
  data: IExistingPayments[]
  onRowClick: (data: IExistingPayments) => void
}

export function TableView({ data, onRowClick }: TableViewProps) {
  return (
    <div className="overflow-hidden border rounded-md">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50">
            <TableHead>Order ID</TableHead>
            <TableHead>Date & Time</TableHead>
            <TableHead>Customer</TableHead>
            <TableHead>Captain</TableHead>
            <TableHead className="text-right">Original Bill</TableHead>
            <TableHead className="text-right">Discount</TableHead>
            <TableHead className="text-right">Payment Mode(s)</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((item) => (
            <TableRow 
              key={item._id} 
              className="transition-colors cursor-pointer hover:bg-muted/50" 
              onClick={() => onRowClick(item)}
            >
              <TableCell className="font-medium">{item?.billId?.slice(-6)}</TableCell>
              <TableCell>{new Date(item?.createdAt).toLocaleString("en-In")}</TableCell>
              <TableCell>
                {item?.userId?.name || "Anonymous"}
                {item?.userId?.phone && <div className="text-sm text-muted-foreground">{item?.userId?.phone}</div>}
              </TableCell>
              <TableCell>{item?.waiterName}</TableCell>
              <TableCell className="text-right">₹{item?.billValue?.toFixed(2)}</TableCell>
              <TableCell className="text-right">₹{item?.claimedCoins?.toFixed(2) || item?.discount}</TableCell>
              <TableCell className="text-right">
                {item?.splitModes?.map((mode) => (
                  <Badge key={mode._id} variant="outline" className="ml-1">
                    {mode?.name}
                  </Badge>
                ))}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}