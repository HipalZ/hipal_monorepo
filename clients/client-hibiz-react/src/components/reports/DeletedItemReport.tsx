// src/components/reports/DeletedItemsReports.tsx
import { memo, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { Trash2, Download, RefreshCw, TrendingUp } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "../ui/card.tsx";
import { Input } from "../ui/input.tsx";
import AdvancedBottomButton from "../atom/bottomButton/advancedBottomButton.tsx";
import EmptyStateInstructions from "./categoryLayouts/EmptyStateInstructions.tsx";
import useTimings from "../store/useTimings.ts";

import {
  useDownloadDeletedItemsXlsx,
  useGetDeletedItems,
} from "@/hooks/useReportHook.ts";
import DeletedItemsGroupedLayout from "@/components/reports/DeletedItemLayouts/DeletedItemTableLayout.tsx";
import { formatDateToIST } from "@/components/utils/helper";

const formatDateRange = (from?: number, to?: number) => {
  if (!from || !to) return "";
  return `${formatDateToIST(from)} ~ ${formatDateToIST(to)}`;
};

const MemoDeletedItemsReports = () => {
  const businessId = useParams().businessId;
  const timeStampStart = useTimings((s) => s.timeStampStart);
  const timeStampEnd = useTimings((s) => s.timeStampEnd);

  const { isPending, deletedItems, deletedItemsSummary, getDeletedItems } =
    useGetDeletedItems();
  const { isPending: isPendingXlsx, downloadDeletedItemsXlsx } =
    useDownloadDeletedItemsXlsx();

  const [searchQuery, setSearchQuery] = useState("");

  const hasReports =
    (deletedItems?.length ?? 0) > 0 || (deletedItemsSummary?.length ?? 0) > 0;

  const totalDeletedAmount = useMemo(
    () =>
      (deletedItems ?? []).reduce((acc, item) => acc + (item.amount ?? 0), 0),
    [deletedItems],
  );

  const totalDeletedQty = useMemo(
    () =>
      (deletedItems ?? []).reduce((acc, item) => acc + (item.quantity ?? 0), 0),
    [deletedItems],
  );

  const dateRangeLabel = formatDateRange(timeStampStart, timeStampEnd);

  const handleGenerateReport = () => {
    if (!businessId) return;
    getDeletedItems({
      from: timeStampStart,
      to: timeStampEnd,
      businessIds: [businessId],
    });
  };

  const handleDownloadReport = () => {
    if (!businessId) return;
    downloadDeletedItemsXlsx({
      from: timeStampStart,
      to: timeStampEnd,
      businessIds: [businessId],
    });
  };

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 2,
    }).format(value || 0);

  return (
    <>
      <div className="space-y-6 p-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <h2 className="text-2xl font-bold">
            <p>Deleted Items Report</p>
            {dateRangeLabel && (
              <p className="text-primary w-[60%] text-sm md:w-full">
                {dateRangeLabel}
              </p>
            )}
          </h2>

          {hasReports && (
            <div className="flex flex-col items-end gap-1 text-right text-sm text-muted-foreground md:flex-row md:items-center md:gap-3">
              <div>
                <span className="font-semibold text-rose-600">
                  {totalDeletedQty}
                </span>{" "}
                item(s) deleted
              </div>
              <div>
                <span className="font-semibold text-rose-600">
                  {formatCurrency(totalDeletedAmount)}
                </span>{" "}
                value deleted
              </div>
            </div>
          )}
        </div>

        {hasReports && (
          <div className="space-y-4 pb-[5rem]">
            <Card className="w-full">
              <CardHeader className="space-y-3">
                <CardTitle className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div className="flex items-center gap-2">
                    <Trash2 className="h-5 w-5 text-rose-600" />
                    <div className="flex flex-col">
                      <span>Deleted Items Summary by Item Key</span>
                      <span className="text-muted-foreground text-xs">
                        Search by item, extras, deleted by, or reason
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 md:w-1/2 md:flex-row md:items-center md:justify-end">
                    <div className="text-muted-foreground text-sm md:text-right">
                      {deletedItemsSummary[0]?.businessName ||
                        deletedItems[0]?.businessName ||
                        "Selected Business"}
                    </div>
                  </div>
                </CardTitle>

                {/* Search input */}
                <div className="flex w-full items-center gap-2">
                  <Input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search deleted items by name, extras, deleted by, reason, KOT, table..."
                    className="h-9 text-sm"
                  />
                </div>
              </CardHeader>

              <CardContent className="p-2">
                <DeletedItemsGroupedLayout
                  details={deletedItems ?? []}
                  summary={deletedItemsSummary ?? []}
                  searchQuery={searchQuery}
                />
              </CardContent>
            </Card>
          </div>
        )}

        {!hasReports && !isPending && (
          <EmptyStateInstructions text="Deleted Items" />
        )}
      </div>

      <AdvancedBottomButton
        maxWidth="28rem"
        fixed={true}
        buttons={[
          ...(hasReports
            ? [
                {
                  text: isPendingXlsx ? "Preparing Report..." : "Download Report",
                  onClick: handleDownloadReport,
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
            onClick: handleGenerateReport,
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

const DeletedItemsReports = memo(MemoDeletedItemsReports);
export default DeletedItemsReports;
