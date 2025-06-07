import { memo } from "react";
import { Search, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type FilterType = "alphabetical" | "newest" | "oldest" | "descending";

interface FilterControlsProps {
  searchTerm: string;
  filterType: FilterType;
  onSearchChange: (value: string) => void;
  onFilterChange: (value: FilterType) => void;
}

const FilterControls = memo(
  ({
    searchTerm,
    filterType,
    onSearchChange,
    onFilterChange,
  }: FilterControlsProps) => {
    return (
      <div className="sticky top-0 z-10 bg-background pt-2 pb-4 border-b">
        <div className="flex flex-col gap-4 md:flex-row items-start justify-between">
          <div className="relative flex-1 w-full max-w-[28rem]">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search by name, code, or phone..."
              value={searchTerm}
              type="search"
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10 !w-full"
            />
          </div>
          <Select value={filterType} onValueChange={onFilterChange}>
            <SelectTrigger className="w-full sm:w-48">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest First</SelectItem>
              <SelectItem value="oldest">Oldest First</SelectItem>
              <SelectItem value="alphabetical">A-Z</SelectItem>
              <SelectItem value="descending">Z-A</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    );
  },
);

FilterControls.displayName = "FilterControls";

export default FilterControls;
