// src/components/menu/MenuListModal.tsx
import { memo, useState } from "react";
import BottomPopUp from "@/components/atoms/universalPopup";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { CheckCircle2 } from "lucide-react";
import { useGetAllMenuByBusinessId } from "@/hooks/useGetAllMenuByBusinessId";
import {
  dayNames,
  type WeekDay,
  useBusinessMenuStore,
  type BusinessMenu,
} from "@/components/store/useBusinessStore";

type MenuListModalProps = {
  show: boolean;
  onClose: () => void;
  businessId?: string | null;
  refreshCategories?: () => Promise<any> | void;
};

const MenuListModalComponent = ({
  show,
  onClose,
  businessId,
  refreshCategories,
}: MenuListModalProps) => {
  const { menus, isLoading, isError, error, refetch } =
    useGetAllMenuByBusinessId(businessId || "");

  const selectedMenu = useBusinessMenuStore((s) => s.selectedMenu);
  const setSelectedMenu = useBusinessMenuStore((s) => s.setSelectedMenu);

  const [isApplying, setIsApplying] = useState(false);

  const handleSelectMenu = async (menu: BusinessMenu) => {
    if (isApplying) return;
    if (selectedMenu?._id === menu._id) return;

    try {
      setIsApplying(true);
      setSelectedMenu(menu);
    //   if(refreshCategories) {
    //     await refreshCategories();
    //   }
    } finally {
      setIsApplying(false);
    }
  };

  return (
    <BottomPopUp
      width="w-full max-w-[64rem]"
      height="h-[100dvh] lg:h-[90dvh]"
      onClose={onClose}
      show={show}
      rightTopBack
      hide
    >
      <div className="relative flex h-full flex-col">
        {/* Applying overlay */}
        {isApplying && (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-background/80 backdrop-blur-sm">
            <div className="flex flex-col items-center gap-3">
              <div className="h-10 w-10 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              <div className="text-sm font-semibold">Applying menu…</div>
              <div className="text-xs text-foreground/70">
                Please wait while we update categories.
              </div>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="border-b px-4 py-3">
          <div className="flex items-center justify-between gap-2">
            <div>
              <h2 className="text-xl font-bold">Business Menus</h2>
              <p className="text-xs font-semibold text-foreground/70">
                Tap a card to select it. The active menu will be marked with the{" "}
                <span className="font-bold">Selected</span> tag.
              </p>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={() => refetch()}
              disabled={isApplying}
            >
              Refresh
            </Button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-4 py-3">
          {isLoading && (
            <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
              Loading menus…
            </div>
          )}

          {isError && !isLoading && (
            <div className="rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
              Failed to load menus: {String(error)}
            </div>
          )}

          {!isLoading && !isError && menus.length === 0 && (
            <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
              No menus found for this business.
            </div>
          )}

          {!isLoading && !isError && menus.length > 0 && (
            <div className="grid gap-3 md:grid-cols-2">
              {menus.map((menu) => {
                const isSelected = selectedMenu?._id === menu._id;

                const primary = menu.primaryColor || "#6366f1";
                const secondary = menu.secondaryColor || "#eef2ff";

                return (
                  <button
                    key={menu._id}
                    type="button"
                    onClick={() => handleSelectMenu(menu)}
                    disabled={isApplying}
                    className={cn(
                      "relative flex flex-col gap-3 rounded-xl border p-3 text-left shadow-sm transition-all overflow-hidden",
                      "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary",
                      "cursor-pointer",
                      isSelected
                        ? "border-primary shadow-md"
                        : "border-border opacity-60 hover:opacity-80",
                      isApplying && "cursor-not-allowed",
                    )}
                    style={
                      isSelected
                        ? {
                            background: `linear-gradient(135deg, ${primary}15, ${secondary}15)`,
                          }
                        : { background: "hsl(var(--primary) / 0.05)" }
                    }
                  >
                    {/* Top-right Selected tag */}
                    {isSelected && (
                      <div className="absolute right-0 top-0 flex items-center gap-1 bg-primary text-secondary px-2 py-[2px] text-[16px] font-semibold">
                        <CheckCircle2 className="h-5 w-5" />
                        Selected
                      </div>
                    )}

                    {/* Colored strip */}
                    <div
                      className="h-1.5 w-full rounded-full"
                      style={{
                        background: `linear-gradient(90deg, ${primary}, ${secondary})`,
                      }}
                    />

                    {/* Title row */}
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="text-sm font-bold">
                          {menu.name}
                        </div>
                        <div className="mt-1 text-xs font-semibold text-foreground/70">
                          Service: {menu.serviceType || "N/A"} · Layout:{" "}
                          {menu.categoryLayout}/{menu.cardLayout}
                        </div>
                      </div>
                    </div>

                    {/* Days */}
                    <div className="rounded-md bg-muted/40 px-2 py-1.5">
                      <div className="text-[11px] font-semibold text-foreground/70">
                        Active Days
                      </div>
                      <div className="mt-1 flex flex-wrap gap-1">
                        {Array.isArray(menu.days) && menu.days.length > 0 ? (
                          menu.days.map((d: WeekDay) => (
                            <span
                              key={d}
                              className={cn(
                                "rounded-full px-2 py-[2px] text-[10px] font-medium shadow-sm",
                                isSelected
                                  ? "bg-primary/10 text-primary"
                                  : "bg-background text-foreground/80",
                              )}
                            >
                              {dayNames[d as WeekDay]}
                            </span>
                          ))
                        ) : (
                          <span className="text-[11px] text-muted-foreground">
                            No days configured
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Footer info */}
                    <div className="flex items-center justify-between text-[11px] text-foreground/70">
                      <span>
                        Menu type:{" "}
                        <span className="font-semibold">
                          {menu.menuType}
                        </span>
                      </span>
                      <span>
                        Active:{" "}
                        <span
                          className={cn(
                            "font-semibold",
                            menu.isActive
                              ? "text-emerald-600"
                              : "text-red-500",
                          )}
                        >
                          {menu.isActive ? "Yes" : "No"}
                        </span>
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t px-4 py-3">
          <div className="flex justify-end">
            <Button
              variant="outline"
              size="sm"
              onClick={onClose}
              disabled={isApplying}
            >
              Close
            </Button>
          </div>
        </div>
      </div>
    </BottomPopUp>
  );
};

const MenuListModal = memo(MenuListModalComponent);
export default MenuListModal;
