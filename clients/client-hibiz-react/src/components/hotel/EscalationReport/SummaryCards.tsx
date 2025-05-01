import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { AlertTriangle, Home, Users } from "lucide-react"

interface SummaryCardsProps {
    isLoading: boolean
    totalEscalations: number
    uniqueRooms: number
    uniqueUsers: number
}

export default function SummaryCards({ isLoading, totalEscalations, uniqueRooms, uniqueUsers }: SummaryCardsProps) {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 border-blue-200 dark:border-blue-800">
                <CardHeader className="pb-2">
                    <CardTitle className="text-lg flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4 text-blue-500" />
                        Total Escalations
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {isLoading ? <Skeleton className="h-10 w-16" /> : <p className="text-3xl font-bold">{totalEscalations}</p>}
                </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 border-green-200 dark:border-green-800">
                <CardHeader className="pb-2">
                    <CardTitle className="text-lg flex items-center gap-2">
                        <Home className="h-4 w-4 text-green-500" />
                        Rooms
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {isLoading ? <Skeleton className="h-10 w-16" /> : <p className="text-3xl font-bold">{uniqueRooms}</p>}
                </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900 border-purple-200 dark:border-purple-800">
                <CardHeader className="pb-2">
                    <CardTitle className="text-lg flex items-center gap-2">
                        <Users className="h-4 w-4 text-purple-500" />
                        Users
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {isLoading ? <Skeleton className="h-10 w-16" /> : <p className="text-3xl font-bold">{uniqueUsers}</p>}
                </CardContent>
            </Card>
        </div>
    )
}
