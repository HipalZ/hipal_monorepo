import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { memo } from 'react';
import { FaWhatsapp } from 'react-icons/fa';
import { FaRegCreditCard } from 'react-icons/fa6';
import { RiCouponLine } from 'react-icons/ri';
import { Link } from 'react-router-dom';

const MemoIntegrations = () => {
  const integrationCards = [
    {
      title: 'Whatsapp',
      description: 'Manage your hotel whatsapp marketing and campaigns',
      icon: (
        <div className="transform rounded-full bg-gradient-to-br from-emerald-400 to-green-600 p-3 shadow-lg transition-transform hover:scale-105">
          <FaWhatsapp className="h-8 w-8 text-white drop-shadow-md" />
        </div>
      ),
      href: 'whatsapp',
    },
    // {
    //   title: "Loyalty",
    //   description: "Manage your hotel Loyalty marketing and campaigns",
    //   icon: (
    //     <div className="p-3 transition-transform transform rounded-full shadow-lg bg-gradient-to-br from-pink-500 to-purple-600 hover:scale-105">
    //       <FaRegCreditCard className="w-8 h-8 text-white drop-shadow-md" />
    //     </div>
    //   ),
    //   href: "loyalty",
    // },
    // {
    //   title: "Coupons",
    //   description: "Manage your hotel Coupons marketing and campaigns",
    //   icon: (
    //     <div className="p-3 transition-transform transform rounded-full shadow-lg bg-gradient-to-br from-yellow-400 to-orange-500 hover:scale-105">
    //       <RiCouponLine className="w-8 h-8 text-white drop-shadow-md" />
    //     </div>
    //   ),
    //   href: "coupons",
    // },
  ];
  return (
    <main className="mt-2 min-h-screen rounded-lg pb-28">
      <h2 className="mb-6 mt-6 px-4 text-3xl font-bold xl:mt-0 xl:px-0">Integrations</h2>
      <div className="grid grid-cols-1 gap-4 px-4 pb-[3rem] md:grid-cols-2 lg:grid-cols-3 xl:px-0">
        {integrationCards.map((card, index) => (
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

const Integrations = memo(MemoIntegrations);
export default Integrations;
