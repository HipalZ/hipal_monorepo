import { useFilters } from '../store/useFilters'
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

const AlertFilter = () => {
    const { payFilter, setPayFilter } = useFilters()

    const filters = [
        { value: "Services", label: "service filter" },
    ]

    return (
        <Card className="w-full border-none shadow-none">
            <CardContent className="p-4">
                <div className="flex flex-wrap gap-2">
                    {filters.map((filter) => (
                        <Button
                            key={filter.value}
                            variant={payFilter === filter.value ? "default" : "outline"}
                            onClick={() => setPayFilter(filter?.value)}
                            className="flex-1 sm:flex-none"
                        >
                            {filter.label}
                        </Button>
                    ))}
                </div>
            </CardContent>
        </Card>
    )
}


export default AlertFilter

