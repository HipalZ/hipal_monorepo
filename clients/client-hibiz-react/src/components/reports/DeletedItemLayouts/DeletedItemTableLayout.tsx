// src/components/reports/DeletedItemLayouts/DeletedItemTableLayout.tsx
import { memo, useMemo, type ReactNode } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table.tsx";
import type {
  DeletedItemRow,
  DeletedItemSummaryRow,
} from "@/hooks/useReportHook.ts";
import { Package2, Trash2 } from "lucide-react";

interface DeletedItemsGroupedLayoutProps {
  details: DeletedItemRow[];
  summary: DeletedItemSummaryRow[];
  searchQuery?: string;
}

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(value || 0);

const highlightText = (text: string, query?: string): ReactNode => {
  if (!query || !query.trim()) return text;
  const q = query.toLowerCase();
  const t = (text ?? "").toString();
  const lower = t.toLowerCase();

  const parts: ReactNode[] = [];
  let currentIndex = 0;
  let matchIndex = lower.indexOf(q);
  let key = 0;

  while (matchIndex !== -1) {
    if (matchIndex > currentIndex) {
      parts.push(
        <span key={`text-${key++}`}>{t.slice(currentIndex, matchIndex)}</span>,
      );
    }

    const matchText = t.slice(matchIndex, matchIndex + q.length);
    parts.push(
      <span
        key={`match-${key++}`}
        className="text-foreground rounded-sm bg-yellow-200/80 px-0.5 font-semibold dark:bg-yellow-500/40"
      >
        {matchText}
      </span>,
    );

    currentIndex = matchIndex + q.length;
    matchIndex = lower.indexOf(q, currentIndex);
  }

  if (currentIndex < t.length) {
    parts.push(<span key={`rest-${key++}`}>{t.slice(currentIndex)}</span>);
  }

  return <span>{parts}</span>;
};

