import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Plus } from "lucide-react";

interface SuccessModalProps {
  open: boolean;
  categoriesCount: number;
  dishesCount: number;
  onGoToMenu: () => void;
  onAddMore: () => void;
}

export function SuccessModal({
  open,
  categoriesCount,
  dishesCount,
  onGoToMenu,
  onAddMore,
}: SuccessModalProps) {
  return (
    <Dialog open={open}>
      <DialogContent className="bg-card border-border sm:max-w-md">
        <DialogHeader>
          <div className="flex justify-center mb-4">
            <div className="p-4 rounded-full bg-primary/10">
              <CheckCircle2 className="w-12 h-12 text-primary" />
            </div>
          </div>
          <DialogTitle className="text-center text-2xl text-foreground">
            All done! 🎉
          </DialogTitle>
          <DialogDescription className="text-center text-muted-foreground">
            Created {categoriesCount} categories and {dishesCount} dishes.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex-col sm:flex-col gap-2">
          <Button
            onClick={onGoToMenu}
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            Go to Menu
          </Button>
          <Button
            onClick={onAddMore}
            variant="outline"
            className="w-full border-border bg-transparent"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add more now
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
