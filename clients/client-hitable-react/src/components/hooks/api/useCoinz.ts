
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { apiRpc } from "@hi/common"
import { createPayloadWithVariant, getBillQueryKey } from "../../utils/api.utils"
import type { AddCoinzPayload, RemoveCoinzPayload, ApiResponse } from "../../types/api.types"
import type { IBillData } from "@/components/types/hiClientzData.ts"
import toast from "react-hot-toast"
import { useError } from "@/components/store/useError.ts"

export const useAddCoinz = (currentBill: IBillData | null = null) => {
  const { setError, setOpenErrorModal } = useError()
  const queryClient = useQueryClient()

  const { isPending: addingCoinzLoader, mutateAsync: addingCoinz } = useMutation({
    mutationFn: async (payload: Omit<AddCoinzPayload, "variantId">) => {
      const finalPayload = createPayloadWithVariant(payload, currentBill)
      const response = await apiRpc.pos.add_coins.$post({
        json: finalPayload,
      })
      return response
    },
    onSuccess: async (data) => {
      const extraData: ApiResponse = await data.json()
      if (data.status === 400 || data.status === 401) {
        setError(extraData.message || "Failed to add coinz")
        setOpenErrorModal(true)
        toast.error("Failed to add coinz")
        return
      }
      if (data.status === 200 || data.status === 201) {
        toast.success("Coinz added successfully")
        const queryKey = getBillQueryKey(currentBill)
        queryClient.invalidateQueries({ queryKey })
      }
    },
    onError: (err: any) => {
      setError(err?.message || "Error adding coinz")
      setOpenErrorModal(true)
      toast.error("Error adding coinz")
    },
  })

  return {
    addingCoinzLoader,
    addingCoinz,
  }
}

export const useRemoveCoinz = (currentBill: IBillData | null = null) => {
  const { setError, setOpenErrorModal } = useError()
  const queryClient = useQueryClient()

  const { isPending: removingCoinzLoader, mutateAsync: removingCoinz } = useMutation({
    mutationFn: async (payload: Omit<RemoveCoinzPayload, "variantId">) => {
      const finalPayload = createPayloadWithVariant(payload, currentBill)
      const response = await apiRpc.pos.remove_coins.$post({
        json: finalPayload,
      })
      return response
    },
    onSuccess: async (data) => {
      const extraData: ApiResponse = await data.json()
      if (data.status === 400 || data.status === 401) {
        setError(extraData.message || "Failed to remove coinz")
        setOpenErrorModal(true)
        toast.error("Failed to remove coinz")
        return
      }
      if (data.status === 200 || data.status === 201) {
        toast.success("Coinz removed successfully")
        const queryKey = getBillQueryKey(currentBill)
        queryClient.invalidateQueries({ queryKey })
      }
    },
    onError: (err: any) => {
      setError(err?.message || "Error removing coinz")
      setOpenErrorModal(true)
      toast.error("Error removing coinz")
    },
  })

  return {
    removingCoinzLoader,
    removingCoinz,
  }
}
