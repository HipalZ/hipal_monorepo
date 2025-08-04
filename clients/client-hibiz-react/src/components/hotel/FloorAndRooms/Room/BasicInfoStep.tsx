import { memo } from "react";
import { Bed } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { StepProps } from "./types";
import { useRoomStore } from "@/components/store/hotel/useRoomStore";

const BasicInfoStep = ({ formData, errors, handleChange }: StepProps) => {
  const { roomType: roomTypesData } = useRoomStore((s) => ({
    roomType: s.roomType,
  }));

  return (
    <div className="space-y-6 pb-[7rem]">
      <h2 className="text-xl font-semibold">Basic Information</h2>

      {/* Room Name */}
      <div className="space-y-2">
        <Label htmlFor="name" className={errors.name ? "text-destructive" : ""}>
          Room Name <span className="text-destructive">*</span>
        </Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => handleChange("name", e.target.value)}
          placeholder="Enter room name or number (e.g. 101)"
          className={errors.name ? "border-destructive" : ""}
        />
        {errors.name && (
          <p className="text-sm text-destructive">{errors.name}</p>
        )}
      </div>

      {/* Room Type Selection */}
      <div className="space-y-2">
        <Label className={errors.roomTypeId ? "text-destructive" : ""}>
          Room Type <span className="text-destructive">*</span>
        </Label>

        {roomTypesData && roomTypesData.length > 0 ? (
          <div className="grid grid-cols-1 gap-3">
            {roomTypesData.map((roomType) => (
              <Card
                key={roomType._id}
                className={`border cursor-pointer transition-all ${
                  formData.roomTypeId === roomType._id
                    ? "border-primary bg-primary/5"
                    : ""
                }`}
                onClick={() => handleChange("roomTypeId", roomType._id)}
              >
                <CardContent className="p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="p-2 rounded-full bg-primary/10">
                        <Bed className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-medium">
                          {roomType.roomType.replace(/_/g, " ")}
                        </h3>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className="text-xs">
                            ₹{roomType.pricePerNight}/night
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {roomType.capacity} Person
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-center w-4 h-4 border-2 rounded-full">
                      {formData.roomTypeId === roomType._id && (
                        <div className="w-2 h-2 rounded-full bg-primary" />
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="p-4 text-center">
            <p className="text-sm text-muted-foreground">
              No room types available
            </p>
          </Card>
        )}

        {errors.roomTypeId && (
          <p className="text-sm text-destructive">{errors.roomTypeId}</p>
        )}
      </div>
    </div>
  );
};

export default memo(BasicInfoStep);
