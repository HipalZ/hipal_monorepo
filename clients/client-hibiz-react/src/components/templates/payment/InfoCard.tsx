import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatCurrency } from "./userDueCard"

interface InfoCardProps {
    title: string
    value: number
    className?: string
}

export const InfoCard: React.FC<InfoCardProps> = ({ title, value, className }) => (
    <Card className={className}>
        <CardHeader>
            <CardTitle className="font-semibold  text-muted-foreground">{title}</CardTitle>
        </CardHeader>
        <CardContent>
            <p className="text-2xl font-bold">{formatCurrency(value)}</p>
        </CardContent>
    </Card>
)

