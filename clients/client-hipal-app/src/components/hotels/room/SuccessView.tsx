import { Clock, Utensils } from "lucide-react"

interface ILinkHotels {
  _id: string
  name: string
  customLink: string
  logo: string
}

interface SuccessViewProps {
  restaurant: ILinkHotels | null
}

export const SuccessView = ({ restaurant }: SuccessViewProps) => {
  return (
    <div className="flex flex-col items-center justify-center p-8">
      <div className="flex items-center justify-center w-16 h-16 mb-4 bg-green-100 rounded-full">
        <Utensils className="w-8 h-8 text-green-600" />
      </div>
      <h2 className="mb-2 text-xl font-bold text-h-primary">Order Placed!</h2>
      {restaurant && (
        <p className="mb-3 text-center text-gray-700">
          Your order from <span className="font-medium">{restaurant.name}</span> has been sent.
        </p>
      )}
      <div className="flex items-center text-gray-500">
        <Clock className="w-4 h-4 mr-2" />
        <span>Estimated delivery: 30-45 minutes</span>
      </div>
    </div>
  )
}