const MemoDeletedItemsGroupedLayout = ({
  details,
  summary,
  searchQuery,
}: DeletedItemsGroupedLayoutProps) => {
  const normalizedQuery = (searchQuery ?? "").trim().toLowerCase();

  const groups = useMemo(() => {
    const summaryMap = new Map<string, DeletedItemSummaryRow>();
    for (const s of summary ?? []) {
      summaryMap.set(s.itemKey, s);
    }

    type Group = {
      summary: DeletedItemSummaryRow;
      lines: DeletedItemRow[];
    };

    const groupMap = new Map<string, Group>();

    for (const line of details ?? []) {
      const key = line.itemKey;
      let group = groupMap.get(key);

      if (!group) {
        const baseSummary =
          summaryMap.get(key) ??
          ({
            businessId: line.businessId,
            businessName: line.businessName,
            itemKey: line.itemKey,
            dishName: line.dishName,
            portionName: line.portionName,
            extrasSummary: line.extrasSummary,
            deleteCount: 1,
            totalQuantity: line.quantity,
            totalAmount: line.amount,
            averageRate: line.rate,
            deletedByList: line.deletedBy ? [line.deletedBy] : [],
            reasons: line.reasonOfDeletion ? [line.reasonOfDeletion] : [],
          } satisfies DeletedItemSummaryRow);

        group = {
          summary: baseSummary,
          lines: [],
        };
        groupMap.set(key, group);
      }

      group.lines.push(line);
    }

    // Sort groups by totalAmount desc (heaviest loss on top)
    return Array.from(groupMap.values()).sort(
      (a, b) => b.summary.totalAmount - a.summary.totalAmount,
    );
  }, [details, summary]);

  const filteredGroups = useMemo(() => {
    if (!normalizedQuery) return groups;

    return groups.filter((group) => {
      const s = group.summary;

      const inHeader = [
        s.dishName,
        s.portionName,
        s.extrasSummary,
        s.businessName,
      ]
        .filter(Boolean)
        .some((v) => v!.toLowerCase().includes(normalizedQuery));

      if (inHeader) return true;

      // Check each line for matches in deletedBy, reason, KOT, table, etc.
      return group.lines.some((line) => {
        if ((line.deletedBy ?? "").toLowerCase().includes(normalizedQuery)) {
          return true;
        }
        if (
          (line.reasonOfDeletion ?? "").toLowerCase().includes(normalizedQuery)
        ) {
          return true;
        }
        if ((line.tableName ?? "").toLowerCase().includes(normalizedQuery)) {
          return true;
        }
        const kotStr = String(line.kotInvoiceNumber ?? "");
        if (kotStr.includes(normalizedQuery)) {
          return true;
        }
        return false;
      });
    });
  }, [groups, normalizedQuery]);

  if (!filteredGroups.length) {
    return (
      <p className="text-muted-foreground py-6 text-center text-sm">
        {normalizedQuery
          ? "No deleted items match your search."
          : "No deleted items found for the selected period."}
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {filteredGroups.map((group) => {
        const s = group.summary;
        const totalQty = s.totalQuantity;
        const deleteCount = s.deleteCount;
        const totalAmount = s.totalAmount;

        return (
          <div
            key={s.itemKey}
            className="overflow-hidden rounded-md border bg-card shadow-sm"
          >
            {/* Item header */}
            <div className="flex items-start justify-between gap-3 border-b bg-muted/60 px-4 py-3">
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <Package2 className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-semibold md:text-base">
                    {highlightText(s.dishName, searchQuery)}
                  </span>
                </div>
                <div className="text-[11px] text-muted-foreground md:text-xs">
                  {s.portionName && (
                    <span>{highlightText(s.portionName, searchQuery)}</span>
                  )}
                  {s.portionName && s.extrasSummary && <span> · </span>}
                  {s.extrasSummary && (
                    <span>{highlightText(s.extrasSummary, searchQuery)}</span>
                  )}
                </div>
                <div className="text-[11px] text-muted-foreground">
                  {highlightText(s.businessName ?? "", searchQuery)}
                </div>
              </div>

              <div className="space-y-0.5 text-right text-[11px] md:text-xs">
                <div>
                  <span className="font-semibold text-rose-700">
                    {deleteCount}
                  </span>{" "}
                  time{deleteCount > 1 ? "s" : ""} deleted
                </div>
                <div>
                  <span className="font-semibold">{totalQty}</span> qty removed
                </div>
                <div className="font-semibold text-rose-700">
                  {formatCurrency(totalAmount)}
                </div>
              </div>
            </div>

            {/* Per-delete lines */}
            <div className="px-3 pb-3 pt-2">
              <div className="mb-1 flex items-center gap-1 text-[11px] text-muted-foreground">
                <Trash2 className="h-3 w-3 text-rose-600" />
                <span>Delete history (quantity · deleted by · reason)</span>
              </div>

              <Table className="text-[11px] md:text-xs">
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[120px]">KOT / Table</TableHead>
                    <TableHead className="text-center">Qty</TableHead>
                    <TableHead className="text-center">Deleted By</TableHead>
                    <TableHead>Reason</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {group.lines.map((line, idx) => (
                    <TableRow
                      key={`${line.kotId}-${line.itemKey}-${idx}`}
                      className="hover:bg-muted/40"
                    >
                      <TableCell className="align-top">
                        <div className="flex flex-col gap-0.5">
                          <span className="text-xs font-medium">
                            #{line.kotInvoiceNumber ?? "-"}
                          </span>
                          <span className="text-[10px] text-muted-foreground">
                            {highlightText(line.tableName || "—", searchQuery)}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="align-top text-center font-semibold">
                        {line.quantity}
                      </TableCell>
                      <TableCell className="align-top text-center">
                        {highlightText(line.deletedBy || "—", searchQuery)}
                      </TableCell>
                      <TableCell className="max-w-[260px] whitespace-pre-wrap align-top text-[10px] text-muted-foreground">
                        {highlightText(
                          line.reasonOfDeletion || "—",
                          searchQuery,
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        );
      })}
    </div>
  );
};

const DeletedItemsGroupedLayout = memo(MemoDeletedItemsGroupedLayout);
export default DeletedItemsGroupedLayout;
