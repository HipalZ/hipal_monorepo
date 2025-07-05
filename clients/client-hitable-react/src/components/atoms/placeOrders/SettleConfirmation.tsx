import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { SettlingLoader } from "./SettlingLoader.tsx"

interface SettleConfirmationDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
  isLoading?: boolean
  showSettlingLoader?: boolean
}

export function SettleConfirmationDialog({
  open,
  onOpenChange,
  onConfirm,
  isLoading = false,
  showSettlingLoader = false,
}: SettleConfirmationDialogProps) {
  return (
    <>
      <AlertDialog open={open && !showSettlingLoader} onOpenChange={onOpenChange}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Settlement</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to confirm settle? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={onConfirm} disabled={isLoading}>
              {isLoading ? "Processing..." : "Confirm"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <SettlingLoader isVisible={showSettlingLoader} message="Settling table, please wait..." />
    </>
  )
}
