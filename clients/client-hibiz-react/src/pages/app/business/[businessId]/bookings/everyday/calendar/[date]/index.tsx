import CouponCard from "@/components/calendar/coupon-card.tsx"
import MemoizedHeader from "@/components/molecules/header/index.tsx"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { getPeriodName } from "@/components/utils/timeUtils"
import { useGetIndividualDateInfo } from "@/hooks/useBookingCalendar"
import { format, parseISO } from "date-fns"
import { Clock, Ticket, Users } from "lucide-react"
import { useParams } from "react-router-dom"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

const IndividualDateInfo = () => {
  const { businessId, date } = useParams<{ businessId: string; date: string }>()
  const { dateInfo, gettingDateInfo } = useGetIndividualDateInfo(businessId as string, date as string)

  // Calculate total bookings across all periods
  const totalBookings = dateInfo?.summary?.totalBookingsOfDay || 0

  if (gettingDateInfo) {
    return (
      <main>
        <header className="linear_gradient_background">
          <MemoizedHeader title={date} />
        </header>
        <div className="mb-4">
          <Skeleton className="mb-2 h-8 w-64" />
          <Skeleton className="h-6 w-48" />
        </div>

        <Skeleton className="mb-6 h-12 w-full" />

        <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2">
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
        </div>

        <Skeleton className="h-64 w-full" />
      </main>
    )
  }

  if (!dateInfo) {
    return (
      <div>
        <header className="linear_gradient_background">
          <MemoizedHeader title={date} />
        </header>
        <Card>
          <CardContent className="p-8 text-center">
            <h2 className="mb-2 text-xl font-semibold text-gray-700">No data available</h2>
            <p className="text-gray-500">Could not load booking information for this date. Please try again later.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <main className="pb-[5rem]">
      <header className="linear_gradient_background">
        <MemoizedHeader title={date} />
      </header>

      {/* Summary Cards */}
      <div className="my-6 grid grid-cols-2 gap-4 px-4 ">
        <Card>
          <CardContent className="p-2">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-purple-100 p-3">
                <Users className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Total Bookings</p>
                <h3 className="text-2xl font-bold">{totalBookings}</h3>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-2">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-purple-100 p-3">
                <Clock className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Periods</p>
                <h3 className="text-2xl font-bold">{dateInfo.bookingBusinessDetails.length}</h3>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Period Tabs */}
      <Tabs defaultValue="all">
        <TabsList className="mx-0 mb-4 w-full max-w-[27rem] md:max-w-[22rem] lg:mx-4">
          <TabsTrigger value="all">All</TabsTrigger>
          {dateInfo.bookingBusinessDetails.map((periodData) => (
            <TabsTrigger key={periodData.bookingBusiness.period} value={periodData.bookingBusiness.period.toString()}>
              {getPeriodName(periodData.bookingBusiness.period)}
            </TabsTrigger>
          ))}
        </TabsList>

        {/* All Periods Content */}
        <TabsContent value="all">
          <div className="space-y-6">
            {dateInfo.bookingBusinessDetails.map((periodData) => (
              <Card className="rounded-none shadow-none lg:mx-4 lg:rounded-xl border-none" key={periodData.bookingBusiness.period}>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center justify-between text-lg">
                    <span className="flex items-center gap-2">
                      {getPeriodName(periodData.bookingBusiness.period)}
                      <Badge variant={periodData.bookingBusiness.isOpen ? "default" : "destructive"}>
                        {periodData.bookingBusiness.isOpen ? "Open" : "Closed"}
                      </Badge>
                    </span>
                    <Badge variant="outline" className="ml-auto">
                      {periodData.numOfBookings} {periodData.numOfBookings === 1 ? "booking" : "bookings"}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {/* Coupons Section */}
                  {periodData.bookingBusiness.couponsRemaining &&
                    periodData.bookingBusiness.couponsRemaining.length > 0 && (
                      <div className="mb-4">
                        <Accordion type="single" collapsible className="w-full">
                          <AccordionItem value="coupons" className="border-b-0">
                            <AccordionTrigger className="py-2">
                              <h3 className="flex items-center gap-1 text-sm font-medium text-gray-700">
                                <Ticket className="h-4 w-4 text-purple-500" />
                                Available Coupons ({periodData.bookingBusiness.couponsRemaining.length})
                              </h3>
                            </AccordionTrigger>
                            <AccordionContent>
                              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 pt-2">
                                {periodData.bookingBusiness.couponsRemaining.map((coupon) => (
                                  <CouponCard key={coupon._id} coupon={coupon} />
                                ))}
                              </div>
                            </AccordionContent>
                          </AccordionItem>
                        </Accordion>
                      </div>
                    )}

                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
                    {periodData.slots.map((slot) => (
                      <div
                        key={slot.slot}
                        className={`rounded-md border p-3 ${
                          !slot.isInOperatableRange
                            ? "border-gray-200 bg-gray-100"
                            : slot.count > 0
                              ? "border-purple-200 bg-purple-50"
                              : "border-gray-200 bg-white"
                        }`}
                      >
                        <p className="text-sm font-medium">{slot.slot}</p>
                        <div className="mt-1 flex items-center justify-between">
                          <span className="text-xs text-gray-500">Bookings:</span>
                          <Badge
                            variant="outline"
                            className={`text-xs ${slot.count > 0 ? "bg-purple-100 text-purple-700" : "bg-gray-50 text-gray-500"}`}
                          >
                            {slot.count}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Individual Period Content */}
        {dateInfo.bookingBusinessDetails.map((periodData) => (
          <TabsContent key={periodData.bookingBusiness.period} value={periodData.bookingBusiness.period.toString()}>
            <Card className="rounded-none shadow-none lg:mx-4 lg:rounded-xl">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    {getPeriodName(periodData.bookingBusiness.period)}
                    <Badge variant={periodData.bookingBusiness.isOpen ? "default" : "destructive"}>
                      {periodData.bookingBusiness.isOpen ? "Open" : "Closed"}
                    </Badge>
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <h3 className="mb-2 text-sm font-medium text-gray-700">Period Details</h3>
                  <div className="grid grid-cols-1 gap-4 rounded-md bg-gray-50 p-4 md:grid-cols-2">
                    <div>
                      <p className="text-sm text-gray-500">Status</p>
                      <p className="font-medium">{periodData.bookingBusiness.isOpen ? "Open" : "Closed"}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Total Bookings</p>
                      <p className="font-medium">{periodData.numOfBookings}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Coupons Available</p>
                      <p className="font-medium">{periodData.bookingBusiness.couponsRemaining?.length || 0}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Last Updated</p>
                      <p className="font-medium">
                        {format(parseISO(periodData.bookingBusiness.updatedAt), "MMM d, yyyy h:mm a")}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Coupons Section */}
                {periodData.bookingBusiness.couponsRemaining &&
                  periodData.bookingBusiness.couponsRemaining.length > 0 && (
                    <div className="mb-6">
                      <Accordion type="single" collapsible className="w-full">
                        <AccordionItem value="coupons" className="border-b-0">
                          <AccordionTrigger className="py-2">
                            <h3 className="flex items-center gap-1 text-sm font-medium text-gray-700">
                              <Ticket className="h-4 w-4 text-purple-500" />
                              Available Coupons ({periodData.bookingBusiness.couponsRemaining.length})
                            </h3>
                          </AccordionTrigger>
                          <AccordionContent>
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 pt-2">
                              {periodData.bookingBusiness.couponsRemaining.map((coupon) => (
                                <CouponCard key={coupon._id} coupon={coupon} />
                              ))}
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                      </Accordion>
                    </div>
                  )}

                <h3 className="mb-2 text-sm font-medium text-gray-700">Time Slots</h3>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
                  {periodData.slots.map((slot) => (
                    <div
                      key={slot.slot}
                      className={`rounded-md border p-3 ${
                        !slot.isInOperatableRange
                          ? "border-gray-200 bg-gray-100"
                          : slot.count > 0
                            ? "border-purple-200 bg-purple-50"
                            : "border-gray-200 bg-white"
                      }`}
                    >
                      <p className="text-sm font-medium">{slot.slot}</p>
                      <div className="mt-1 flex items-center justify-between">
                        <span className="text-xs text-gray-500">Bookings:</span>
                        <Badge
                          variant="outline"
                          className={`text-xs ${slot.count > 0 ? "bg-purple-100 text-purple-700" : "bg-gray-50 text-gray-500"}`}
                        >
                          {slot.count}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
    </main>
  )
}

export default IndividualDateInfo
