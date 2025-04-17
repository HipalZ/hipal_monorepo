import MemoizedHeader from "@/components/molecules/header";
import { useNavigate, useParams } from "react-router-dom";
import { useCallback } from "react";
import EveryDayBooking from "@/assets/bookings/every_day_booking.png";
import BirthDayBookings from "@/assets/bookings/bday_special_day.png";
import SpecialEvents from "@/assets/bookings/special_events.png";
import Corporate from "@/assets/bookings/corporate_clubs.png";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@hi/common";

const Bookings = () => {
  const navigate = useNavigate();
  const { businessId } = useParams<{ businessId: string }>();
  
  const handleBack = useCallback(() => {
    navigate(`/app/business/${businessId}`);
  }, [businessId, navigate]);

  const bookingOptions = [
    {
      id: "everyday",
      title: "Everyday Booking",
      description: "Regular reservations for dining and casual visits",
      image: EveryDayBooking,
      badge: "Popular",
      color: "bg-gradient-to-r from-blue-100 to-indigo-100",
      on:true
    },
    {
      id: "special",
      title: "Special Event",
      description: "Reservations for special occasions and celebrations",
      image: SpecialEvents,
      badge: "Coming Soon",
      color: "bg-gradient-to-r from-purple-100 to-pink-100",
      on:false
    },
    {
      id: "birthday",
      title: "Birthday Booking",
      description: "Special packages for birthday celebrations",
      image: BirthDayBookings,
      badge: "Coming Soon",
      color: "bg-gradient-to-r from-amber-100 to-yellow-100",
      on:false
    },
    {
      id: "corporate",
      title: "Corporate",
      description: "Bookings for business meetings and corporate events",
      image: Corporate,
      badge: "Coming Soon",
      color: "bg-gradient-to-r from-emerald-100 to-teal-100",
      on:false
    },
  ];

  const handleCardClick = useCallback((bookingType: string) => {
    navigate(`${bookingType}`);
  }, []);

  return (
    <main className="min-h-screen">
      <header className="linear_gradient_background">
        <MemoizedHeader title="Bookings" onBack={handleBack} />
      </header>
      
      <div className="px-4 py-8 mx-auto md:px-0">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {bookingOptions.map((option) => (
            <Card 
              key={option.id}
              className={
                cn(`overflow-hidden border-0 shadow-lg transition-all 
                duration-300 hover:shadow-xl hover:translate-y-[-4px] cursor-pointer ${option.color}`,
                option.on ? "opacity-100" : " grayscale pointer-events-none"
            )}
              onClick={() => handleCardClick(option.id)}
            >
              <div className="relative h-[17.5rem] overflow-hidden">
                <img
                  src={option.image}
                  alt={option.title}
                  className="object-fill w-[94%] mx-auto mt-2 h-[18rem] brightness-110 transition-transform duration-500 hover:scale-105"
                />
                <div className="absolute top-2 right-2">
                  <Badge variant="secondary" className="font-medium">
                    {option.badge}
                  </Badge>
                </div>
              </div>
              
              <CardHeader className="px-4 pt-2 pb-4">
                <CardTitle className="text-xl font-bold tracking-tight">
                  {option.title}
                </CardTitle>
                <CardDescription className="text-sm font-semibold leading-4 text-gray-500">
                  {option.description}
                </CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
    </main>
  );
};

export default Bookings;