import { useState } from "react"
import { Clock, Save } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import toast from "react-hot-toast"
import useBusinessData from "@/components/store/useBusinessData"
import AdvancedBottomButton from "@/components/atom/bottomButton/advancedBottomButton"
import MemoizedHeader from "@/components/molecules/header"
import { FaArrowLeft } from "react-icons/fa"
import { useNavigate } from "react-router-dom"
import { useUpdateBusinessSetting } from "@/hooks/hotel/useBusinessSettingHook"
import LoadingSpinner from "@/components/atom/loadingSpinner"

const BusinessSettingsHotel = () => {
    const navigate = useNavigate()
    const businessData = useBusinessData((s) => s.outletInfo)
    const {updateBusinessSettingLoader, updateBusinessSetting} = useUpdateBusinessSetting()

    // Form state
    const [formData, setFormData] = useState({
        branchName: businessData?.branchName || "",
        is24Hours: false,
        startTime: "04:00",
        endTime: "03:59",
        phoneNumber: businessData?.phone || "",
        googleMapsDirection: businessData?.location || "",
    })

    // Error state
    const [errors, setErrors] = useState({
        branchName: false,
        phoneNumber: false,
    })

    // Format time for display (convert 24h to 12h format with AM/PM)
    const formatTimeForDisplay = (time: string) => {
        if (!time) return ""
        const [hours, minutes] = time.split(":")
        const hour = Number.parseInt(hours, 10)
        const ampm = hour >= 12 ? "PM" : "AM"
        const formattedHour = hour % 12 || 12
        return `${formattedHour}:${minutes} ${ampm}`
    }

    // Handle input changes

    const handleInputChange = (field: string, value: string | boolean) => {
        setFormData({
            ...formData,
            [field]: value,
        })

        // Clear error when user types
        if (errors[field as keyof typeof errors]) {
            setErrors({
                ...errors,
                [field]: false,
            })
        }
    }

    // Handle form submission
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if(formData.phoneNumber.length !== 10){
            toast.error("Phone number should be 10 digits")
            setErrors({
                ...errors,
                phoneNumber: true,
            })
            return
        }

        // Validate mandatory fields
        const newErrors = {
            branchName: !formData.branchName,
            phoneNumber: !formData.phoneNumber,
        }

        const payload = {
            businessId: businessData?.businessId,
            branchName: formData.branchName,
            billingStartTime: formData.startTime,
            billingEndTime: formData.endTime,
            phone: formData.phoneNumber,
            location: formData.googleMapsDirection,
        }

        setErrors(newErrors)

        // Check if there are any errors
        if (Object.values(newErrors).some((error) => error)) {
            toast.error("Please fill in all mandatory fields")
            return
        }

        await updateBusinessSetting(payload)
    }

    const handleBack = () => {
        navigate(-1)
    }

    if(updateBusinessSettingLoader){
        return <LoadingSpinner />
    }

    return (
        <main>
            <header className="linear_gradient_background">
                <MemoizedHeader title="Business Settings" leftIcon={<FaArrowLeft />} onBack={handleBack} />
            </header>
            <form onSubmit={handleSubmit} className="max-w-4xl p-6 mx-auto space-y-8 pb-[7rem]">
                {/* Business Summary */}
                <div className="space-y-4">
                    <h2 className="text-2xl font-bold">Business Summary</h2>
                    <Card>
                        <CardContent className="grid gap-6 pt-6">
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="businessName">
                                        Business Name :- <span className="ml-2 text-base font-semibold"> {businessData?.name}</span>
                                    </Label>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="businessType">
                                        Business Type :-<span className="ml-2 text-base font-semibold"> {businessData?.outLetType}</span>
                                    </Label>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="businessContact">
                                        Business Contact :- <span className="ml-2 text-base font-semibold"> {businessData?.phone}</span>
                                    </Label>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Outlet Branch Details */}
                <div className="space-y-4">
                    <h2 className="text-2xl font-bold">Outlet Branch Details</h2>
                    <Card>
                        <CardContent className="pt-6">
                            <div className="space-y-2">
                                <Label htmlFor="branchName" className={errors.branchName ? "text-destructive" : ""}>
                                    Branch Name <span className="text-destructive">*</span>
                                </Label>
                                <Input
                                    id="branchName"
                                    value={formData.branchName}
                                    onChange={(e) => handleInputChange("branchName", e.target.value)}
                                    className={errors.branchName ? "border-destructive" : ""}
                                    placeholder="Enter branch name"
                                />
                                {errors.branchName && <p className="text-sm text-destructive">Branch name is required</p>}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Business Timings */}
                <div className="space-y-4">
                    <h2 className="text-2xl font-bold">Business Timings</h2>
                    <Card>
                        <CardContent className="pt-6 space-y-6">
                            <p className="text-sm text-muted-foreground">
                                Billing, enquiries and other analytics reports are created with this in mind. Choose a start and end
                                date.
                            </p>

                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="is24Hours"
                                    checked={formData.is24Hours}
                                    onCheckedChange={(checked) => handleInputChange("is24Hours", Boolean(checked))}
                                />
                                <Label htmlFor="is24Hours">My business works 24/7</Label>
                            </div>

                            {!formData.is24Hours && (
                                <div className="grid grid-cols-2 gap-6 md:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label htmlFor="startTime">Opening Time</Label>
                                        <div className="flex items-center space-x-2">
                                            <Clock className="w-4 h-4 text-muted-foreground" />
                                            <Input
                                                id="startTime"
                                                type="time"
                                                value={formData.startTime}
                                                onChange={(e) => handleInputChange("startTime", e.target.value)}
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="endTime">Closing Time</Label>
                                        <div className="flex items-center space-x-2">
                                            <Clock className="w-4 h-4 text-muted-foreground" />
                                            <Input
                                                id="endTime"
                                                type="time"
                                                value={formData.endTime}
                                                onChange={(e) => handleInputChange("endTime", e.target.value)}
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="p-4 mt-4 border rounded-lg bg-muted/30">
                                <Label className="block mb-2 font-medium">Business Hours</Label>
                                {formData.is24Hours ? (
                                    <div className="flex items-center gap-2 text-lg font-semibold">
                                        <Clock className="w-5 h-5 text-primary" />
                                        <span>Open 24 hours</span>
                                    </div>
                                ) : (
                                    <div className="flex flex-col gap-1">
                                        <div className="flex items-center gap-2">
                                            <div className="flex items-center gap-2 text-lg font-semibold">
                                                <Clock className="w-5 h-5 text-primary" />
                                                <span>
                                                    {formatTimeForDisplay(formData.startTime)} - {formatTimeForDisplay(formData.endTime)}
                                                </span>
                                            </div>
                                        </div>
                                        <p className="text-sm text-muted-foreground">
                                            {formData.startTime > formData.endTime
                                                ? "Your business operates overnight"
                                                : "Your business operates within the same day"}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Business Communication */}
                <div className="space-y-4">
                    <h2 className="text-2xl font-bold">Business Communication</h2>
                    <Card>
                        <CardContent className="pt-6 space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="phoneNumber" className={errors.phoneNumber ? "text-destructive" : ""}>
                                    Which phone number to display to customers <span className="text-destructive">*</span>
                                </Label>
                                <div className="flex">
                                    <div className="flex items-center justify-center px-3 border border-r-0 bg-muted rounded-l-md">
                                        +91
                                    </div>
                                    <Input
                                        id="phoneNumber"
                                        value={formData.phoneNumber}
                                        onChange={(e) => handleInputChange("phoneNumber", e.target.value)}
                                        className={`rounded-l-none ${errors.phoneNumber ? "border-destructive" : ""}`}
                                        placeholder="Enter mobile number"
                                        maxLength={10}
                                    />
                                </div>
                                {errors.phoneNumber && <p className="text-sm text-destructive">Phone number is required</p>}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="googleMapsDirection" >
                                    Add directions for Google Maps
                                </Label>
                                <Input
                                    id="googleMapsDirection"
                                    value={formData.googleMapsDirection}
                                    onChange={(e) => handleInputChange("googleMapsDirection", e.target.value)}
                                    placeholder="Enter Google Maps link or address"
                                />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <Separator />

                <AdvancedBottomButton
                    fixed={true}
                    maxWidth="30rem"
                    buttons={[
                        {
                            text: "Cancel",
                            type: "button",
                            onClick: handleBack,
                            className: "w-full pl-3 rounded-md",
                            isBackButton: true,
                        },
                        {
                            text: "Save",
                            type: "submit",
                            icon: <Save className="w-4 h-4 mr-2" />,
                            className: "w-full rounded-md",
                        },
                    ]}
                />
            </form>
        </main>
    )
}

export default BusinessSettingsHotel
