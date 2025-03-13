import { memo } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import useStaffStore from "@/components/store//hotel/useHotelStaff"
import { Phone } from "lucide-react"

const FirstStep = () => {
    const { personalInfo, errors, setPersonalInfo, isEditMode } = useStaffStore(
        (state) => ({
            personalInfo: state.personalInfo,
            errors: state.errors,
            setPersonalInfo: state.setPersonalInfo,
            isEditMode: state.isEditMode,
        })
    )

    return (
        <div className="space-y-4">
            <h2 className="text-xl font-semibold">Personal Information</h2>

            <div className="space-y-2">
                <Label htmlFor="name" className={errors.name ? "text-destructive" : ""}>
                    Name <span className="text-destructive">*</span>
                </Label>
                <Input
                    id="name"
                    value={personalInfo.name}
                    onChange={(e) => setPersonalInfo({ name: e.target.value })}
                    placeholder="Enter staff name"
                    maxLength={25}
                    className={errors.name ? "border-destructive" : ""}
                />
                {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
            </div>

            {isEditMode ? (
                <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <div className="flex items-center p-2 rounded-md bg-muted">
                        <Phone className="w-4 h-4 mr-2 text-primary" />
                        <span className="font-medium">+91 {personalInfo.phone}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">Phone number cannot be changed</p>
                </div>
            ) : (
                <div className="space-y-2">
                    <Label htmlFor="phone" className={errors.phone ? "text-destructive" : ""}>
                        Phone Number <span className="text-destructive">*</span>
                    </Label>
                    <div className="flex">
                        <div className="flex items-center justify-center px-3 border border-r-0 bg-muted rounded-l-md">+91</div>
                        <Input
                            id="phone"
                            value={personalInfo.phone}
                            onChange={(e) => setPersonalInfo({ phone: e.target.value })}
                            placeholder="Enter phone number"
                            className={`rounded-l-none ${errors.phone ? "border-destructive" : ""}`}
                            maxLength={10}
                        />
                    </div>
                    {errors.phone && <p className="text-sm text-destructive">{errors.phone}</p>}
                </div>
            )}
            {
                isEditMode ? null : (

                    <div className="space-y-2">
                        <Label htmlFor="password" className={errors.password ? "text-destructive" : ""}>
                            Password <span className="text-destructive">*</span>
                        </Label>
                        <Input
                            id="password"
                            type="password"
                            value={personalInfo.password}
                            maxLength={4}
                            onChange={(e) => setPersonalInfo({ password: e.target.value })}
                            placeholder="Enter password"
                            className={errors.password ? "border-destructive" : ""}
                        />
                        {errors.password && <p className="text-sm text-destructive">{errors.password}</p>}
                    </div>
                )
            }

            <div className="space-y-2">
                <Label htmlFor="nickname">
                    Nickname <span className="text-xs text-muted-foreground">(Optional)</span>
                </Label>
                <Input
                    id="nickname"
                    value={personalInfo.nickname}
                    maxLength={25}
                    onChange={(e) => setPersonalInfo({ nickname: e.target.value })}
                    placeholder="Enter nickname"
                />
            </div>

        </div>
    )
}

export default memo(FirstStep)

