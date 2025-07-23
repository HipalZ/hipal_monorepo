import { Badge } from "@/components/ui/badge.tsx";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table.tsx";
import type { ServiceChargeReport } from "@/hooks/useReportHook.ts";
import { Building2, Printer } from "lucide-react";
import { memo, useRef } from "react";
import {
  formatCurrency,
  calculateDailyAverage,
  getServiceChargeStatus,
} from "./serviceChargeHelper.ts";
import { Button } from "@/components/ui/button.tsx";
import { useReactToPrint } from "react-to-print";

interface ServiceChargeTableLayoutProps {
  reports: ServiceChargeReport[];
}

const MemoServiceChargeTableLayout = ({
  reports,
}: ServiceChargeTableLayoutProps) => {
  const totalServiceCharge = reports.reduce(
    (acc, report) => acc + report.serviceCharge,
    0,
  );
  const contentRef = useRef<HTMLDivElement>(null);

  const reactToPrintFn = useReactToPrint({
    contentRef,
  });
  return (
    <div className="space-y-4">
      {/* Print Button */}
      <div className="flex justify-end">
        <Button
          onClick={reactToPrintFn}
          variant="outline"
          size="sm"
          className="flex items-center gap-2 bg-transparent"
        >
          <Printer className="w-4 h-4" />
          Print Report
        </Button>
      </div>
      <div ref={contentRef} className="rounded-md border">
        <div className="print:block hidden p-6 border-b">
          <h1 className="text-2xl font-bold text-center">Service Charge Report</h1>
          <p className="text-center text-muted-foreground mt-2">
            Business: {reports[0].businessName || "N/A"}
          </p>
          <p className="text-center text-muted-foreground">
            Generated on: {new Date().toLocaleDateString()}
          </p>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="font-semibold">Business Name</TableHead>
              <TableHead className="text-center font-semibold">
                Period
              </TableHead>
              <TableHead className="text-right font-semibold">
                Service Charge
              </TableHead>
              <TableHead className="text-right font-semibold">
                Daily Average
              </TableHead>
              <TableHead className="text-center font-semibold">
                Status
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {reports.map((report: ServiceChargeReport) => {
              const dailyAverage = calculateDailyAverage(
                report.serviceCharge,
                report.from,
                report.to,
              );
              const status = getServiceChargeStatus(report.serviceCharge);

              return (
                <TableRow key={report.businessId} className="hover:bg-muted/50">
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-muted-foreground" />
                      <span className="truncate max-w-[200px]">
                        {report.businessName}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-center text-sm">
                    {report.from} to {report.to}
                  </TableCell>
                  <TableCell className="text-right font-semibold text-green-600 text-lg">
                    {formatCurrency(report.serviceCharge)}
                  </TableCell>
                  <TableCell className="text-right font-semibold text-blue-600">
                    {formatCurrency(dailyAverage)}
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge
                      variant="default"
                      className={
                        status.color === "green"
                          ? "bg-green-100 text-green-800"
                          : status.color === "blue"
                            ? "bg-blue-100 text-blue-800"
                            : status.color === "yellow"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-gray-100 text-gray-600"
                      }
                    >
                      {status.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              );
            })}
            {reports.length > 1 && (
              <TableRow className="bg-muted/30 font-semibold">
                <TableCell colSpan={2} className="text-right">
                  Total:
                </TableCell>
                <TableCell className="text-right text-green-600 text-lg">
                  {formatCurrency(totalServiceCharge)}
                </TableCell>
                <TableCell className="text-right text-blue-600">
                  {formatCurrency(totalServiceCharge / reports.length)}
                </TableCell>
                <TableCell></TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

const ServiceChargeTableLayout = memo(MemoServiceChargeTableLayout);
export default ServiceChargeTableLayout;
