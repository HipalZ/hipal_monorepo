import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Globe, Home, Palette, Settings, Users, UtensilsCrossed } from 'lucide-react';
import { Link } from 'react-router-dom';

const essentialCards = [
  {
    title: 'Business Settings',
    description: 'Manage your hotel business settings and preferences',
    icon: (
      <div className="transform rounded-full bg-gradient-to-br from-blue-400 to-blue-600 p-3 shadow-lg transition-transform hover:scale-105">
        <Settings className="h-8 w-8 text-white drop-shadow-md" />
      </div>
    ),
    href: 'business-settings',
  },
  {
    title: 'Your Website Display',
    description: 'Customize how your hotel appears online',
    icon: (
      <div className="transform rounded-full bg-gradient-to-br from-purple-400 to-purple-600 p-3 shadow-lg transition-transform hover:scale-105">
        <Globe className="h-8 w-8 text-white drop-shadow-md" />
      </div>
    ),
    href: 'website-display',
  },
  {
    title: 'Staff Management',
    description: 'Add, remove and manage your hotel staff',
    icon: (
      <div className="transform rounded-full bg-gradient-to-br from-green-400 to-green-600 p-3 shadow-lg transition-transform hover:scale-105">
        <Users className="h-8 w-8 text-white drop-shadow-md" />
      </div>
    ),
    href: 'staff-management',
  },
  {
    title: 'Manage Rooms',
    description: 'Configure room types, availability and pricing',
    icon: (
      <div className="transform rounded-full bg-gradient-to-br from-amber-400 to-amber-600 p-3 shadow-lg transition-transform hover:scale-105">
        <Home className="h-8 w-8 text-white drop-shadow-md" />
      </div>
    ),
    href: 'manage-rooms',
  },
  {
    title: 'Add Restaurant',
    description: "Set up and manage your hotel's restaurant services",
    icon: (
      <div className="transform rounded-full bg-gradient-to-br from-red-400 to-red-600 p-3 shadow-lg transition-transform hover:scale-105">
        <UtensilsCrossed className="h-8 w-8 text-white drop-shadow-md" />
      </div>
    ),
    href: 'add-restaurant',
  },
  {
    title: 'Themes',
    description: 'Customize the look and feel of your hotel website',
    icon: (
      <div className="transform rounded-full bg-gradient-to-br from-blue-400 to-blue-600 p-3 shadow-lg transition-transform hover:scale-105">
        <Palette className="h-8 w-8 text-white drop-shadow-md" />
      </div>
    ),
    href: 'add-themes',
  },
];

const HotelCards = () => {
  return (
    <main className="mt-2">
      <h2 className="mb-6 mt-6 px-4 text-3xl font-bold xl:mt-0 xl:px-0">Essentials</h2>
      <div className="grid grid-cols-1 gap-4 px-4 pb-[3rem] md:grid-cols-2 lg:grid-cols-3 xl:px-0">
        {essentialCards.map((card, index) => (
          <Link to={`${card.href}`} key={index?.toString()} className="block h-full">
            <Card className="hover:border-primary/50 relative h-full transition-all hover:shadow-md">
              <CardHeader className="h-[7rem] pb-2">
                <CardTitle className="absolute left-4 top-4">{card.icon}</CardTitle>
                <CardTitle className="ml-[4rem] pb-4 text-xl">{card.title}</CardTitle>
              </CardHeader>
              <CardContent className="h-[3rem]">
                <CardDescription>{card.description}</CardDescription>
              </CardContent>
              <CardFooter className="pt-2">
                <span className="text-primary text-sm">Configure →</span>
              </CardFooter>
            </Card>
          </Link>
        ))}
      </div>
    </main>
  );
};

export default HotelCards;
