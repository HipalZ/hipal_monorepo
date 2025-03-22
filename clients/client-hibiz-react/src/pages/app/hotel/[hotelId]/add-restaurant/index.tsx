import { useCallback, useState, useEffect } from "react"
import { FaArrowLeft } from "react-icons/fa"
import { Search, Link, ExternalLink } from "lucide-react"
import AdvancedBottomButton from "@/components/atom/bottomButton/advancedBottomButton"
import LoadingSpinner from "@/components/atom/loadingSpinner"
import PopUp from "@/components/atom/popUp"
import MemoizedHeader from "@/components/molecules/header"
import useBusinessData from "@/components/store/useBusinessData"

import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Separator } from "@/components/ui/separator"
import { useGetAllRestaurantsForHotel, useGetLinkedRestaurantForHotel, useLinkRestaurantToHotel } from "@/hooks/hotel/useLinkRestaurantHook"

interface IRestaurant {
  _id: string
  name: string
  logoUrl: string
  customLink?: string
}

const AddRestaurant = () => {
  const businessId = useBusinessData((s) => s.businessData?._id)
  const { restaurantData: linkedRestaurants, retaurantLoader: linkedLoader } = useGetLinkedRestaurantForHotel(
    businessId as string,
  )
  const { restaurantData: allRestaurants, retaurantLoader: allLoader } = useGetAllRestaurantsForHotel()
  const { linkRestaurant, linkingRestaurantLoader, isLinkedSuccessfully } = useLinkRestaurantToHotel()

  const [openLinkModal, setOpenLinkModal] = useState<boolean>(false)
  const [searchQuery, setSearchQuery] = useState<string>("")
  const [selectedRestaurants, setSelectedRestaurants] = useState<string[]>([])

  // Initialize selected restaurants with already linked ones
  useEffect(() => {
    if (linkedRestaurants && linkedRestaurants.length > 0) {
      setSelectedRestaurants(linkedRestaurants.map((r) => r._id))
    }
  }, [linkedRestaurants])

  // Close modal on successful linking
  useEffect(() => {
    if (isLinkedSuccessfully) {
      setOpenLinkModal(false)
    }
  }, [isLinkedSuccessfully])

  const openLinkModalFunc = useCallback(() => {
    setOpenLinkModal(true)
  }, [])

  const closeLinkModalFunc = useCallback(() => {
    setOpenLinkModal(false)
  }, [])

  const handleSearch = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
  }, [])

  const toggleRestaurantSelection = useCallback((id: string) => {
    setSelectedRestaurants((prev) => {
      if (prev.includes(id)) {
        return prev.filter((r) => r !== id)
      } else {
        return [...prev, id]
      }
    })
  }, [])

  const handleSave = useCallback(async () => {
    if (!businessId) return

    await linkRestaurant({
      businessId: businessId,
      restaurantIds: selectedRestaurants,
    })
  }, [businessId, linkRestaurant, selectedRestaurants])

  // Filter restaurants based on search query
  const filteredRestaurants = allRestaurants?.filter((restaurant) =>
    restaurant.name.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  return (
    <main className="pb-20">
      <header className="linear_gradient_background">
        <MemoizedHeader title="Link Restaurant" leftIcon={<FaArrowLeft />} />
      </header>

      <div className="px-4 py-6 mx-auto ">
        <h2 className="mb-6 text-2xl font-bold">Linked Restaurants</h2>

        {linkedLoader ? (
          <div className="flex justify-center py-10">
            <LoadingSpinner />
          </div>
        ) : linkedRestaurants && linkedRestaurants.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {linkedRestaurants.map((restaurant) => (
              <RestaurantCard key={restaurant._id} restaurant={restaurant} />
            ))}
          </div>
        ) : (
          <EmptyState />
        )}
      </div>

      {openLinkModal && (
        <PopUp hide height="h-[100dvh] lg:h-[90dvh]" show={openLinkModal} onClose={closeLinkModalFunc}>
          <div className="flex flex-col h-full p-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Link Restaurants</h2>
              <Badge variant="outline">{selectedRestaurants.length} selected</Badge>
            </div>

            <div className="relative mb-4">
              <Search className="absolute w-4 h-4 transform -translate-y-1/2 left-3 top-1/2 text-muted-foreground" />
              <Input
                placeholder="Search restaurants..."
                value={searchQuery}
                onChange={handleSearch}
                className="pl-10"
              />
            </div>

            {allLoader ? (
              <div className="">
                <LoadingSpinner />
              </div>
            ) : (
              <div className="grid grid-cols-1 pr-1 overflow-y-auto gap-x-4 gap-y-2 md:grid-cols-3 pb-[10rem]">
                {filteredRestaurants && filteredRestaurants.length > 0 ? (
                  filteredRestaurants.map((restaurant) => (
                    <div key={restaurant._id} className="mb-3">
                      <div
                        className={`p-3 border rounded-lg flex items-center justify-between cursor-pointer transition-all ${
                          selectedRestaurants.includes(restaurant._id)
                            ? "border-primary bg-primary/5"
                            : "hover:border-gray-400"
                        }`}
                        onClick={() => toggleRestaurantSelection(restaurant._id)}
                      >
                        <div className="flex items-center space-x-3">
                          <div className="flex-shrink-0 w-12 h-12 overflow-hidden rounded-md bg-muted">
                            {restaurant.logo ? (
                              <img
                                src={restaurant.logo || "/placeholder.svg"}
                                alt={restaurant.name}
                                className="object-cover w-full h-full"
                              />
                            ) : (
                              <div className="flex items-center justify-center w-full h-full bg-primary/10">
                                <span className="text-lg font-bold text-primary">{restaurant.name.charAt(0)}</span>
                              </div>
                            )}
                          </div>
                          <div>
                            <h3 className="font-medium">{restaurant.name}</h3>
                            {restaurant.customLink && (
                              <div className="flex items-center text-xs text-muted-foreground">
                                <ExternalLink className="w-3 h-3 mr-1" />
                                <span className="truncate max-w-[200px]">{restaurant.customLink}</span>
                              </div>
                            )}
                          </div>
                        </div>
                        <Checkbox
                          checked={selectedRestaurants.includes(restaurant._id)}
                          className="pointer-events-none"
                        />
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="py-10 text-center">
                    <p className="text-muted-foreground">No restaurants found</p>
                  </div>
                )}
              </div>
            )}
          </div>

          <AdvancedBottomButton
            fixed={true}
            maxWidth="30rem"
            buttons={[
              {
                text: "",
                onClick: closeLinkModalFunc,
                className: "w-full pl-3 rounded-md",
                isBackButton: true,
              },
              {
                text: linkingRestaurantLoader ? "Saving..." : "Save",
                onClick: handleSave,
                className: "w-full rounded-md w-full",
                disable: linkingRestaurantLoader,
              },
            ]}
          />
        </PopUp>
      )}

      <AdvancedBottomButton
        fixed={true}
        maxWidth="30rem"
        buttons={[
          {
            text: "Link Restaurant",
            onClick: openLinkModalFunc,
            className: "w-full rounded-md",
            icon: <Link className="w-4 h-4 mr-2" />,
          },
        ]}
      />
    </main>
  )
}

// Restaurant Card Component
const RestaurantCard = ({ restaurant }: { restaurant: IRestaurant }) => {
  return (
    <Card className="overflow-hidden transition-shadow hover:shadow-md">
      <CardContent className="p-0">
        <div className="flex items-center p-4">
          <div className="flex-shrink-0 w-16 h-16 mr-4 overflow-hidden rounded-md bg-muted">
            {restaurant.logo ? (
              <img
                src={restaurant.logo || "/placeholder.svg"}
                alt={restaurant.name}
                className="object-cover w-full h-full"
              />
            ) : (
              <div className="flex items-center justify-center w-full h-full bg-primary/10">
                <span className="text-2xl font-bold text-primary">{restaurant.name.charAt(0)}</span>
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold truncate">{restaurant.name}</h3>
            {restaurant?.customLink && (
              <div className="flex items-center mt-1 text-sm text-muted-foreground">
                <ExternalLink className="flex-shrink-0 w-4 h-4 mr-1" />
                <span className="truncate">{restaurant.customLink}</span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// Empty State Component
const EmptyState = () => {
  return (
    <Card className="p-8 mt-4 text-center">
      <div className="flex flex-col items-center justify-center space-y-3">
        <div className="p-4 rounded-full shadow-lg bg-gradient-to-br from-amber-400 to-amber-600">
          <Link className="w-10 h-10 text-white drop-shadow-md" />
        </div>
        <h3 className="text-lg font-medium">No Restaurants Linked</h3>
        <p className="text-sm text-muted-foreground">
          Link restaurants to your hotel to provide dining options for your guests
        </p>
      </div>
    </Card>
  )
}

export default AddRestaurant

