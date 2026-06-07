import {
  useGetServiceChargeReportsCsv,
  useServiceChargeReports,
} from "@/hooks/useReportHook.ts";
import {
  CreditCard,
  Download,
  IndianRupee,
  RefreshCw,
  TrendingUp,
} from "lucide-react";
import { memo } from "react";
import { useParams } from "react-router-dom";
import AdvancedBottomButton from "../atom/bottomButton/advancedBottomButton.tsx";
import useReports from "../store/useReports.ts";
import useTimings from "../store/useTimings.ts";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card.tsx";
import EmptyStateInstructions from "./categoryLayouts/EmptyStateInstructions.tsx";
import LayoutToggleButtons from "./LayoutToggleButtons.tsx";
import ServiceChargeCompactLayout from "./serviceChargeLayouts/ServiceChargeCompactLayout.tsx";
import { formatCurrency } from "./serviceChargeLayouts/serviceChargeHelper.ts";
import ServiceChargeTableLayout from "./serviceChargeLayouts/ServiceChargeTableLayout.tsx";

const MemoServiceChargeReports = () => {
  const businessId = useParams().businessId;
  const timeStampStart = useTimings((s) => s.timeStampStart);
  const timeStampEnd = useTimings((s) => s.timeStampEnd);
  const serviceChargeReports = useReports((s) => s.serviceChargeReports);
  const { isPending, getServiceChargeReports } = useServiceChargeReports();
  const { isPending: isPendingCsv, getServiceChargeReportsCsv } =
    useGetServiceChargeReportsCsv();
  const layout = useReports((s) => s.layoutType);

  const hasReports = serviceChargeReports.length > 0;
  const totalServiceCharge = hasReports
    ? serviceChargeReports.reduce(
        (acc, report) => acc + report.serviceCharge,
        0,
      )
    : 0;

  const getReports = () => {
    getServiceChargeReports({
      from: timeStampStart,
      to: timeStampEnd,
      businessIds: [businessId],
    });
  };

  const downloadReports = () => {
    getServiceChargeReportsCsv({
      from: timeStampStart,
      to: timeStampEnd,
      businessIds: [businessId],
    });
  };

  return (
    <>
      <div className="space-y-6 p-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">
            <p>Service Charge Reports</p>
            <p className="text-primary w-[60%] text-sm md:w-full">
              {serviceChargeReports[0]?.from} ~ {serviceChargeReports[0]?.to}
            </p>
          </h2>
          {hasReports && (
            <div className="flex items-center gap-2">
              {/* Summary Badge */}
              <div className="hidden items-center gap-2 rounded-lg border bg-green-50 px-3 py-1 md:flex">
                <IndianRupee className="h-4 w-4 text-green-600" />
                <span className="text-sm font-semibold text-green-700">
                  Total: {formatCurrency(totalServiceCharge)}
                </span>
              </div>
              <LayoutToggleButtons />
            </div>
          )}
        </div>

        {hasReports && (
          <div className="space-y-6 pb-[5rem]">
            <Card className="w-full">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5" />
                    Service Charge Summary
                  </div>
                  <div className="text-muted-foreground text-sm">
                    {serviceChargeReports.length} business(es)
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-2">
                {serviceChargeReports.length === 0 ? (
                  <p className="text-muted-foreground py-8 text-center">
                    No service charge data available for the selected date
                    range.
                  </p>
                ) : (
                  <>
                    {layout === "table" && (
                      <ServiceChargeTableLayout
                        reports={serviceChargeReports}
                      />
                    )}
                    {layout === "compact" && (
                      <ServiceChargeCompactLayout
                        reports={serviceChargeReports}
                      />
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {!hasReports && !isPending && (
          <EmptyStateInstructions text="Service Charge" />
        )}
      </div>

      <AdvancedBottomButton
        maxWidth="28rem"
        fixed={true}
        buttons={[
          // Only show download button if reports exist
          ...(hasReports
            ? [
                {
                  text: isPendingCsv ? "Preparing Report..." : "Download Report",
                  onClick: downloadReports,
                  className: "w-full md:max-w-[12rem]",
                  color: "#2563eb",
                  disable: isPendingCsv,
                  isBackButton: false,
                  icon: isPendingCsv ? (
                    <RefreshCw className="h-4 w-4 animate-spin" />
                  ) : (
                    <Download className="h-4 w-4" />
                  ),
                },
              ]
            : []),
          {
            text: isPending ? "Generating..." : "Generate Report",
            onClick: getReports,
            className: hasReports
              ? "w-full md:max-w-[14rem]"
              : "w-full md:max-w-[24rem]",
            disable: isPending,
            isBackButton: false,
            icon: isPending ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <TrendingUp className="h-4 w-4" />
            ),
          },
        ]}
      />
    </>
  );
};

const ServiceChargeReports = memo(MemoServiceChargeReports);
export default ServiceChargeReports;
