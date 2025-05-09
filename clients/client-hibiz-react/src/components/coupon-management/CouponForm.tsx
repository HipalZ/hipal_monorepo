import { memo, useState } from "react"
import { Percent, DollarSign, Users } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useForm } from "react-hook-form"
import AdvancedBottomButton from "../atom/bottomButton/advancedBottomButton"

// Define types for form values
type CouponFormValues = {
  name: string
  config: {
    value: number
    discountType: "PERCENTAGE" | "AMOUNT"
    upto?: number
  }
  bookingMeta: {
    baseCharge: number
    redeemableCoverCharge?: number
    minGuests?: number
  }
}

type CouponFormProps = {
  onSubmit: (data: CouponFormValues) => Promise<void>
  onCancel: () => void
  isSubmitting: boolean
  initialValues?: Partial<CouponFormValues>
}

const CouponForm = ({ onSubmit, onCancel, isSubmitting, initialValues }: CouponFormProps) => {
  const [formError, setFormError] = useState<string | null>(null)

  // Initialize form with default values or initial values if provided
  const form = useForm<CouponFormValues>({
    defaultValues: {
      name: initialValues?.name || "",
      config: {
        value: initialValues?.config?.value || 0,
        discountType: initialValues?.config?.discountType || "PERCENTAGE",
        upto: initialValues?.config?.upto,
      },
      bookingMeta: {
        baseCharge: initialValues?.bookingMeta?.baseCharge || 0,
        redeemableCoverCharge: initialValues?.bookingMeta?.redeemableCoverCharge,
        minGuests: initialValues?.bookingMeta?.minGuests,
      },
    },
  })

  // Watch discount type to conditionally show upto field
  const discountType = form.watch("config.discountType")

  // Handle form submission
  const handleSubmit = async (data: CouponFormValues) => {
    try {
      setFormError(null)

      // If discount type is AMOUNT, remove upto field
      if (data.config.discountType === "AMOUNT") {
        delete data.config.upto
      }

      // Validate that redeemableCoverCharge is less than or equal to baseCharge
      if (
        data.bookingMeta.redeemableCoverCharge &&
        data.bookingMeta.redeemableCoverCharge > data.bookingMeta.baseCharge
      ) {
        setFormError("Redeemable cover charge must be less than or equal to base charge")
        return
      }

      await onSubmit(data)
    } catch (error) {
      console.error("Form submission error:", error)
      setFormError("An error occurred while submitting the form")
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        {formError && (
          <Alert variant="destructive">
            <AlertDescription>{formError}</AlertDescription>
          </Alert>
        )}

        {/* Coupon Name */}
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="font-semibold">Coupon Name</FormLabel>
              <FormControl>
                <Input placeholder="Weekend Special" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Discount Type */}
        <FormField
          control={form.control}
          name="config.discountType"
          render={({ field }) => (
            <FormItem className="space-y-3">
              <FormLabel className="font-semibold">Discount Type</FormLabel>
              <FormControl>
                <RadioGroup
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  className="flex flex-col space-y-1"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="PERCENTAGE" id="percentage" />
                    <Label htmlFor="percentage" className="flex items-center gap-1.5">
                      <Percent size={16} className="text-green-500" />
                      Percentage
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="AMOUNT" id="amount" />
                    <Label htmlFor="amount" className="flex items-center gap-1.5">
                      <DollarSign size={16} className="text-blue-500" />
                      Fixed Amount
                    </Label>
                  </div>
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Discount Value */}
        <FormField
          control={form.control}
          name="config.value"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="font-semibold">{discountType === "PERCENTAGE" ? "Discount Percentage" : "Discount Amount (₹)"}</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  min={1}
                  placeholder={discountType === "PERCENTAGE" ? "20" : "100"}
                  value={field.value}
                  onChange={(e) => field.onChange(Number(e.target.value) || 0)}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Maximum Discount (only for percentage) */}
        {discountType === "PERCENTAGE" && (
          <FormField
            control={form.control}
            name="config.upto"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="font-semibold">Maximum Discount Amount (₹)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min={0}
                    placeholder="100"
                    value={field.value || ""}
                    onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        {/* Base Charge */}
        <FormField
          control={form.control}
          name="bookingMeta.baseCharge"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="font-semibold">Base Charge (₹)</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  min={1}
                  placeholder="300"
                  value={field.value}
                  onChange={(e) => field.onChange(Number(e.target.value) || 0)}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Redeemable Cover Charge (optional) */}
        <FormField
          control={form.control}
          name="bookingMeta.redeemableCoverCharge"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="font-semibold">Redeemable Cover Charge (₹) (Optional)</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  min={0}
                  placeholder="50"
                  value={field.value || ""}
                  onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Minimum Guests (optional) */}
        <FormField
          control={form.control}
          name="bookingMeta.minGuests"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center gap-1.5 font-semibold">
                <Users size={16} className="text-purple-500" />
                Minimum Guests (Optional)
              </FormLabel>
              <FormControl>
                <Input
                  type="number"
                  min={1}
                  placeholder="2"
                  value={field.value || ""}
                  onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <AdvancedBottomButton
          fixed={true}
          maxWidth="30rem"
          buttons={[
            {
              text: "",
              isBackButton: true,
              onClick: onCancel,
              className:"pl-3 rounded-md"
            },
            {
              text: "Save Coupon",
              type: "submit",
              isLoading: isSubmitting,
              className:"rounded-md w-full"
            },
          ]}
        />
      </form>
    </Form>
  )
}

export default memo(CouponForm)
