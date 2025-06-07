import { memo } from "react"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface ErrorAlertProps {
  onRetry: () => void
}

const ErrorAlert = memo(({ onRetry }: ErrorAlertProps) => {
  return (
    <Alert variant="destructive">
      <AlertDescription>Failed to load check-in users. Please try again.</AlertDescription>
      <Button onClick={onRetry} className="mt-2">
        Retry
      </Button>
    </Alert>
  )
})

ErrorAlert.displayName = "ErrorAlert"

export default ErrorAlert
