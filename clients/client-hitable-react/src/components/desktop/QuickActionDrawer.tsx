import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import type { LucideIcon } from "lucide-react";
import { Bell, CreditCard, Menu, Monitor, UserCheck } from "lucide-react";
import { memo, useState } from "react";

export interface QuickAction {
  name: string;
  icon: LucideIcon;
  onClick: () => void;
  variant?:
    | "default"
    | "destructive"
    | "outline"
    | "secondary"
    | "ghost"
    | "link";
}

interface QuickActionsDrawerProps {
  customActions?: QuickAction[];
  onPayments?: () => void;
  onAlerts?: () => void;
  onCheckIn?: () => void;
  onKDS?: () => void;
}

const MemoQuickActionsDrawer = ({
  customActions = [],
  onPayments,
  onAlerts,
  onCheckIn,
  onKDS,
}: QuickActionsDrawerProps) => {
  const [open, setOpen] = useState(false);

  // Predefined actions
  const predefinedActions: QuickAction[] = [
    {
      name: "Payments",
      icon: CreditCard,
      onClick: () => {
        onPayments?.();
        setOpen(false);
      },
      variant: "default" as const,
    },
    {
      name: "Alerts",
      icon: Bell,
      onClick: () => {
        onAlerts?.();
        setOpen(false);
      },
      variant: "default" as const,
    },
    {
      name: "Check In",
      icon: UserCheck,
      onClick: () => {
        onCheckIn?.();
        setOpen(false);
      },
      variant: "default" as const,
    },
    {
      name: "KDS",
      icon: Monitor,
      onClick: () => {
        onKDS?.();
        setOpen(false);
      },
      variant: "default" as const,
    },
  ].filter((action) => {
    // Only include actions that have callbacks
    if (action.name === "Payments" && !onPayments) return false;
    if (action.name === "Alerts" && !onAlerts) return false;
    if (action.name === "Check In" && !onCheckIn) return false;
    if (action.name === "KDS" && !onKDS) return false;
    return true;
  });

  // Combine predefined and custom actions
  const allActions = [...predefinedActions, ...customActions];

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        {/* <Button variant="ghost" size="icon"> */}
        <Menu size={24} strokeWidth={3} />
        {/* </Button> */}
      </SheetTrigger>
      <SheetContent side="left" className="w-[300px] sm:w-[400px]">
        <SheetHeader>
          <SheetTitle>Quick Actions</SheetTitle>
          <SheetDescription>
            Access frequently used features and actions
          </SheetDescription>
        </SheetHeader>
        <div className="mt-6 space-y-2">
          {allActions.map((action, index) => {
            const Icon = action.icon;
            return (
              <Button
                key={`${action.name}-${index}`}
                variant={action.variant || "outline"}
                className="h-12 w-full justify-start gap-3"
                onClick={() => {
                  action.onClick();
                  setOpen(false);
                }}
              >
                <Icon className="h-5 w-5" />
                <span className="text-base">{action.name}</span>
              </Button>
            );
          })}
          {allActions.length === 0 && (
            <p className="text-muted-foreground py-8 text-center text-sm">
              No actions available
            </p>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};

export const QuickActionsDrawer = memo(MemoQuickActionsDrawer);
