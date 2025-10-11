import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface RefreshGuardModalProps {
  open: boolean;
  onStay: () => void;
  onLeave: () => void;
}

export function RefreshGuardModal({
  open,
  onStay,
  onLeave,
}: RefreshGuardModalProps) {
  return (
    <AlertDialog open={open}>
      <AlertDialogContent className="bg-card border-border">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-foreground">
            Leave this page?
          </AlertDialogTitle>
          <AlertDialogDescription className="text-muted-foreground">
            Your extracted menu isn't saved yet. If you refresh or close now,
            you'll lose your changes.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel
            onClick={onLeave}
            className="bg-muted text-foreground"
          >
            Discard & leave
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onStay}
            className="bg-primary text-primary-foreground"
          >
            Stay on page
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
