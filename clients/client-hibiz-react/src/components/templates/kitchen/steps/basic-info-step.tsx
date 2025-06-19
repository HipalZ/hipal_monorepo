import { memo } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { FileText, Sparkles } from "lucide-react";

interface BasicInfoStepProps {
  formData: {
    name: string;
    description: string;
  };
  updateFormData: (
    updates: Partial<{ name: string; description: string }>,
  ) => void;
}

function BasicInfoStepComponent({
  formData,
  updateFormData,
}: BasicInfoStepProps) {
  return (
    <div className="flex flex-col gap-4 md:gap-6 md:flex-row w-full mb-4">
      <div className="flex-1 w-full">
        <Label
          htmlFor="kitchen-name"
          className="text-gray-700 font-medium flex items-center gap-2"
        >
          <Sparkles className="w-4 h-4 text-yellow-500" />
          Kitchen Name <span className="text-red-500">*</span>
        </Label>
        <Input
          id="kitchen-name"
          value={formData.name}
          onChange={(e) => updateFormData({ name: e.target.value })}
          placeholder="e.g., Main Prep Station, Grill Kitchen, Dessert Corner"
          className="mt-2 h-12 text-lg border-2 focus:border-primary transition-colors"
        />
      </div>
      <div className="flex-1 w-full">
        <Label
          htmlFor="kitchen-description"
          className="text-gray-700 font-medium flex items-center gap-2"
        >
          <FileText className="w-4 h-4 text-blue-500" />
          Description
        </Label>
        <Textarea
          id="kitchen-description"
          value={formData.description}
          onChange={(e) => updateFormData({ description: e.target.value })}
          placeholder="Describe the kitchen's purpose, location, or special features..."
          className="mt-2 border-2 focus:border-primary transition-colors resize-none"
          rows={4}
        />
      </div>
    </div>
  );
}

export default memo(BasicInfoStepComponent);
