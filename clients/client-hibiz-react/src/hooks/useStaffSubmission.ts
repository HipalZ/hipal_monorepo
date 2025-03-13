import { useState, useCallback } from "react"
import useStaffStore from "@/components/store/hotel/useHotelStaff"
import toast from "react-hot-toast"
import { useAddStaffToHotel, useUpdateStaffToHotel } from "./useHotelStaff"
import useBusinessData from "@/components/store/useBusinessData"

export const useStaffSubmission = () => {
    const { addStaff, addStaffLoader } = useAddStaffToHotel()
    const { updateStaff, updateStaffLoader } = useUpdateStaffToHotel()
    const businessId = useBusinessData((state) => state.businessData?._id)
    const [isSubmitting, setIsSubmitting] = useState(false)

    const { isEditMode, editStaffId, personalInfo, selectedRole, selectedServices, resetForm } = useStaffStore((state) => ({
        personalInfo: state.personalInfo,
        selectedRole: state.selectedRole,
        selectedServices: state.selectedServices,
        resetForm: state.resetForm,
        isEditMode: state.isEditMode,
        editStaffId: state.editStaffId,
    }))


    const handleSubmit = useCallback(async () => {
        try {
            setIsSubmitting(true)

            if (isEditMode) {
                const payload = {
                    name: personalInfo.name,
                    phone: personalInfo.phone,
                    nickName: personalInfo.nickname,
                    role: selectedRole?.role || "HELP_DESK",
                    services: selectedServices.map((service) => service._id),
                    businessId: businessId as string,
                    staffId: editStaffId || ""
                }
                await updateStaff(payload)
            } else {
                const payload = {
                    name: personalInfo.name,
                    phone: personalInfo.phone,
                    password: personalInfo.password,
                    nickName: personalInfo.nickname,
                    role: selectedRole?.role || "HELP_DESK",
                    services: selectedServices.map((service) => service._id),
                    businessId: businessId as string,
                }

                await addStaff(payload)
            }


        } catch (error) {
            console.error("Error adding staff:", error)
            toast.error("Failed to add staff")
        } finally {
            setIsSubmitting(false)
        }
    }, [personalInfo, selectedRole, selectedServices, resetForm, businessId, isEditMode, editStaffId, addStaff, updateStaff])

    return {
        addStaffLoader,
        updateStaffLoader,
        isSubmitting,
        isEditMode,
        handleSubmit,
    }
}

