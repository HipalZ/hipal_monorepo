import { memo, useCallback, useState, useMemo } from "react"
import { useParams } from "react-router-dom"
import { apiRpc } from "@hi/common"
import { useHiClientZ } from "@/components/store/useHiClientzData"
import { useOrderStore } from "@/components/store/useOrderData"
import { useMutation } from "@tanstack/react-query"
import { Separator } from "@/components/ui/separator"
import { Phone, ChevronDown, ChevronUp, User, Clock, AlertCircle, ReceiptText } from "lucide-react"
import SpinnerMemo from "@/components/atoms/loadingSpinner"
import { MdTableBar } from "react-icons/md"
import CommonBottomButton from "../bottomButton"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { useScreenSize } from "@/hooks/useScreenSize"
import BottomPopUp from "../universalPopup"
import QrCodePreview from "./qrCode"
import NormalSettle from "./normalsettle"
import AddCoinz from "./addCoinz"
import { IoClose } from "react-icons/io5"
import useBusinessData from "@/components/store/useBusinessData"
import BillOptions from "./BillOptions"
import {
  useGetBill,
  useRemoveCoinz,
  useRemoveCoupon,
  useRemoveServiceCharge,
  useReprintBill,
} from "@/components/hooks/useBill"
import { BiSync } from "react-icons/bi"
import EBill from "./ebill.tsx"

// Updated interface to match new structure
export interface IBillData {
  tips: number
  claimedCoins: number
  serviceCharge: number
  discount: number
  couponDiscount: number
  discountAppliedBy: string
  discountRemovedBy: string
  gst: number
  reasonOfDiscount: string
  reasonOfServiceCharge: string
  serviceChargeAppliedBy: string
  serviceChargeRemovedBy: string
  total: number
  customerPhone: string
  customerName: string
  tableName: string
  subTotal: number
  billId: string
  _id?: string
  otherTax: number
  discountAppliedOn?: string
  couponId?: string
  billItems: Array<{
    gst: number
    subTotal: number
    totalGst: number
    items: Array<{
      dish: {
        _id: string
        name: string
        price: number
        businessId: string
        posDishId: string
        description: string
        dishTypes: string[]
        ignoreDiscount: string
        ignoreTax: string
        images: string[]
        isDeleted: boolean
        menuId: string
        portions: Array<{
          name: string
          price: number
          default: boolean
          portionTypes: string[]
          _id: string
        }>
        pos: boolean
        posTax: string
        rank: number
        tags: string[]
        visibility: boolean
        active: boolean
        kitchenId?: string
        tax: number
        gst: number
        instruction?: string
      }
      id: string
      _id: string
      portion: {
        name: string
        price: number
        default: boolean
        portionTypes: string[]
        _id: string
      } | null
      extras: Array<{
        id: string
        name: string
        price: number
        quantity: number
      }>
      quantity: number
      isDeleted: boolean
    }>
  }>
}

