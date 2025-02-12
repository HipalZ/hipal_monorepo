import { useCallback } from 'react'
import AdvancedBottomButton from '@/components/atom/bottomButton/advancedBottomButton'
import useZoneStore, { type link } from '@/components/store/useZone'
import PopUp from '@/components/atom/popUp'
import useBusinessData from '@/components/store/useBusinessData'
import { useCreateZone,useUpdateZone } from '@/hooks/useZone'
import LoadingSpinner from '@/components/atom/loadingSpinner'
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import toast from 'react-hot-toast'

const AddZone = () => {
  const {
    setLinkModalType,
    setLinkModal,
    isAvailable,
    setIsAvailable,
    tax,
    setTax,
    linkModal,
    linkModalType,
    zoneName,
    setZoneName,
    selectedTableIds,
    selectedCouponIds,
    resetAllValues,
    editZoneId
  } = useZoneStore()

  const {isPending:creatingZone,createZone} = useCreateZone()
  const {isPending:updatingZone,updateZone} = useUpdateZone()

  const businessData = useBusinessData(s=>s.businessData)

  const openLinkModalFunc = useCallback((type: link) => {
    setLinkModal(true)
    setLinkModalType(type)
  }, [setLinkModal, setLinkModalType])

  const closeLinkModalFunc = useCallback(() => {
    setLinkModal(false)
    setLinkModalType('')
  }, [setLinkModal, setLinkModalType])

  const handleTaxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = Number.parseFloat(e.target.value)
    if (value < 1) value = 1
    if (value > 100) value = 100
    setTax(value)
  }

  const createZoneFunc = async() => {
    if(!zoneName || zoneName.trim() === "") return toast.error("Zone name is required")

    const payload = {
      name: zoneName.toLowerCase(),
      businessId: businessData?._id,
      visibility: isAvailable,
      taxes:tax,
      tableIds: selectedTableIds,
      couponIds: selectedCouponIds
    }
    await createZone(payload)
  }

  const updateZoneFunc = async() => {
    if(!zoneName || zoneName.trim() === "") return toast.error("Zone name is required")
    const payload = {
      name: zoneName.toLowerCase(),
      visibility: isAvailable,
      businessId: businessData?._id,
      taxes:tax,
      tableIds: selectedTableIds,
      couponIds: selectedCouponIds,
      _id: editZoneId,
      zoneId: editZoneId
    }
   await updateZone(payload)
  }

  if(updatingZone || creatingZone) return <LoadingSpinner />

  return (
    <>
       <div className="max-w-md p-4 mx-auto space-y-6">
        <div className="space-y-2">
          <Label htmlFor="zoneName">Zone Name</Label>
          <Input
            id="zoneName"
            value={zoneName}
            onChange={(e) => setZoneName(e.target.value)}
            placeholder="Enter zone name"
          />
        </div>

        <div className="flex items-center justify-between">
          <Label htmlFor="availability">Visiblity</Label>
          <Switch id="availability" checked={isAvailable} onCheckedChange={setIsAvailable} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="tax">Tax (%)</Label>
          <Input id="tax" type="number" min={1} max={100} value={tax} onChange={handleTaxChange} />
        </div>

        <div className="flex justify-between gap-4">
          <Button onClick={() => openLinkModalFunc("table")} variant="outline" className="w-full">
            Add Tables
          </Button>
          <Button onClick={() => openLinkModalFunc("coupon")} variant="outline" className="w-full">
            Add Coupon
          </Button>
        </div>
      </div>

      {
        linkModal && (
          <PopUp hide show={linkModal} onClose={() => setLinkModal(false)}>
            {
              linkModalType === 'table' && <div>Table</div>
            }
            {
              linkModalType === 'coupon' && <div>Coupon</div>
            }
            <AdvancedBottomButton
              maxWidth="30rem"
              fixed={true}
              position="mid"
              buttons={[
                {
                  text: 'Cancel',
                  onClick: closeLinkModalFunc,
                  isBackButton: true,
                  className: 'rounded-md pl-3'
                },
                {
                  text: 'Close',
                  onClick: closeLinkModalFunc,
                  className: 'rounded-md pl-3',
                }
              ]}
            />
          </PopUp>
        )
      }

      <AdvancedBottomButton
        maxWidth="30rem"
        fixed={true}
        position="mid"
        buttons={[
          {
            text: 'Cancel',
            onClick: resetAllValues,
            isBackButton: true,
            className: 'rounded-md pl-3'
          },
          {
            text:editZoneId ? "Update Zone": 'Create Zone',
            onClick: editZoneId ? updateZoneFunc: createZoneFunc,
            className: 'rounded-md pl-3',
            swipe: zoneName,
            disable: !zoneName
          }
        ]}
      />
    </>
  )
}

export default AddZone
