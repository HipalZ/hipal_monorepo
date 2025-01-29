import { useState, useCallback, useMemo } from "react"
import { useMutation } from "@tanstack/react-query"
import { useParams } from "react-router-dom"
import { memo, lazy, Suspense } from "react"
import { apiRpc } from "@hi/common"
import { useDues } from "@/components/store/useDues"
import LoadingSpinner from "@/components/atom/loadingSpinner"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import toast from "react-hot-toast"
import { useQueryClient } from "@tanstack/react-query"

const BottomButton = lazy(() => import("@/components/atom/bottomButton"))

const MemoAddNpcUser = () => {
    const { setIsUserAdded } = useDues((s) => ({
        setIsUserAdded: s.setIsUserAdded,
    }))
    const queryClient = useQueryClient()
    const { businessId } = useParams()
    const [name, setName] = useState("")
    const [phone, setPhone] = useState("")

    const validateName = useCallback((value: string) => {
        return value.length >= 2 && value.length <= 30
    }, [])

    const validatePhone = useCallback((value: string) => {
        const phoneRegex = /^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/
        return phoneRegex.test(value)
    }, [])

    const isFormValid = useMemo(() => {
        return validateName(name) && validatePhone(phone)
    }, [name, phone, validateName, validatePhone])

    const { isPending, mutateAsync } = useMutation({
        mutationFn: async () => {
            const response = await apiRpc.npc.$post({
                json: {
                    businessId: businessId || "",
                    name,
                    phone,
                },
            })
            return response.json()
        },
        onSuccess: (data) => {
            if (!data.err) {
                setIsUserAdded(false)
                queryClient.invalidateQueries({ queryKey: ["allNpcUsers", businessId] })
                return toast.success(data.message)
            }
            toast.error(data.message)
        },
        onError: (error) => {
            console.log(error)
            toast.error("Failed to add user")
        },
    })

    const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setName(e.target.value)
    }

    const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setPhone(e.target.value)
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (isFormValid) {
            mutateAsync()
        }
    }

    return (
        <Card className="w-full max-w-md mx-auto border-none shadow-none">
            <CardHeader>
                <CardTitle>Add Npc User </CardTitle>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">Name</Label>
                        <Input type="text" id="name" value={name} onChange={handleNameChange} placeholder="Enter name" />
                        {name && !validateName(name) && (
                            <p className="text-sm text-destructive">Name must be between 2 and 30 characters</p>
                        )}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="phone">Phone Number</Label>
                        <Input
                            maxLength={10}
                            type="tel"
                            id="phone"
                            value={phone}
                            onChange={handlePhoneChange}
                            placeholder="Enter phone number" />
                        {phone && !validatePhone(phone) && (
                            <p className="text-sm text-destructive">Please enter a valid phone number</p>
                        )}
                    </div>
                    <Suspense fallback={<LoadingSpinner />}>
                        <BottomButton
                            buttons={[
                                {
                                    text: "Confirm",
                                    type: "submit",
                                    disable: !isFormValid || isPending,
                                    isLoading: isPending,
                                },
                            ]}
                        />
                    </Suspense>
                </form>
            </CardContent>

        </Card>
    )
}

const AddNpcUser = memo(MemoAddNpcUser)
export default AddNpcUser

