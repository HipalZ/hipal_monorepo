import { Button } from "@/components/ui/button.tsx";
import { LayoutGrid, List, Grid3X3 } from "lucide-react";
import useReports from "../store/useReports.ts";
import { memo } from "react";

const MemoLayoutToggleButtons = () => {
  const layout = useReports((s) => s.layoutType);
  const setLayout = useReports((s) => s.setLayoutType);
  return (
    <div className="flex items-center border rounded-lg p-1">
      <Button
        variant={layout === "cards" ? "default" : "ghost"}
        size="sm"
        onClick={() => setLayout("cards")}
        className="h-8 px-2"
        title="Card View"
      >
        <LayoutGrid className="w-4 h-4" />
      </Button>
      <Button
        variant={layout === "table" ? "default" : "ghost"}
        size="sm"
        onClick={() => setLayout("table")}
        className="h-8 px-2"
        title="Table View"
      >
        <List className="w-4 h-4" />
      </Button>
      <Button
        variant={layout === "compact" ? "default" : "ghost"}
        size="sm"
        onClick={() => setLayout("compact")}
        className="h-8 px-2"
        title="Compact View"
      >
        <Grid3X3 className="w-4 h-4" />
      </Button>
    </div>
  );
};

const LayoutToggleButtons = memo(MemoLayoutToggleButtons);
export default LayoutToggleButtons;
