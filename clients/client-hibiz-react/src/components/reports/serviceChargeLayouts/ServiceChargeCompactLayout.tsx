import type { ServiceChargeReport } from "@/hooks/useReportHook.ts"
import { Card } from "@/components/ui/card.tsx"
import { Building2 } from "lucide-react"
import { formatCurrency, calculateDailyAverage, getServiceChargeStatus } from "./serviceChargeHelper.ts"
import { memo } from "react"
import { Badge } from "@/components/ui/badge.tsx"

interface ServiceChargeCompactLayoutProps {
  reports: ServiceChargeReport[]
}

const MemoServiceChargeCompactLayout = ({ reports }: ServiceChargeCompactLayoutProps) => {
  return (
    <div className="space-y-2">
      {reports.map((report: ServiceChargeReport) => {
        const dailyAverage = calculateDailyAverage(report.serviceCharge, report.from, report.to)
        const status = getServiceChargeStatus(report.serviceCharge)

        return (
          <Card key={report.businessId} className="px-2 py-6 overflow-x-auto">
            <div className="flex items-center justify-between">
              <div className="flex flex-1 items-center gap-3 w-[12rem]">
                <Building2 className="w-5 h-5 text-muted-foreground" />
                <div>
                  <h4 className="font-semibold truncate">{report.businessName}</h4>
                  <p className="text-sm text-muted-foreground">
                    {report.from} to {report.to}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-6 text-sm">
                <div className="text-center w-[6rem]">
                  <p className="text-muted-foreground">Service Charge</p>
                  <p className="font-semibold text-green-600 text-lg">{formatCurrency(report.serviceCharge)}</p>
                </div>
                <div className="text-center w-[5rem]">
                  <p className="text-muted-foreground">Daily Avg</p>
                  <p className="font-semibold text-blue-600">{formatCurrency(dailyAverage)}</p>
                </div>
                <div className="text-center w-[4rem]">
                  <p className="text-muted-foreground">Status</p>
                  <Badge
                    variant="default"
                    className={`text-xs ${
                      status.color === "green"
                        ? "bg-green-100 text-green-800"
                        : status.color === "blue"
                          ? "bg-blue-100 text-blue-800"
                          : status.color === "yellow"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {status.status}
                  </Badge>
                </div>
              </div>
            </div>
          </Card>
        )
      })}
    </div>
  )
}

const ServiceChargeCompactLayout = memo(MemoServiceChargeCompactLayout)
export default ServiceChargeCompactLayout
