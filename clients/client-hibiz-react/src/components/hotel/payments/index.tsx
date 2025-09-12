import { Link } from "react-router-dom";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { memo } from "react";
import { MdOutlineCurrencyRupee } from "react-icons/md";

const essentialCards = [
  {
    title: "Payments",
    description: "Payments Reports",
    icon: (
      <div className="p-3 transition-transform transform rounded-full shadow-lg bg-gradient-to-br from-gray-400 to-black hover:scale-105">
        <MdOutlineCurrencyRupee className="w-8 h-8 text-white drop-shadow-md" />
      </div>
    ),
    href: "payments",
  },
  
];

const MemoPaymentCards = () => {
  return (
    <>
      <h2 className="px-4 mt-6 xl:mt-0 mb-6 text-3xl font-bold xl:px-0">Payments</h2>
      <div className="grid grid-cols-1 gap-4 px-4 xl:px-0 md:grid-cols-2 lg:grid-cols-3 pb-[3rem]">
        {essentialCards.map((card, index) => (
          <Link
            to={`${card.href}`}
            key={index?.toString()}
            className="block h-full"
          >
            <Card className="relative h-full transition-all hover:shadow-md hover:border-primary/50">
              <CardHeader className="pb-2 h-[7rem]">
                <CardTitle className="absolute top-4 left-4">
                  {card.icon}
                </CardTitle>
                <CardTitle className="pb-4 text-xl ml-[4rem]">
                  {card.title}
                </CardTitle>
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
  );
};

const PaymentCards = memo(MemoPaymentCards);
export default PaymentCards;
