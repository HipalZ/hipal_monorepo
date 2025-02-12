"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import useZoneStore from "@/components/store/useZone"
// import { useCreateTable } from "@/hooks/useTable" // Assuming you have this hook

const steps = ["Table Details", "Select Zone", "Select Staff", "Confirm"]

export default function CreateTable() {
  const [currentStep, setCurrentStep] = useState(0)
  const {
    tableName,
    setTableName,
    capacity,
    setCapacity,
    allZones,
    allStaff,
    selectZone,
    setSelectZone,
    selectedStaffIds,
    setSelectedStaffIds,
    resetAllValues,
  } = useZoneStore()

//   const { createTable, isPending } = useCreateTable() // Assuming you have this hook

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleConfirm = async () => {
    console.log("Creating table...",{
        name: tableName,
        capacity: capacity,
        zoneId: selectZone?._id,
        staffIds: selectedStaffIds,
    })
    // if (selectZone) {
    //   await createTable({
    //     name: tableName,
    //     capacity: capacity,
    //     zoneId: selectZone._id,
    //     staffIds: selectedStaffIds,
    //   })
    //   resetAllValues()
    //   // Handle success (e.g., show a success message, redirect, etc.)
    // }
  }

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="tableName">Table Name</Label>
              <Input
                id="tableName"
                value={tableName}
                onChange={(e) => setTableName(e.target.value)}
                placeholder="Enter table name"
              />
            </div>
            <div>
              <Label htmlFor="capacity">Capacity</Label>
              <Input
                id="capacity"
                type="number"
                value={capacity}
                onChange={(e) => setCapacity(Number(e.target.value))}
                placeholder="Enter capacity"
              />
            </div>
          </div>
        )
      case 1:
        return (
          <div>
            <Label htmlFor="zone">Select Zone</Label>
            <Select onValueChange={(value) => setSelectZone(allZones.find((zone) => zone._id === value) || null)}>
              <SelectTrigger>
                <SelectValue placeholder="Select a zone" />
              </SelectTrigger>
              <SelectContent>
                {allZones.map((zone) => (
                  <SelectItem key={zone._id} value={zone._id}>
                    {zone.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )
      case 2:
        return (
          <div>
            <Label>Select Staff</Label>
            {allStaff.map((staff) => (
              <div key={staff._id} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id={staff._id}
                  checked={selectedStaffIds.includes(staff._id)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedStaffIds([...selectedStaffIds, staff._id])
                    } else {
                      setSelectedStaffIds(selectedStaffIds.filter((id) => id !== staff._id))
                    }
                  }}
                />
                <Label htmlFor={staff._id}>{staff.name}</Label>
              </div>
            ))}
          </div>
        )
      case 3:
        return (
          <div className="space-y-2">
            <p>
              <strong>Table Name:</strong> {tableName}
            </p>
            <p>
              <strong>Capacity:</strong> {capacity}
            </p>
            <p>
              <strong>Selected Zone:</strong> {selectZone?.name}
            </p>
            <p>
              <strong>Selected Staff:</strong> {selectedStaffIds.length}
            </p>
          </div>
        )
      default:
        return null
    }
  }

  return (
    <Card className="w-full max-w-lg mx-auto">
      <CardHeader>
        <CardTitle>Create Table - Step {currentStep + 1}</CardTitle>
        <CardDescription>{steps[currentStep]}</CardDescription>
      </CardHeader>
      <CardContent>{renderStep()}</CardContent>
      <CardFooter className="flex justify-between">
        <Button onClick={handlePrevious} disabled={currentStep === 0} variant="outline">
          Previous
        </Button>
        {currentStep < steps.length - 1 ? (
          <Button onClick={handleNext}>Next</Button>
        ) : (
          <Button onClick={handleConfirm} >
            Confirm
            {/* {isPending ? "Creating..." : "Confirm"} */}
          </Button>
        )}
      </CardFooter>
    </Card>
  )
}

