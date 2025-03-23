import { memo, useEffect } from "react"
import { Check } from "lucide-react"
import useStaffStore from "@/components/store/hotel/useHotelStaff"
import { roleBadgeColors } from "./constants"
import useBusinessData from "@/components/store/useBusinessData"
import { useGetAllHotelStaffRoles } from "@/hooks/useHotelStaff"
import LoadingSpinner from "@/components/atom/loadingSpinner"

const SecondStep = () => {
    const { selectedRole, errors, setSelectedRole, editRoleStr } = useStaffStore((state) => ({
        selectedRole: state.selectedRole,
        errors: state.errors,
        setSelectedRole: state.setSelectedRole,
        editRoleStr: state.editRoleStr,
    }))
    const businessId = useBusinessData((s) => s.businessData?._id)
    const { isLoading, hotelRolesData } = useGetAllHotelStaffRoles(businessId as string)

    useEffect(() => {
        if (editRoleStr && hotelRolesData && hotelRolesData.length > 0 && !selectedRole) {
            const matchingRole = hotelRolesData.find((role) => role.role === editRoleStr)
            if (matchingRole) {
                setSelectedRole(matchingRole)
            }
        }
    }, [editRoleStr, hotelRolesData, selectedRole, setSelectedRole])

    if (isLoading) {
        return <LoadingSpinner />
    }

    return (
        <div className="space-y-4">
            <h2 className="text-xl font-semibold">Select Role</h2>
            {errors.role && <p className="text-sm text-destructive">{errors.role}</p>}

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {hotelRolesData?.map((role) => (
                    <div
                        key={role._id}
                        className={`
                            p-3 border rounded-lg cursor-pointer transition-all
                            ${selectedRole?._id === role._id || (!selectedRole && editRoleStr === role.role)
                                ? `${roleBadgeColors[role.role]} border-2`
                                : "border-gray-200 hover:border-gray-300"
                            }
                        `}
                        onClick={() => setSelectedRole(role)}
                    >
                        <div className="flex items-center justify-between">
                            <span className="font-medium">{role.role.replace(/_/g, " ")}</span>
                            {(selectedRole?._id === role._id || (!selectedRole && editRoleStr === role.role)) && (
                                <Check className="w-4 h-4" />
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default memo(SecondStep)

