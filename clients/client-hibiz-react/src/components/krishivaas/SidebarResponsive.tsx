import { memo } from "react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu, MessageSquare, Workflow, BarChart3 } from "lucide-react";

type Item = { key: string; label: string; icon: React.FC<React.SVGProps<SVGSVGElement>> };
const NAV_ITEMS: Item[] = [
  { key: "templates", label: "Templates", icon: MessageSquare },
  { key: "flows", label: "Flows", icon: Workflow },
  { key: "analytics", label: "Analytics", icon: BarChart3 },
];

function DesktopRail({
  active,
  onSelect,
  logo,
  avatarUrl,
  userName = "User",
}: {
  active: string;
  onSelect: (key: string) => void;
  logo: string;
  avatarUrl?: string;
  userName?: string;
}) {
  return (
    <div
      className={`hidden md:flex fixed left-0 top-0 z-40 h-screen border-r bg-white transition-[width] duration-200 w-64
     `}
    >
      <div className="flex flex-col w-full">
        {/* Header */}
        <div className="h-[64px] flex items-center gap-3 px-3">
          <img src={logo} alt="logo" className="h-10 w-10" />
          <div
            className={"poppins-regular text-sm font-semibold text-gray-900 transition-opacity duration-200"}
          >
            Krishivaas
          </div>
        </div>
        <Separator />
        <TooltipProvider>
          <ScrollArea className="flex-1">
            <div className="flex flex-col gap-3 px-3 py-6">
              {NAV_ITEMS.map((n) => {
                const Icon = n.icon;
                const isActive = n.key === active;
                const base =
                  "w-full justify-start gap-3 rounded-xl h-12 bg-gray-100 hover:bg-gray-200";
                const activeCls = isActive ? "bg-orange-500 hover:bg-orange-500/90 text-white" : "";
                const iconCls = isActive ? "text-white" : "text-black";

                const button = (
                  <Button
                    key={n.key}
                    variant="ghost"
                    className={`${base} ${activeCls}`}
                    onClick={() => onSelect(n.key)}
                  >
                    <Icon className={`h-5 w-5 ${iconCls}`} />
                    <span
                      className={"transition-opacity duration-200 truncate poppins-regular"}
                    >
                      {n.label}
                    </span>
                  </Button>
                );
                return button
              })}
            </div>
          </ScrollArea>
        </TooltipProvider>

        <Separator />

        {/* User */}
        <div className="flex items-center gap-3 p-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={avatarUrl} />
            <AvatarFallback>{userName[0]}</AvatarFallback>
          </Avatar>
          <div
            className={"min-w-0 transition-opacity duration-200"}
          >
            <div className="truncate text-sm font-medium">{userName}</div>
            <div className="truncate text-xs text-muted-foreground">Logged in</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function MemoSidebarResponsive({
  active,
  onSelect,
  logo,
  avatarUrl,
  userName,
}: {
  active: string;
  onSelect: (key: string) => void;
  logo: string;
  avatarUrl?: string;
  userName?: string;
}) {
  return (
    <>
      <DesktopRail active={active} onSelect={onSelect} logo={logo} avatarUrl={avatarUrl} userName={userName} />
      <div className="md:hidden fixed left-2 top-2 z-50">
        <Sheet>
          <SheetTrigger asChild>
            <Button size="icon" variant="outline" aria-label="Open menu">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-[80vw] max-w-[200px]">
            <div className="h-full flex flex-col">
              <div className="h-[64px] flex items-center gap-3 px-4">
                <img src={logo} alt="logo" className="h-10 w-10" />
                <div className="text-sm font-semibold">Krishivaas</div>
              </div>
              <Separator />
              <ScrollArea className="flex-1 px-3 gap-3 py-6">
                {NAV_ITEMS.map((n) => {
                  const Icon = n.icon;
                  const isActive = n.key === active;
                  return (
                    <div className="mb-3" key={n.key}>
                      <Button
                        key={n.key}
                        variant="ghost"
                        className={`w-full justify-start gap-3 rounded-xl h-12 bg-gray-100 hover:bg-gray-200
                        ${isActive ? "bg-orange-500 hover:bg-orange-500/90 text-white" : ""}`}
                        onClick={() => onSelect(n.key)}
                      >
                        <Icon className={`h-5 w-5 ${isActive ? "text-white" : "text-black"}`} />
                        <span className="truncate poppins-regular">{n.label}</span>
                      </Button>
                    </div>
                  );
                })}
              </ScrollArea>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </>
  );
}

const SidebarResponsive = memo(MemoSidebarResponsive);
export default SidebarResponsive;