import { memo } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface PasswordDialogProps {
  isOpen: boolean
  password: string
  passwordError: string
  onOpenChange: (open: boolean) => void
  onPasswordChange: (password: string) => void
  onSubmit: () => void
  onCancel: () => void
}

const PasswordDialog = memo(
  ({ isOpen, password, passwordError, onOpenChange, onPasswordChange, onSubmit, onCancel }: PasswordDialogProps) => {
    return (
      <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Enter Password</DialogTitle>
            <DialogDescription>Enter the password to reveal the full phone number.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                autoComplete="off"
                autoFocus
                onChange={(e) => onPasswordChange(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && onSubmit()}
                placeholder="Enter password"
              />
            </div>
            {passwordError && (
              <Alert variant="destructive">
                <AlertDescription>{passwordError}</AlertDescription>
              </Alert>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button onClick={onSubmit}>Reveal</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    )
  },
)

PasswordDialog.displayName = "PasswordDialog"

export default PasswordDialog
