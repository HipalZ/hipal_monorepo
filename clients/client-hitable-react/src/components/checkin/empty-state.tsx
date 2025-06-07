import { memo } from "react";
import { User } from "lucide-react";
import { Button } from "../ui/button.tsx";

interface EmptyStateProps {
  searchTerm: string;
  emptyStateSearchTerm: () => void;
}

const EmptyState = memo(
  ({ searchTerm, emptyStateSearchTerm }: EmptyStateProps) => {
    return (
      <div className="text-center py-12">
        <User className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">No users found</h3>
        <p className="text-muted-foreground">
          {searchTerm
            ? "Try adjusting your search terms"
            : "No check-in users available"}
        </p>
        <Button onClick={emptyStateSearchTerm} className="mt-2">
          Clear Search
        </Button>
      </div>
    );
  },
);

EmptyState.displayName = "EmptyState";

export default EmptyState;
