"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { motion } from "framer-motion";
import { useGetUserDetails, useSaveUserDetails } from "../hooks/useUserDetails";
import toast from "react-hot-toast";
import SpinnerSection from "../atoms/sectionSpinner/index";

const leadFormSchema = z.object({
  fullName: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(60, "Name must be less than 60 characters")
    .regex(/^[a-zA-Z\s]+$/, "Name can only contain letters and spaces"),
  email: z
    .string()
    .email("Please enter a valid email address")
    .min(1, "Email is required"),
  contact: z.string().optional(), // Made optional since it's read-only
  address: z
    .string()
    .min(10, "Address must be at least 10 characters")
    .max(200, "Address must be less than 200 characters"),
  profession: z.string().min(1, "Please select your profession"),
  otherProfession: z.string().optional(),
  consent: z.boolean().refine((val) => val === true, {
    message: "You must agree to the privacy policy to continue",
  }),
});

type LeadFormData = z.infer<typeof leadFormSchema>;

interface LeadFormModalProps {
  isOpen: boolean;
  onClose: (reason?: "submitted" | "dismissed") => void;
  businessId: string;
  userId: string;
}

export default function LeadFormModal({
  isOpen,
  onClose,
  businessId,
  userId,
}: LeadFormModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showOtherProfession, setShowOtherProfession] = useState(false);
  const { data, isLoading, refetch } = useGetUserDetails(userId);
  const { isPending, mutateAsync } = useSaveUserDetails();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<LeadFormData>({
    resolver: zodResolver(leadFormSchema),
    defaultValues: {
      fullName: "",
      email: "",
      contact: "",
      address: "",
      profession: "",
      otherProfession: "",
      consent: false,
    },
  });

  useEffect(() => {
    if (data && !isLoading) {
      setValue("fullName", data.name || "");
      setValue("email", data.email || "");
      setValue("contact", data.phone || "");
      setValue("address", data.address || "");
      setValue("profession", data.profession || "");

      // Check if profession is "Other" type
      if (
        data.profession &&
        ![
          "Engineer",
          "Doctor",
          "IT Professional",
          "Entrepreneur",
          "Student",
          "Government Employee",
        ].includes(data.profession)
      ) {
        setValue("profession", "Other");
        setValue("otherProfession", data.profession);
        setShowOtherProfession(true);
      }
    }
  }, [data, isLoading, setValue]);

  const watchedProfession = watch("profession");

  const handleProfessionChange = (value: string) => {
    setValue("profession", value);
    setShowOtherProfession(value === "Other");
    if (value !== "Other") setValue("otherProfession", "");
  };

  const onSubmit = async (data: LeadFormData) => {
    setIsSubmitting(true);

    const resolvedProfession =
      data.profession === "Other"
        ? `Other: ${data.otherProfession}`
        : data.profession;

    const userdata = {
      name: data.fullName,
      email: data.email,
      address: data.address,
      profession: resolvedProfession,
      consent: true,
    };

    const payload = {
      userId,
      payload: userdata,
    };

    const res = await mutateAsync(payload);
    console.log("Lead Form Submission:", res);
    if (res.status === 200 || res.status === 201) {
      toast.success("User details updated successfully!");
      // Simulate API call
      refetch();
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setIsSubmitting(false);
      reset();
      onClose("submitted");
    } else {
      toast.error("Failed to update user details.");
      console.log("Lead Form Submission:", payload);
    }
  };

  const handleNotNow = () => {
    reset();
    onClose("dismissed");
  };

  const handleReset = () => {
    reset();
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => !open && onClose("dismissed")}
    >
      <DialogContent
        onPointerDownOutside={(e) => e.preventDefault()}
        onInteractOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
        className="sm:max-w-md max-h-[90vh] overflow-y-auto bg-white/95 backdrop-blur-xl border border-white/20 shadow-2xl shadow-black/10"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-white/40 via-white/20 to-transparent rounded-lg pointer-events-none" />

        <div className="relative z-10">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-gray-900">
              Get Property Updates
            </DialogTitle>
            <DialogDescription className="text-gray-600">
              Stay informed about our latest properties and exclusive offers.
              We'll send you personalized updates based on your preferences.
            </DialogDescription>
          </DialogHeader>
          {isPending || isLoading ? (
            <section className="h-[10rem] w-[10rem] rounded-xl bg-white">
              <SpinnerSection />
            </section>
          ) : (
            <motion.form
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              onSubmit={handleSubmit(onSubmit)}
              className="space-y-4 mt-4"
            >
              {/* Full Name */}
              <div className="space-y-2">
                <Label
                  htmlFor="fullName"
                  className="text-sm font-medium text-gray-900"
                >
                  Full Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="fullName"
                  {...register("fullName")}
                  placeholder="Enter your full name"
                  className={`bg-white/60 backdrop-blur-sm border border-white/30 focus:border-blue-400/50 focus:ring-2 focus:ring-blue-400/20 text-gray-900 placeholder:text-gray-500 ${
                    errors.fullName
                      ? "border-red-400/50 focus:border-red-400/50 focus:ring-red-400/20"
                      : ""
                  }`}
                />
                {errors.fullName && (
                  <p className="text-sm text-red-500">
                    {errors.fullName.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="email"
                  className="text-sm font-medium text-gray-900"
                >
                  Email Address <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="email"
                  {...register("email")}
                  placeholder="Enter your email address"
                  type="email"
                  className={`bg-white/60 backdrop-blur-sm border border-white/30 focus:border-blue-400/50 focus:ring-2 focus:ring-blue-400/20 text-gray-900 placeholder:text-gray-500 ${
                    errors.email
                      ? "border-red-400/50 focus:border-red-400/50 focus:ring-red-400/20"
                      : ""
                  }`}
                />
                {errors.email && (
                  <p className="text-sm text-red-500">{errors.email.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="contact"
                  className="text-sm font-medium text-gray-900"
                >
                  Contact Number
                </Label>
                <Input
                  id="contact"
                  {...register("contact")}
                  placeholder="Phone number from profile"
                  type="tel"
                  readOnly
                  disabled
                  className="bg-gray-100/60 backdrop-blur-sm border border-gray-200/50 text-gray-700 placeholder:text-gray-400 cursor-not-allowed"
                />
                <p className="text-xs text-gray-500">
                  Phone number cannot be edited
                </p>
              </div>

              {/* Address */}
              <div className="space-y-2">
                <Label
                  htmlFor="address"
                  className="text-sm font-medium text-gray-900"
                >
                  Address <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  id="address"
                  {...register("address")}
                  placeholder="Enter your current address"
                  rows={3}
                  className={`bg-white/60 backdrop-blur-sm border border-white/30 focus:border-blue-400/50 focus:ring-2 focus:ring-blue-400/20 text-gray-900 placeholder:text-gray-500 resize-none ${
                    errors.address
                      ? "border-red-400/50 focus:border-red-400/50 focus:ring-red-400/20"
                      : ""
                  }`}
                />
                {errors.address && (
                  <p className="text-sm text-red-500">
                    {errors.address.message}
                  </p>
                )}
              </div>

              {/* Profession */}
              <div className="space-y-2">
                <Label
                  htmlFor="profession"
                  className="text-sm font-medium text-gray-900"
                >
                  Profession <span className="text-red-500">*</span>
                </Label>
                <Select
                  onValueChange={handleProfessionChange}
                  value={watchedProfession}
                >
                  <SelectTrigger
                    className={`bg-white/60 backdrop-blur-sm border border-white/30 focus:border-blue-400/50 focus:ring-2 focus:ring-blue-400/20 text-gray-900 ${
                      errors.profession
                        ? "border-red-400/50 focus:border-red-400/50 focus:ring-red-400/20"
                        : ""
                    }`}
                  >
                    <SelectValue
                      placeholder="Select your profession"
                      className="text-gray-500"
                    />
                  </SelectTrigger>
                  <SelectContent className="bg-white/95 backdrop-blur-xl border border-white/20 shadow-xl">
                    {[
                      "Engineer",
                      "Doctor",
                      "IT Professional",
                      "Entrepreneur",
                      "Student",
                      "Government Employee",
                      "Other",
                    ].map((option) => (
                      <SelectItem
                        key={option}
                        value={option}
                        className="text-gray-900 hover:bg-white/50"
                      >
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.profession && (
                  <p className="text-sm text-red-500">
                    {errors.profession.message}
                  </p>
                )}
              </div>

              {/* Other Profession (conditional) */}
              {showOtherProfession && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                  className="space-y-2"
                >
                  <Label
                    htmlFor="otherProfession"
                    className="text-sm font-medium text-gray-900"
                  >
                    Please specify <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="otherProfession"
                    {...register("otherProfession", {
                      required: showOtherProfession
                        ? "Please specify your profession"
                        : false,
                      minLength: showOtherProfession
                        ? { value: 2, message: "Must be at least 2 characters" }
                        : undefined,
                      maxLength: showOtherProfession
                        ? {
                            value: 50,
                            message: "Must be less than 50 characters",
                          }
                        : undefined,
                    })}
                    placeholder="Enter your profession"
                    className={`bg-white/60 backdrop-blur-sm border border-white/30 focus:border-blue-400/50 focus:ring-2 focus:ring-blue-400/20 text-gray-900 placeholder:text-gray-500 ${
                      errors.otherProfession
                        ? "border-red-400/50 focus:border-red-400/50 focus:ring-red-400/20"
                        : ""
                    }`}
                  />
                  {errors.otherProfession && (
                    <p className="text-sm text-red-500">
                      {errors.otherProfession.message}
                    </p>
                  )}
                </motion.div>
              )}

              {/* Consent Checkbox */}
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <Checkbox
                    id="consent"
                    {...register("consent")}
                    onCheckedChange={(checked) =>
                      setValue("consent", checked as boolean)
                    }
                    className={`bg-white/60 backdrop-blur-sm border border-white/30 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600 ${
                      errors.consent ? "border-red-400/50" : ""
                    }`}
                  />
                  <Label
                    htmlFor="consent"
                    className="text-sm leading-relaxed cursor-pointer text-gray-900"
                  >
                    I agree to the collection and use of my information to
                    receive property updates in accordance with the{" "}
                    <span className="text-blue-600 underline">
                      Privacy Policy
                    </span>
                    . <span className="text-red-500">*</span>
                  </Label>
                </div>
                {errors.consent && (
                  <p className="text-sm text-red-500">
                    {errors.consent.message}
                  </p>
                )}
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={handleReset}
                  disabled={isSubmitting}
                  className="flex-1 bg-gray-100/40 hover:bg-gray-200/60 backdrop-blur-sm border border-gray-200/30 text-gray-700 hover:text-gray-800"
                >
                  Reset
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={handleNotNow}
                  disabled={isSubmitting}
                  className="flex-1 bg-white/40 hover:bg-white/60 backdrop-blur-sm border border-white/30 text-gray-900 hover:text-gray-900"
                >
                  Not now
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 bg-blue-600/90 hover:bg-blue-700/90 backdrop-blur-sm border border-blue-500/20 text-white shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  {isSubmitting ? "Saving..." : "Save"}
                </Button>
              </div>
            </motion.form>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
