import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"

export const ErrorMessage = () => (
  <Alert variant="destructive" className="max-w-md">
    <AlertCircle className="h-4 w-4" />
    <AlertDescription>Could not load bill details. Please try again.</AlertDescription>
  </Alert>
)