const MemoGetBill = () => {
  const { businessId } = useParams()
  const selectedTable = useOrderStore((s) => s.selectedTable)
  const openAddCoinz = useOrderStore((s) => s.openAddCoinz)
  const setOpenAddCoinz = useOrderStore((s) => s.setOpenAddCoinz)
  const setOpenOrderModal = useOrderStore((s) => s.setOpenOrderModal)
  const showMoreOption = useOrderStore((s) => s.showMoreOption)
  const setShowMoreOption = useOrderStore((s) => s.setShowMoreOption)
  const normalSettle = useOrderStore((s) => s.normalSettle)
  const setNormalSettle = useOrderStore((s) => s.setNormalSettle)
  const showEBill = useOrderStore((s) => s.showEBill)
  const setShowEBill = useOrderStore((s) => s.setShowEBill)
  const screenSize = useScreenSize()
  const { captainData: userData } = useHiClientZ()
  const { reprintBill, isPrinting } = useReprintBill()
  const { removingCouponLoader, removingCoupon } = useRemoveCoupon()
  const { removingCoinzLoader, removingCoinz } = useRemoveCoinz()
  const [qrBillId, setQrBillId] = useState<string | null>(null)
  const [showqr, setShowqr] = useState<boolean>(false)
  const [isExpanded, setIsExpanded] = useState<boolean>(false)
  const { removingServiceChargeLoader, removingServiceCharge } = useRemoveServiceCharge()
  const existingLoyalty = useBusinessData((s) => s.existingLoyalty)

  const closeOrderModalHandler = useCallback(() => {
    setOpenOrderModal(false)
  }, [setOpenOrderModal])

  const { isLoading, data: billData } = useGetBill()

  // Memoized flattened items array
  const allItems = useMemo(() => {
    if (!billData?.billItems) return []
    return billData.billItems.flatMap((billGroup) => billGroup.items)
  }, [billData?.billItems])

  // Memoized total items count
  const totalItemsCount = useMemo(() => {
    return allItems.reduce((total, item) => total + item.quantity, 0)
  }, [allItems])

  const toggleQr = () => {
    setShowqr(!showqr)
  }

  const closeMoreOptions = () => {
    setShowMoreOption(false)
  }

  const openNormalSettle = useCallback(async () => {
    setNormalSettle(true)
  }, [])

  const closeNormalSettle = () => {
    setNormalSettle(false)
  }

  const triggerAddCoinz = () => {
    setOpenAddCoinz(true)
  }

  const reprintBillHandler = () => {
    reprintBill({
      businessId: businessId || "",
      tableName: selectedTable?.name || "",
    })
  }

  const { isPending, mutate } = useMutation({
    mutationFn: async () => {
      const response = await apiRpc.table.hi_settle.$post({
        json: {
          tableId: selectedTable?._id || "",
          captainId: userData?._id,
          billId: billData?.billId ?? "",
        },
      })
      if (response.status === 200) {
        const result = await response.json()
        setQrBillId(result?.data?.path)
        setShowqr(true)
      }
      return response.json()
    },
  })

  const removeClaimedCoins = () => {
    const confirmReplace = window.confirm("Applying this will remove your Coinz/Coupon. Continue?")
    if (!confirmReplace) return
    removingCoinz({
      businessId: businessId || "",
      tableName: billData?.tableName,
      coinzRemovedBy: userData?.name || "",
    })
  }

  const removeCoupon = () => {
    const confirmReplace = window.confirm("Applying this will remove your Coupon. Continue?")
    if (!confirmReplace) return
    removingCoupon({
      businessId: businessId || "",
      tableName: billData?.tableName,
    })
  }

  const removeServiceCharge = () => {
    const confirmReplace = window.confirm("Applying this will remove your Service Charge. Continue?")
    if (!confirmReplace) return
    removingServiceCharge({
      businessId: businessId || "",
      tableName: billData?.tableName,
      serviceChargeRemovedBy: userData?._id || "",
      reasonOfServiceCharge: "Service Charge Removed by Customer",
    })
  }

  // Helper function to calculate item total price
  const calculateItemTotal = (item: IBillData["billItems"][0]["items"][0]) => {
    const dishPrice = item.dish.price
    const portionPrice = item.portion?.price || 0
    const extrasTotal = item.extras.reduce((sum, extra) => sum + extra.price * extra.quantity, 0)
    return (dishPrice + portionPrice + extrasTotal) * item.quantity
  }

  // Helper function to render action history
  const renderActionHistory = () => {
    if (!billData) return null

    const actions = []

    if (billData.discountAppliedBy) {
      actions.push({
        type: "Discount Applied",
        user: billData.discountAppliedBy,
        details: `₹${billData.discount} discount applied ${
          billData.discountAppliedOn === "ON_DISH" ? "on specific items" : "on entire bill"
        }`,
        reason: billData.reasonOfDiscount,
        color: "bg-red-50 border-red-200 text-red-800",
        badgeColor: "bg-red-100 text-red-800",
      })
    }

    if (billData.discountRemovedBy) {
      actions.push({
        type: "Discount Removed",
        user: billData.discountRemovedBy,
        details: "Previous discount has been removed from the bill",
        color: "bg-green-50 border-green-200 text-green-800",
        badgeColor: "bg-green-100 text-green-800",
      })
    }

    if (billData.serviceChargeAppliedBy) {
      actions.push({
        type: "Service Charge Applied",
        user: billData.serviceChargeAppliedBy,
        details: `₹${billData.serviceCharge} service charge added to the bill`,
        color: "bg-blue-50 border-blue-200 text-blue-800",
        badgeColor: "bg-blue-100 text-blue-800",
      })
    }

    if (billData.serviceChargeRemovedBy) {
      actions.push({
        type: "Service Charge Removed",
        user: billData.serviceChargeRemovedBy,
        details: "Service charge has been removed from the bill",
        reason: billData.reasonOfServiceCharge,
        color: "bg-yellow-50 border-yellow-200 text-yellow-800",
        badgeColor: "bg-yellow-100 text-yellow-800",
      })
    }

    if (billData.claimedCoins > 0) {
      actions.push({
        type: "Loyalty Coins Applied",
        user: "Customer",
        details: `₹${billData.claimedCoins} loyalty coins redeemed`,
        color: "bg-purple-50 border-purple-200 text-purple-800",
        badgeColor: "bg-purple-100 text-purple-800",
      })
    }

    if (billData.couponDiscount > 0) {
      actions.push({
        type: "Coupon Applied",
        user: "System",
        details: `₹${billData.couponDiscount} coupon discount applied`,
        color: "bg-indigo-50 border-indigo-200 text-indigo-800",
        badgeColor: "bg-indigo-100 text-indigo-800",
      })
    }

    return actions.length > 0 ? (
      <Card className="mb-4">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Clock className="w-5 h-5" />
            Bill Modifications History
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {actions.map((action, index) => (
            <Alert key={index} className={`${action.color} border-l-4`}>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold">{action.type}</span>
                      <Badge className={action.badgeColor}>
                        <User className="w-3 h-3 mr-1" />
                        {action.user}
                      </Badge>
                    </div>
                    <p className="text-sm">{action.details}</p>
                    {action.reason && <p className="text-xs mt-1 opacity-80">Reason: {action.reason}</p>}
                  </div>
                </div>
              </AlertDescription>
            </Alert>
          ))}
        </CardContent>
      </Card>
    ) : null
  }

  if (isLoading || removingServiceChargeLoader || removingCouponLoader || removingCoinzLoader || isPrinting) {
    return <SpinnerMemo />
  }

  if (!billData) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">No bill available.</p>
        <CommonBottomButton
          fixed={true}
          maxWidth={screenSize === "xs" ? "30rem" : "48rem"}
          backgroundColor={screenSize === "xs" ? "" : "white"}
          buttons={[
            {
              text: "Back",
              onClick: closeOrderModalHandler,
              className: "rounded-md w-full",
            },
          ]}
        />
      </div>
    )
  }

  return (
    <>
      {!showqr && (
        <Card className="max-w-lg py-[5rem] md:py-[8rem] h-[90dvh] mx-auto mb-8 border border-none shadow-none">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Bill Summary</span>
              <section className="space-x-2">
                <Button variant="outline" onClick={reprintBillHandler} size="sm">
                  <BiSync />
                  Print Bill
                </Button>
                <Button size="sm" variant="outline" onClick={() => setShowEBill(true)}>
                  <ReceiptText />
                  E-Bill
                </Button>
              </section>
            </CardTitle>
          </CardHeader>

          <CardContent>
            <div className="mb-4 space-y-2">
              <div className="flex items-center gap-2">
                <Phone className="w-5 h-5 text-gray-600" />
                <p className="text-sm text-gray-700">
                  {billData?.customerName} ({billData?.customerPhone})
                </p>
              </div>
              <div className="flex items-center gap-2">
                <MdTableBar className="w-5 h-5 text-gray-600" />
                <p className="text-sm text-gray-700">Table: {billData?.tableName}</p>
              </div>
            </div>

            <Separator className="my-4" />

            {/* Action History */}
            {renderActionHistory()}

            <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
              <CollapsibleTrigger asChild>
                <Button variant="ghost" className="justify-between w-full">
                  <h3 className="font-semibold">
                    Items: {totalItemsCount} ({allItems.length} unique)
                  </h3>
                  {isExpanded ? (
                    <ChevronUp strokeWidth={4} className="w-4 h-4" />
                  ) : (
                    <ChevronDown strokeWidth={4} className="w-4 h-4" />
                  )}
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="space-y-2 overflow-auto max-h-[40vh] hide-scrollbar py-2">
                {allItems.map((item, index) => (
                  <div key={`${item._id}-${index}`} className="p-2 text-sm rounded-md bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="font-medium">{item?.dish?.name}</p>
                        {item?.portion && (
                          <p className="text-xs text-blue-600">
                            Portion: {item.portion.name} (+₹{item.portion.price})
                          </p>
                        )}
                        {item?.dish?.instruction && (
                          <p className="text-xs text-orange-600 italic">Note: {item.dish.instruction}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <p className="text-gray-600">Qty: {item?.quantity}</p>
                        <p className="font-medium">₹{calculateItemTotal(item)}</p>
                      </div>
                    </div>
                    {item?.extras?.length > 0 && (
                      <div className="mt-1 text-xs text-gray-600">
                        <p className="font-medium">Extras:</p>
                        {item?.extras?.map((extra, idx) => (
                          <p key={`${extra.id}-${idx}`}>
                            {extra?.name} - ₹{extra?.price} x {extra?.quantity}
                          </p>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </CollapsibleContent>
            </Collapsible>

            <Separator className="my-4" />

            {existingLoyalty?.loyaltyId && (
              <>
                <CardTitle className="flex items-center justify-between">
                  <span>Use customer Loyalty</span>
                  <Button variant="default" className="flex justify-end ml-auto" onClick={triggerAddCoinz}>
                    Use Coinz
                  </Button>
                </CardTitle>
                <Separator className="my-4" />
              </>
            )}

            <div className="mb-4 space-y-3">
              {[
                ["subTotal", billData.subTotal],
                ["serviceCharge", billData.serviceCharge],
                ["tips", billData.tips],
                ["discount", billData.discount],
                ["tax (GST)", billData.gst],
                ["otherTax", billData.otherTax],
                ["claimedCoins", billData.claimedCoins],
                ["couponDiscount", billData.couponDiscount],
              ]
                .filter(([_, value]) => typeof value === "number" && value > 0)
                .map(([key, value]) => {
                  const isDeduction = key === "claimedCoins" || key === "discount" || key === "couponDiscount"
                  return (
                    <div key={key} className="flex justify-between items-center text-sm">
                      <p className="text-gray-700 capitalize">{key?.replace(/([A-Z])/g, " $1")}</p>
                      <div className="flex items-center space-x-2">
                        <p className={`font-medium ${isDeduction ? "text-red-600" : "text-gray-900"}`}>
                          {isDeduction ? `-₹${Number(value).toFixed(2)}` : `₹${Number(value).toFixed(2)}`}
                        </p>
                        {key === "claimedCoins" && (
                          <button
                            type="button"
                            onClick={removeClaimedCoins}
                            className="text-red-600 text-2xl hover:underline"
                          >
                            <IoClose />
                          </button>
                        )}
                        {key === "couponDiscount" && (
                          <button
                            type="button"
                            onClick={removeCoupon}
                            className="text-red-600 text-2xl hover:underline"
                          >
                            <IoClose />
                          </button>
                        )}
                      </div>
                    </div>
                  )
                })}
              <div className="flex justify-between font-semibold text-base border-t pt-2">
                <p className="text-black">Total</p>
                <p className="text-black">₹{Number(billData.total).toFixed(2)}</p>
              </div>
            </div>

            <Separator className="my-4" />
          </CardContent>
        </Card>
      )}

      {/* All the popup modals remain the same */}
      {showMoreOption && (
        <BottomPopUp
          width="w-[30rem]"
          height="h-[100dvh] lg:h-[90dvh]"
          hide
          show={showMoreOption}
          onClose={closeMoreOptions}
          rightTopBack
        >
          <BillOptions data={billData} />
        </BottomPopUp>
      )}

      {showEBill && (
        <BottomPopUp width="w-[30rem]" hide rightTopBack show={showEBill} onClose={() => setShowEBill(false)}>
          <EBill />
        </BottomPopUp>
      )}

      {showqr && (
        <BottomPopUp width="w-[30rem]" hide show={showqr} onClose={() => setShowqr(false)}>
          <QrCodePreview data={billData} qrBillId={qrBillId} toggleQr={toggleQr} />
        </BottomPopUp>
      )}

      {normalSettle && (
        <BottomPopUp
          height="h-[100dvh] lg:h-[90dvh]"
          hide
          width="w-[30rem]"
          show={normalSettle}
          onClose={() => setNormalSettle(false)}
        >
          <NormalSettle closeNormalSettle={closeNormalSettle} data={billData} />
        </BottomPopUp>
      )}

      {openAddCoinz && (
        <BottomPopUp
          height="h-[100dvh] lg:h-[85dvh]"
          width="w-[30rem]"
          rightTopBack
          hide
          show={openAddCoinz}
          onClose={() => setOpenAddCoinz(false)}
        >
          <AddCoinz data={billData} />
        </BottomPopUp>
      )}

      <CommonBottomButton
        maxWidth={screenSize === "xs" ? "30rem" : "48rem"}
        backgroundColor={screenSize === "xs" ? "" : "white"}
        buttons={[
          {
            text: "",
            isBackButton: true,
            onClick: closeOrderModalHandler,
            className: "rounded-md pl-3",
          },
          {
            text: "Normal Settle",
            onClick: openNormalSettle,
            className: "rounded-md",
          },
          {
            text: "Hi Settle",
            onClick: () => {
              mutate()
            },
            disable: isPending,
            isLoading: isPending,
            highlight: true,
            className: "rounded-md",
          },
        ]}
      />
    </>
  )
}

const GetBill = memo(MemoGetBill)
export default GetBill
