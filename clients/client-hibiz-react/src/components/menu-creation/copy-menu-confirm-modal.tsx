import { memo } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Copy, FileQuestion } from "lucide-react"

interface CopyMenuConfirmModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: (copyComplete: boolean) => void
  sourceMenuName: string
}

const CopyMenuConfirmModal = memo(({ isOpen, onClose, onConfirm, sourceMenuName }: CopyMenuConfirmModalProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileQuestion className="w-5 h-5" />
            Copy Menu Items?
          </DialogTitle>
          <DialogDescription>Do you want to copy all dishes and categories from "{sourceMenuName}"?</DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <div className="space-y-4">
            <div className="p-4 border rounded-lg bg-primary/5 border-primary/20">
              <h3 className="mb-2 font-medium text-primary">Copy Complete Menu</h3>
              <p className="text-sm text-gray-600">
                This will copy all dishes, categories, and their relationships from the source menu. You'll be able to
                make changes after copying.
              </p>
            </div>

            <div className="p-4 border border-gray-200 rounded-lg bg-gray-50">
              <h3 className="mb-2 font-medium">Copy Structure Only</h3>
              <p className="text-sm text-gray-600">
                This will only copy the menu structure (layout, colors, etc.) without copying any dishes or categories.
                You'll need to add your own content.
              </p>
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <div className="flex gap-2">
            <Button variant="secondary" onClick={() => onConfirm(false)}>
              Structure Only
            </Button>
            <Button onClick={() => onConfirm(true)} className="gap-2">
              <Copy className="w-4 h-4" />
              Copy Complete Menu
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
})

CopyMenuConfirmModal.displayName = "CopyMenuConfirmModal"
export default CopyMenuConfirmModal

