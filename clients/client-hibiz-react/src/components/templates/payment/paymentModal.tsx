import { memo, useState } from "react"
import { MdOutlineCall } from "react-icons/md"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import type { IExistingPayments } from "@/components/types/businessData"
import { timestampToDateTime } from "@/components/utils/helper"
import { apiRpc } from "@hi/common"
import { useMutation, useQuery } from "@tanstack/react-query"
import LoadingSpinner from "@/components/atom/loadingSpinner"
import AdvancedBottomButton from "@/components/atom/bottomButton/advancedBottomButton"
import { Download, ChevronLeft, ChevronRight } from "lucide-react"
import { motion, useAnimation } from "framer-motion"
import toast from "react-hot-toast"

export interface Extra {
  name: string
  price: number
  quantity: number
}

export interface DishItem {
  name: string
  price: number
  quantity: number
}

export interface BillItem {
  dish: DishItem
  extras: Extra[]
}

interface PaymentModalProps {
  salesData: IExistingPayments | undefined
  onClose?: () => void
  allSalesData: IExistingPayments[] // Array of all sales data
  currentIndex: number // Current index in the array
  onNavigate: (newIndex: number) => void // Function to update the current index
}

const InfoRow = ({ label, value }: { label: string; value: string | number | undefined }) => (
  <div className="flex items-center justify-between py-2">
    <span className="text-sm text-gray-600">{label}</span>
    <span className="font-medium">{value}</span>
  </div>
)

const hideMiddleNumbers = (phone: string) => {
  if (phone?.length <= 4) return phone
  const firstPart = phone?.slice(0, 3)
  const lastPart = phone?.slice(-3)
  return `${firstPart}****${lastPart}`
}

