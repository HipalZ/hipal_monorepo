import { memo } from "react";
import BottomPopUp from "@/components/atoms/universalPopup";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import type { KotPrintQueueEntry } from "@/components/hooks/useCheckKotStatus";
import { AlertTriangle, Printer } from "lucide-react";
import { useStaffPermissionStore } from "@/components/store/usePermissions";

type FailedKotListModalProps = {
  show: boolean;
  onClose: () => void;
  failed: KotPrintQueueEntry[];
  failedCount: number;
  onReprintKot?: (entry: KotPrintQueueEntry) => void;
};

const FailedKotListModalComponent = ({
  show,
  onClose,
  failed,
  failedCount,
  onReprintKot,
}: FailedKotListModalProps) => {
  const hasPermission = useStaffPermissionStore((s) => s.hasPermission);
  const canReprintKot = hasPermission("re_print_kot");
  return (
    <BottomPopUp
      width="w-full max-w-[40rem]"
      height="h-[100dvh] lg:h-[90dvh]"
      onClose={onClose}
      show={show}
      rightTopBack
      hide
    >
      <div className="flex h-full flex-col">
        {/* Header */}
        <div className="border-b px-4 py-3">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              <div>
                {/* Heading: bold, lg */}
                <h2 className="text-lg font-bold">
                  Failed KOT Prints ({failedCount})
                </h2>
                {/* Subheading: bold + opacity 80%, base/sm */}
                <p className="text-sm font-semibold text-foreground/80">
                  These KOTs did not print correctly. Review and reprint if
                  needed.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 px-4 py-3">
          {failed.length === 0 ? (
            <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
              No failed KOTs at the moment.
            </div>
          ) : (
            <ScrollArea className="h-full">
              <div className="pb-8 grid grid-cols-1 gap-4 md:grid-cols-2">
                {failed.map((entry) => {
                  const date = new Date(entry.date);
                  const dateStr = date.toLocaleDateString();
                  const timeStr = date.toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  });

                  return (
                    <Card
                      key={entry._id}
                      className={cn(
                        "border border-red-200 bg-red-50/80 shadow-sm",
                        "dark:border-red-900/60 dark:bg-red-950/40",
                      )}
                    >
                      <CardContent className="p-3">
                        <div className="flex items-start justify-between gap-2">
                          <div className="space-y-1">
                            {/* Heading: lg, bold */}
                            <h3 className="text-lg font-bold">
                              Table {entry.tableName}
                            </h3>

                            {/* Subheading: bold + opacity 80, sm/base */}
                            <p className="text-sm font-semibold text-foreground/80">
                              Captain: {entry.userId?.name ?? "Unknown"} ·{" "}
                              {dateStr} · {timeStr}
                            </p>
                          </div>

                          <Badge
                            variant="outline"
                            className="border-red-400 bg-red-100 text-xs font-semibold text-red-700 dark:border-red-700 dark:bg-red-900/40 dark:text-red-200"
                          >
                            FAILED
                          </Badge>
                        </div>

                        <div className="mt-3 flex items-center justify-between text-xs text-foreground/70">
                          <span>
                            Phone:{" "}
                            <span className="font-semibold">
                              {entry.userId?.phone ?? "N/A"}
                            </span>
                          </span>
                          {onReprintKot && canReprintKot && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="flex items-center gap-1 text-xs"
                              onClick={() => onReprintKot(entry)}
                            >
                              <Printer className="h-3 w-3" />
                              Reprint
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </ScrollArea>
          )}
        </div>
      </div>
    </BottomPopUp>
  );
};

export const FailedKotListModal = memo(FailedKotListModalComponent);
