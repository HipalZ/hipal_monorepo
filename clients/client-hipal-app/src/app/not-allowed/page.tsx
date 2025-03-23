import Link from "next/link"
import { ShieldAlert } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

export default function NotAllowed() {
  return (
    <div className="flex items-center justify-center min-h-screen p-4 text-black bg-background">
      <Card className="max-w-md mx-auto shadow-lg">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-2">
            <ShieldAlert className="w-12 h-12 text-red-500" />
          </div>
          <CardTitle className="text-2xl font-bold">Access Denied</CardTitle>
          <CardDescription>You do not have permission to view this page.</CardDescription>
        </CardHeader>
        <CardContent className="text-center text-muted-foreground">
          <p>
            This area is restricted. If you believe you should have access, please contact your administrator or try
            signing in with a different account.
          </p>
        </CardContent>
        <CardFooter className="flex justify-center gap-4">
          <Button variant="destructive">
            <Link href="/">Return Home</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}

