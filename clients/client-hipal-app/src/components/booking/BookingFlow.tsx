"use client"

import { useState } from "react"
import BookingDetails from "@/components/booking/BookingDetails"
import BottomPopUp from "../atoms/bottomPopUp/index"
import GuestSelection from "./GuestSelection"

export type BookingStep = "guests" | "details"

interface BookingFlowProps {
  isOpen: boolean
  onClose: () => void
}

export default function BookingFlow({ isOpen, onClose }: BookingFlowProps) {
  const [step, setStep] = useState<BookingStep>("guests")
  const [guestCount, setGuestCount] = useState<number | null>(null)
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)

  // Reset state when closing the popup
  const handleClose = () => {
    onClose()
    setTimeout(() => {
      setStep("guests")
      setGuestCount(null)
      setSelectedDate(null)
    }, 300) // Wait for animation to complete
  }

  // Handle continuing to the next step
  const handleContinue = () => {
    setStep("details")
  }

  // Handle guest count selection
  const handleGuestSelect = (count: number) => {
    setGuestCount(count)
  }

  // Handle date selection
  const handleDateSelect = (date: Date) => {
    setSelectedDate(date)
  }

  // Handle updating guest count from dropdown
  const handleUpdateGuests = (count: number) => {
    setGuestCount(count)
  }

  return (
    <BottomPopUp show={isOpen} onClose={handleClose} height={step === "guests" ? "auto" : "100dvh"}>
      {step === "guests" ? (
        <GuestSelection selectedGuests={guestCount} onGuestSelect={handleGuestSelect} onContinue={handleContinue} />
      ) : (
        <BookingDetails
          guestCount={guestCount || 1}
          selectedDate={selectedDate}
          onGuestUpdate={handleUpdateGuests}
          onDateSelect={handleDateSelect}
          onBack={() => setStep("guests")}
        />
      )}
    </BottomPopUp>
  )
}
