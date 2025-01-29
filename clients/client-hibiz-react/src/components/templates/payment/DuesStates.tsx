import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { CreditCardIcon } from "lucide-react"

export const LoadingState = () => (
    <div className="p-4 space-y-4">
        <Skeleton className="w-3/4 h-8 mx-auto" />
        <Skeleton className="w-1/2 h-6 mx-auto" />
        <Card>
            <CardHeader>
                <Skeleton className="w-1/3 h-6" />
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                        <Skeleton key={i} className="w-full h-20" />
                    ))}
                </div>
            </CardContent>
        </Card>
    </div>
)

export const ErrorState = ({ error }: { error: string }) => (
    <div className="p-4 text-center">
        <CreditCardIcon className="w-12 h-12 mx-auto mb-4 text-destructive" />
        <h2 className="mb-2 text-xl font-semibold">Error Loading Dues</h2>
        <p className="text-muted-foreground">{error}</p>
    </div>
)

export const EmptyState = () => (
    <div className="p-4 text-center">
        <CreditCardIcon className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
        <h2 className="mb-2 text-xl font-semibold">No Dues Found</h2>
        <p className="text-muted-foreground">There are no pending dues for this user.</p>
    </div>
)

