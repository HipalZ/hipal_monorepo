import type { ServiceChargeReport } from "@/hooks/useReportHook.ts"
import { memo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card.tsx"
import { IndianRupee, Calendar, Calculator } from "lucide-react"
import { Badge } from "@/components/ui/badge.tsx"
import { formatCurrency, calculateDailyAverage, getServiceChargeStatus } from "./serviceChargeHelper.ts"

interface ServiceChargeCardLayoutProps {
  reports: ServiceChargeReport[]
}

const MemoServiceChargeCardLayout = ({ reports }: ServiceChargeCardLayoutProps) => {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {reports.map((report: ServiceChargeReport) => {
        const dailyAverage = calculateDailyAverage(report.serviceCharge, report.from, report.to)
        const status = getServiceChargeStatus(report.serviceCharge)

        return (
          <Card key={report.businessId} className="border-l-4 border-l-primary">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center justify-between">
                <span className="truncate">{report.businessName}</span>
                <Badge
                  variant="secondary"
                  className={`ml-2 shrink-0 ${
                    status.color === "green"
                      ? "bg-green-100 text-green-800"
                      : status.color === "blue"
                        ? "bg-blue-100 text-blue-800"
                        : status.color === "yellow"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {status.status}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <IndianRupee className="w-4 h-4" />
                  Total Service Charge
                </div>
                <span className="font-semibold text-green-600 text-lg">{formatCurrency(report.serviceCharge)}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calculator className="w-4 h-4" />
                  Daily Average
                </div>
                <span className="font-semibold text-blue-600">{formatCurrency(dailyAverage)}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="w-4 h-4" />
                  Period
                </div>
                <span className="font-semibold text-sm">
                  {report.from} to {report.to}
                </span>
              </div>
              {report.serviceCharge === 0 && (
                <div className="pt-2 border-t">
                  <div className="text-center">
                    <span className="text-sm text-muted-foreground">No service charge collected</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}

const ServiceChargeCardLayout = memo(MemoServiceChargeCardLayout)
export default ServiceChargeCardLayout
