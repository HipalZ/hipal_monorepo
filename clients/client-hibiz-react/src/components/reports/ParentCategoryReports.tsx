import {
  useParentCategoryReports,
  useGetParentCategoryReportsXlsx,
} from "@/hooks/useReportHook.ts";
import { Download, FolderTree, RefreshCw, TrendingUp } from "lucide-react";
import { memo } from "react";
import { useParams } from "react-router-dom";
import AdvancedBottomButton from "../atom/bottomButton/advancedBottomButton.tsx";
import useReports from "../store/useReports.ts";
import useTimings from "../store/useTimings.ts";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card.tsx";
import EmptyStateInstructions from "./categoryLayouts/EmptyStateInstructions.tsx";

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(value);

const MemoParentCategoryReports = () => {
  const businessId = useParams().businessId ?? "";
  const timeStampStart = useTimings((s) => s.timeStampStart);
  const timeStampEnd = useTimings((s) => s.timeStampEnd);
  const parentCategoryReports = useReports((s) => s.parentCategoryReports);
  const { isPending, getParentCategoryReports } = useParentCategoryReports();
  const {
    isPending: isPendingXlsx,
    getParentCategoryReportsXlsx,
  } = useGetParentCategoryReportsXlsx();

  const hasReports = parentCategoryReports.length > 0;
  const hasParents =
    hasReports &&
    parentCategoryReports.some((b) => (b.parentCategories?.length ?? 0) > 0);

  const getReports = async () => {
    await getParentCategoryReports({
      from: timeStampStart,
      to: timeStampEnd,
      businessIds: businessId ? [businessId] : [],
      includeChildBreakdown: true,
    });
  };

  const downloadXlsx = async () => {
    await getParentCategoryReportsXlsx({
      from: String(timeStampStart),
      to: String(timeStampEnd),
      businessIds: businessId ? [businessId] : [],
    });
  };

  return (
    <>
      <div className="space-y-6 p-4">
        <div className="flex items-center justify-between">
          {hasParents && (
            <h2 className="text-2xl font-bold">
              <p>Parent Category Reports</p>
              <p className="text-primary w-[60%] text-sm md:w-full">
                {parentCategoryReports[0]?.from} ~ {parentCategoryReports[0]?.to}
              </p>
            </h2>
          )}
        </div>
        {hasReports && (
          <div className="space-y-6 pb-[5rem]">
            {parentCategoryReports.map((business) => (
              <Card
                key={business.businessId}
                className="w-full border-none !p-0 shadow-none"
              >
                <CardHeader className="w-full border-none p-0 pb-6 shadow-none">
                  <CardTitle className="flex items-center justify-start gap-4 text-lg font-semibold">
                    <div className="flex items-center gap-2">
                      <FolderTree className="h-5 w-5" />
                      {business.businessName}
                    </div>
                    <div className="text-muted-foreground text-sm">
                      {business.parentCategories?.length ?? 0} parent
                      {(business.parentCategories?.length ?? 0) !== 1 ? "s" : ""}
                    </div>
                    {business.validationPassed === false && (
                      <span className="text-destructive text-xs font-medium">
                        Validation: {business.validationMessage ?? "Failed"}
                      </span>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent className="border-none !p-0 shadow-none">
                  {(business.parentCategories?.length ?? 0) === 0 ? (
                    <p className="text-muted-foreground py-8 text-center">
                      No parent category data for the selected date range.
                    </p>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse">
                        <thead>
                          <tr className="border-b-2 border-gray-200">
                            <th className="p-3 text-left text-sm font-semibold text-gray-700">
                              Parent Category
                            </th>
                            <th className="p-3 text-right text-sm font-semibold text-gray-700">
                              Quantity
                            </th>
                            <th className="p-3 text-right text-sm font-semibold text-gray-700">
                              Gross
                            </th>
                            <th className="p-3 text-right text-sm font-semibold text-gray-700">
                              Discount
                            </th>
                            <th className="p-3 text-right text-sm font-semibold text-gray-700">
                              GST
                            </th>
                            <th className="p-3 text-right text-sm font-semibold text-gray-700">
                              Service Charge
                            </th>
                            <th className="p-3 text-right text-sm font-semibold text-gray-700">
                              Total Tax
                            </th>
                            <th className="p-3 text-right text-sm font-semibold text-gray-700">
                              Final Amount
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {business.parentCategories?.map((row, idx) => (
                            <tr
                              key={`${row.parentCategoryId}-${idx}`}
                              className="border-b border-gray-100 hover:bg-gray-50"
                            >
                              <td className="p-3 font-medium">
                                {row.parentCategoryName}
                              </td>
                              <td className="p-3 text-right">
                                {row.itemCount.toLocaleString()}
                              </td>
                              <td className="p-3 text-right">
                                {formatCurrency(row.grossAmount)}
                              </td>
                              <td className="p-3 text-right text-red-600">
                                {formatCurrency(row.discount)}
                              </td>
                              <td className="p-3 text-right">
                                {formatCurrency(row.gst)}
                              </td>
                              <td className="p-3 text-right">
                                {formatCurrency(row.serviceCharge)}
                              </td>
                              <td className="p-3 text-right">
                                {formatCurrency(row.totalTax)}
                              </td>
                              <td className="p-3 text-right font-semibold text-green-600">
                                {formatCurrency(row.finalAmount)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      <div className="mt-4 flex flex-wrap gap-4 text-sm text-muted-foreground">
                        <span>
                          Sum item final: {formatCurrency(business.sumItemFinalAmount)}
                        </span>
                        <span>
                          Sum parent final: {formatCurrency(business.sumParentFinalAmount)}
                        </span>
                        <span>
                          {business.validationPassed ? "✓ Reconciled" : "✗ Mismatch"}
                        </span>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {!hasReports && !isPending && (
          <EmptyStateInstructions text="Parent Category" />
        )}
      </div>

      <AdvancedBottomButton
        maxWidth="28rem"
        fixed={true}
        buttons={[
          ...(hasParents
            ? [
                {
                  text: isPendingXlsx ? "Preparing Report..." : "Download Report",
                  onClick: downloadXlsx,
                  className: "w-full md:max-w-[12rem]",
                  color: "#2563eb",
                  disable: isPendingXlsx,
                  isBackButton: false,
                  icon: isPendingXlsx ? (
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
            className: hasParents
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

const ParentCategoryReports = memo(MemoParentCategoryReports);
export default ParentCategoryReports;
