import { memo } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Check, Phone, User, Key, Briefcase, ListChecks } from "lucide-react"
import useStaffStore from "@/components/store/hotel/useHotelStaff"
import { roleBadgeColors } from "./constants"

const ForthStep = () => {
    const { personalInfo, selectedRole, selectedServices ,editStaffId,isEditMode} = useStaffStore(
        (state) => ({
            personalInfo: state.personalInfo,
            selectedRole: state.selectedRole,
            selectedServices: state.selectedServices,
            isEditMode: state.isEditMode,
            editStaffId: state.editStaffId,
        })
    )

    return (
        <div className="space-y-5">
           
            <p className="text-sm text-muted-foreground">Please review all information before adding the staff member</p>

            {/* Personal Information */}
            <Card>
                <CardContent className="p-4 space-y-3">
                    <div className="flex items-center gap-2 font-medium text-primary">
                        <User className="w-4 h-4" />
                        <h3>{isEditMode ? "Updating" :""} Personal Information</h3>
                    </div>

                    <div className="grid grid-cols-1 gap-2 pl-6">
                        <div className="flex flex-col">
                            <span className="text-sm text-muted-foreground">Name</span>
                            <span className="font-medium">{personalInfo.name}</span>
                        </div>

                        <div className="flex flex-col">
                            <span className="text-sm text-muted-foreground">Phone</span>
                            <div className="flex items-center">
                                <Phone className="w-3 h-3 mr-1 text-muted-foreground" />
                                <span className="font-medium">+91 {personalInfo.phone}</span>
                            </div>
                        </div>

                        {personalInfo.nickname && (
                            <div className="flex flex-col">
                                <span className="text-sm text-muted-foreground">Nickname</span>
                                <span className="font-medium">{personalInfo.nickname}</span>
                            </div>
                        )}

                        <div className="flex flex-col">
                            <span className="text-sm text-muted-foreground">Password</span>
                            <div className="flex items-center">
                                <Key className="w-3 h-3 mr-1 text-muted-foreground" />
                                <span className="font-medium">{personalInfo?.password || "********"}</span>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Role Information */}
            <Card>
                <CardContent className="p-4 space-y-3">
                    <div className="flex items-center gap-2 font-medium text-primary">
                        <Briefcase className="w-4 h-4" />
                        <h3>Role</h3>
                    </div>

                    <div className="pl-6">
                        {selectedRole ? (
                            <Badge className={`${roleBadgeColors[selectedRole.role]} px-3 py-1.5 text-sm font-medium`}>
                                {selectedRole.role.replace(/_/g, " ")}
                            </Badge>
                        ) : (
                            <span className="text-sm text-muted-foreground">No role selected</span>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Services Information */}
            <Card>
                <CardContent className="p-4 space-y-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 font-medium text-primary">
                            <ListChecks className="w-4 h-4" />
                            <h3>Services</h3>
                        </div>
                        <Badge variant="outline" className="px-2 py-0.5">
                            {selectedServices.length} selected
                        </Badge>
                    </div>

                    <div className="pl-6">
                        {selectedServices.length > 0 ? (
                            <div className="space-y-2 max-h-[150px] overflow-y-auto pr-2">
                                {selectedServices.map((service) => (
                                    <div key={service._id} className="flex items-center gap-2 p-2 rounded-md bg-muted/50">
                                        <Check className="h-3.5 w-3.5 text-primary" />
                                        <span>{service.name}</span>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <span className="text-sm text-muted-foreground">No services selected</span>
                        )}
                    </div>
                </CardContent>
            </Card>

            <div className="pt-2 text-center">
                <p className="text-sm text-muted-foreground">Click "Add Staff" to confirm and create this staff member</p>
            </div>
        </div>
    )
}

export default memo(ForthStep)

