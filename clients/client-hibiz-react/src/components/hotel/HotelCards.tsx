import { Settings, Globe, Users, Home, UtensilsCrossed, Palette } from "lucide-react";
import { Link } from "react-router-dom"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

const essentialCards = [
    {
        title: "Business Settings",
        description: "Manage your hotel business settings and preferences",
        icon: (
            <div className="p-3 transition-transform transform rounded-full shadow-lg bg-gradient-to-br from-blue-400 to-blue-600 hover:scale-105">
                <Settings className="w-8 h-8 text-white drop-shadow-md" />
            </div>
        ),
        href: "business-settings",
    },
    {
        title: "Your Website Display",
        description: "Customize how your hotel appears online",
        icon: (
            <div className="p-3 transition-transform transform rounded-full shadow-lg bg-gradient-to-br from-purple-400 to-purple-600 hover:scale-105">
                <Globe className="w-8 h-8 text-white drop-shadow-md" />
            </div>
        ),
        href: "website-display",
    },
    {
        title: "Staff Management",
        description: "Add, remove and manage your hotel staff",
        icon: (
            <div className="p-3 transition-transform transform rounded-full shadow-lg bg-gradient-to-br from-green-400 to-green-600 hover:scale-105">
                <Users className="w-8 h-8 text-white drop-shadow-md" />
            </div>
        ),
        href: "staff-management",
    },
    {
        title: "Manage Rooms",
        description: "Configure room types, availability and pricing",
        icon: (
            <div className="p-3 transition-transform transform rounded-full shadow-lg bg-gradient-to-br from-amber-400 to-amber-600 hover:scale-105">
                <Home className="w-8 h-8 text-white drop-shadow-md" />
            </div>
        ),
        href: "manage-rooms",
    },
    {
        title: "Add Restaurant",
        description: "Set up and manage your hotel's restaurant services",
        icon: (
            <div className="p-3 transition-transform transform rounded-full shadow-lg bg-gradient-to-br from-red-400 to-red-600 hover:scale-105">
                <UtensilsCrossed className="w-8 h-8 text-white drop-shadow-md" />
            </div>
        ),
        href: "add-restaurant",
    },
    {
        title: "Themes",
        description: "Customize the look and feel of your hotel website",
        icon: (
            <div className="p-3 transition-transform transform rounded-full shadow-lg bg-gradient-to-br from-blue-400 to-blue-600 hover:scale-105">
                <Palette className="w-8 h-8 text-white drop-shadow-md" />
            </div>
        ),
        href: "add-themes"
    }
]

const HotelCards = () => {
    return (
        <>
            <h2 className="px-4 mt-6 xl:mt-0 mb-6 text-3xl font-bold xl:px-0">Essentials</h2>
            <div className="grid grid-cols-1 gap-4 px-4 xl:px-0 md:grid-cols-2 lg:grid-cols-3 pb-[3rem]">
                {essentialCards.map((card, index) => (
                    <Link to={`${card.href}`} key={index?.toString()} className="block h-full">
                        <Card className="relative h-full transition-all hover:shadow-md hover:border-primary/50">
                            <CardHeader className="pb-2 h-[7rem]">
                                <CardTitle className="absolute top-4 left-4">{card.icon}</CardTitle>
                                <CardTitle className="pb-4 text-xl ml-[4rem]">{card.title}</CardTitle>
                            </CardHeader>
                            <CardContent className="h-[3rem]">
                                <CardDescription>{card.description}</CardDescription>
                            </CardContent>
                            <CardFooter className="pt-2">
                                <span className="text-sm text-primary">Configure →</span>
                            </CardFooter>
                        </Card>
                    </Link>
                ))}
            </div>
        </>
    )
}

export default HotelCards