const PaymentModal = ({ salesData, onClose, allSalesData, currentIndex, onNavigate }: PaymentModalProps) => {
  const controls = useAnimation()
  const [dragDirection, setDragDirection] = useState<number>(0)

  const getBillItems = async (): Promise<BillItem[]> => {
    const response = await apiRpc.kot.get_pos_bill[":billRequestId"].$get({
      param: {
        billRequestId: salesData?.posBillRequestId,
      },
    })

    const res = await response.json()
    return res.data as BillItem[]
  }

  const { isLoading, data: itemsData } = useQuery<BillItem[]>({
    queryKey: ["getBillItems", salesData?.posBillRequestId],
    queryFn: getBillItems,
    enabled: !!salesData?.posBillRequestId,
  })

  const { isPending, mutateAsync } = useMutation({
    mutationFn: async (billId: string) => {
      const response = await apiRpc.download.download_bill_pdf[":paymentId"].$get({
        param: {
          paymentId: billId,
        },
      })
      return response
    },
    onSuccess: async (data) => {
      const result = await data.json()
      const downloadUrl = result.data.url
      window.open(downloadUrl, "_blank")
    },
    onError: (error) => {
      console.log(error)
    },
  })

  const goToNext = () => {
    if (currentIndex < allSalesData.length - 1) {
      onNavigate(currentIndex + 1)
      // Animate from right to left (next)
      controls.start({
        x: [-300, 0],
        opacity: [0, 1],
        transition: { duration: 0.3 },
      })
    } else {
      toast.error('No more bills')
    }
  }

  const goToPrevious = () => {
    if (currentIndex > 0) {
      onNavigate(currentIndex - 1)
      // Animate from left to right (previous)
      controls.start({
        x: [300, 0],
        opacity: [0, 1],
        transition: { duration: 0.3 },
      })
    } else {
      toast.error("No previous bills")
    }
  }

  // Handle drag end
  const handleDragEnd = () => {
    if (dragDirection > 100) {
      goToPrevious()
    } else if (dragDirection < -100) {
      goToNext()
    }
    // Reset drag direction
    setDragDirection(0)
  }

  return (
    <Card className="relative w-full overflow-hidden border-none shadow-none">
      <motion.div
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        onDrag={(_, info) => setDragDirection(info.offset.x)}
        onDragEnd={handleDragEnd}
        animate={controls}
        initial={{ opacity: 1 }}
      >
        <section className="flex items-center justify-between px-4 py-2">
          <h3 className="pt-2 text-lg font-semibold text-center">Payment Details</h3>
          <Badge className="text-xl font-semibold text-white bg-black">{salesData?.mode}</Badge>
        </section>

        <CardContent>
          <ScrollArea className="h-[85vh]">
            <div className="space-y-4 mb-[12rem]">
              {/* Bill navigation indicator */}
              <div className="flex items-center justify-center mb-2">
                <span className="text-sm text-muted-foreground">
                  Bill {currentIndex + 1} of {allSalesData.length}
                </span>
              </div>

              {/* Sales Data Information */}
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">{timestampToDateTime(salesData?.date || 0)}</span>
                <span className="text-sm font-medium">Order ID: {salesData?._id.slice(-5)}</span>
              </div>

              <div className="">
                <InfoRow label="Paid Amount" value={`₹ ${salesData?.order_id?.total}`} />
                <InfoRow label="Bill Value Entered" value={`₹ ${salesData?.order_id?.billValue}`} />
                <InfoRow label="Including Tips" value={`₹ ${salesData?.order_id?.tips}`} />
                <InfoRow label="Discount" value={`${salesData?.order_id?.claimedCoins} Coins used`} />
                <InfoRow label="Payment Mode" value={salesData?.mode} />
                <InfoRow label="Mode of Settle" value={salesData?.settleType} />
                {salesData?.settleType === "FORCE_SETTLE" && (
                  <InfoRow label="Force Settle Reason" value={salesData?.comment || ""} />
                )}
              </div>

              <Separator />

              {/* User and Table Information */}
              <div className="">
                <InfoRow label="User" value={salesData?.userId?.name} />
                <InfoRow label="Table" value={salesData?.order_id?.tableName} />
                <div className="flex items-center justify-between py-2">
                  <span className="text-sm text-gray-600">Number</span>
                  <div className="flex items-center space-x-2">
                    <span className="font-medium">
                      {salesData?.userId?.phone ? hideMiddleNumbers(salesData?.userId?.phone) : ""}
                    </span>
                    <Button variant="outline" size="sm" className="flex items-center space-x-1" asChild>
                      <a href={`tel:+91${salesData?.userId?.phone}`}>
                        <MdOutlineCall size={16} />
                        <span className="text-sm">Call</span>
                      </a>
                    </Button>
                  </div>
                </div>
              </div>
              {/* Items List */}
              {
                isLoading ? <LoadingSpinner /> :
                  <div className="">
                    <h2 className="font-semibold">Bill Items</h2>
                    <Card>
                      <CardContent className="p-4 space-y-2">
                        {itemsData?.slice(0, -2).map((item, index) => (
                          <div key={index} className="space-y-2">
                            <div className="flex justify-between">
                              <div>
                                <p className="font-medium">{item.dish.name}</p>
                                <p className="text-sm text-gray-500">
                                  Qty: {item.dish.quantity} × ₹{item.dish.price.toFixed(2)}
                                </p>
                              </div>
                              <p className="font-medium">₹{(item.dish.price * item.dish.quantity).toFixed(2)}</p>
                            </div>
                            {item.extras.length > 0 && (
                              <div className="pl-4 space-y-1">
                                {item.extras.map((extra, extraIndex) => (
                                  <div key={extraIndex} className="flex justify-between text-sm">
                                    <span>{extra.name}</span>
                                    <span>
                                      {extra.quantity} × ₹{extra.price.toFixed(2)} = ₹
                                      {(extra.quantity * extra.price).toFixed(2)}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </CardContent>
                    </Card>
                  </div>
              }



              {/* Optional Sections */}
              {salesData?.comment && (
                <div className="space-y-2">
                  <h2 className="font-semibold">Added Comment</h2>
                  <Card>
                    <CardContent className="p-4">
                      <p className="text-sm">{salesData?.comment}</p>
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </motion.div>
      <AdvancedBottomButton
        fixed={true}
        maxWidth="30rem"
        gap={2}
        buttons={[
          {
            text: "",
            onClick: onClose,
            className: "rounded-md pl-3",
            isBackButton: true,
          },
          {
            text: "prev",
            onClick: goToPrevious,
            className: "rounded-md w-[15%]",
          },
          {
            text: "next",
            onClick: goToNext,
            className: "rounded-md w-[15%]",
          },
          {
            text: "Download Invoice",
            onClick: () => mutateAsync(salesData?._id),
            icon: <Download />,
            className: "rounded-md w-1/2",
            disable: isPending,
            isLoading: isPending,
          },
        ]}
      />
    </Card>
  )
}

const MemoizedPaymentModal = memo(PaymentModal)
export default MemoizedPaymentModal

