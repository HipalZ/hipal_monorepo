import type {
  IServiceCategory,
  IServicePayload,
} from "@/components/store/hotel/useHotelServices";
import BirthdayImageUploader from "@/components/templates/events/birthdayImage";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { ImageIcon, Plus, Trash2 } from "lucide-react";

interface ServiceFormProps {
  handleCreateService: (e: React.FormEvent<HTMLFormElement>) => void;
  serviceForm: IServicePayload;
  setServiceForm: React.Dispatch<React.SetStateAction<any>>;
  errors: Record<string, string>;
  uploadImage: (
    url: string,
    setServiceForm: React.Dispatch<React.SetStateAction<any>>,
  ) => void;
  addServiceLoader: boolean;
  categories: IServiceCategory[];
}

const ServiceForm = ({
  handleCreateService,
  serviceForm,
  setServiceForm,
  errors,
  uploadImage,
  addServiceLoader,
  categories,
}: ServiceFormProps) => {
  const serviceBehavior = serviceForm.serviceBehavior ?? {
    instructionEnabled: false,
    instruction: "",
    instructionRules: [],
  };

  const updateBehavior = (nextBehavior: Partial<typeof serviceBehavior>) => {
    setServiceForm((prev: IServicePayload) => ({
      ...prev,
      serviceBehavior: {
        instructionEnabled: false,
        instruction: "",
        instructionRules: [],
        ...(prev.serviceBehavior ?? {}),
        ...nextBehavior,
      },
    }));
  };

  const setRequestTime = (value: string) => {
    const minutes = Number(value);
    setServiceForm((prev: IServicePayload) => ({
      ...prev,
      avgAcceptanceTime: Number.isFinite(minutes) && minutes > 0 ? minutes : undefined,
    }));
  };

  const setResponseTime = (value: string) => {
    const minutes = Number(value);
    setServiceForm((prev: IServicePayload) => ({
      ...prev,
      avgCompletionTime: Number.isFinite(minutes) && minutes > 0 ? minutes : undefined,
      avgDeliveryTime: Number.isFinite(minutes) && minutes > 0 ? minutes : undefined,
    }));
  };

  const setQuantityLimit = (value: string) => {
    const quantityLimit = Number(value);
    setServiceForm((prev: IServicePayload) => ({
      ...prev,
      quantityLimit: Number.isInteger(quantityLimit) && quantityLimit > 0 ? quantityLimit : undefined,
    }));
  };

  const addInstructionRule = () => {
    updateBehavior({
      instructionEnabled: true,
      instructionRules: [
        ...(serviceBehavior.instructionRules ?? []),
        {
          condition: "BEFORE_TIME",
          time: "09:00",
          message: "",
        },
      ],
    });
  };

  const updateInstructionRule = (index: number, field: "condition" | "time" | "message", value: string) => {
    updateBehavior({
      instructionRules: (serviceBehavior.instructionRules ?? []).map((rule, ruleIndex) =>
        ruleIndex === index ? { ...rule, [field]: value } : rule,
      ),
    });
  };

  const removeInstructionRule = (index: number) => {
    updateBehavior({
      instructionRules: (serviceBehavior.instructionRules ?? []).filter((_, ruleIndex) => ruleIndex !== index),
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <ImageIcon className="w-5 h-5" />
          Create Services
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleCreateService} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="category-name">Service Name *</Label>
            <Input
              id="category-name"
              placeholder="e.g., AC Services, Plumbing, Electrical"
              value={serviceForm.name}
              onChange={(e) =>
                setServiceForm((prev) => ({
                  ...prev,
                  name: e.target.value?.trimStart(),
                }))
              }
              className={errors.serviceName ? "border-red-500" : ""}
            />
            {errors.serviceName && (
              <p className="text-sm text-red-500">{errors.serviceName}</p>
            )}
          </div>

          <section className="space-y-2">
            <Label htmlFor="service-image">Service Image (Optional)</Label>
            <article className="flex gap-3">
              <BirthdayImageUploader
                image={""}
                onUploadSuccess={(url) => uploadImage(url, setServiceForm)}
              />
            </article>
          </section>
          <section className="space-y-2">
            <Label htmlFor="service-category">Link Category *</Label>
            <select
              id="service-category"
              value={serviceForm.categoryId}
              onChange={(e) => {
                const selectedCategoryId = e.target.value;
                setServiceForm((prev) => ({
                  ...prev,
                  categoryId: selectedCategoryId,
                }));
              }}
              className={`w-full border rounded px-3 py-2 ${
                errors.categoryId ? "border-red-500" : ""
              }`}
            >
              <option value="">Select a category</option>
              {categories.map((cat) => (
                <option key={cat._id} value={cat._id}>
                  {cat.name} {/* Display category name */}
                </option>
              ))}
            </select>
            {serviceForm.categoryId && (
              <div className="mt-2 text-sm text-muted-foreground">
                Selected Category:{" "}
                {
                  categories.find((cat) => cat._id === serviceForm.categoryId)
                    ?.name
                }
              </div>
            )}
            {errors.categoryId && (
              <p className="text-sm text-red-500">{errors.categoryId}</p>
            )}
          </section>
          <section className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="request-time">Request Time *</Label>
              <Input
                id="request-time"
                type="number"
                min={0.01}
                step={0.01}
                placeholder="e.g., 2"
                value={serviceForm.avgAcceptanceTime ?? ""}
                onChange={(e) => setRequestTime(e.target.value)}
                className={errors.requestTime ? "border-red-500" : ""}
              />
              <p className="text-xs text-muted-foreground">Time to accept the guest request, in minutes.</p>
              {errors.requestTime && <p className="text-sm text-red-500">{errors.requestTime}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="response-time">Response Time *</Label>
              <Input
                id="response-time"
                type="number"
                min={0.01}
                step={0.01}
                placeholder="e.g., 30"
                value={serviceForm.avgDeliveryTime ?? serviceForm.avgCompletionTime ?? ""}
                onChange={(e) => setResponseTime(e.target.value)}
                className={errors.responseTime ? "border-red-500" : ""}
              />
              <p className="text-xs text-muted-foreground">Time to fulfill after staff accepts, in minutes.</p>
              {errors.responseTime && <p className="text-sm text-red-500">{errors.responseTime}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="quantity-limit">Quantity Limit *</Label>
              <Input
                id="quantity-limit"
                type="number"
                min={1}
                max={20}
                step={1}
                placeholder="e.g., 4"
                value={serviceForm.quantityLimit ?? 1}
                onChange={(e) => setQuantityLimit(e.target.value)}
                className={errors.quantityLimit ? "border-red-500" : ""}
              />
              <p className="text-xs text-muted-foreground">1 keeps direct request. 2-20 shows quantity controls.</p>
              {errors.quantityLimit && <p className="text-sm text-red-500">{errors.quantityLimit}</p>}
            </div>
          </section>
          <section className="space-y-3 rounded-lg border bg-slate-50 p-3">
            <div className="flex items-center justify-between gap-3">
              <div>
                <Label className="text-sm font-medium">Customer Instruction</Label>
                <p className="text-xs text-muted-foreground">Show dynamic information before the guest confirms this service.</p>
              </div>
              <Switch
                checked={Boolean(serviceBehavior.instructionEnabled)}
                onCheckedChange={(checked) =>
                  updateBehavior({
                    instructionEnabled: checked,
                  })
                }
              />
            </div>

            {serviceBehavior.instructionEnabled && (
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <Label htmlFor="service-instruction" className="text-xs">
                    General message
                  </Label>
                  <Textarea
                    id="service-instruction"
                    maxLength={240}
                    rows={3}
                    placeholder="Example: Laundry pickup will be returned based on the selected time window."
                    value={serviceBehavior.instruction ?? ""}
                    onChange={(e) => updateBehavior({ instruction: e.target.value })}
                  />
                  <p className="text-right text-[11px] text-muted-foreground">{(serviceBehavior.instruction ?? "").length}/240</p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs">Time-based messages</Label>
                    <Button type="button" variant="outline" size="sm" onClick={addInstructionRule} disabled={(serviceBehavior.instructionRules ?? []).length >= 4}>
                      Add Rule
                    </Button>
                  </div>
                  {(serviceBehavior.instructionRules ?? []).map((rule, index) => (
                    <div key={`${rule.condition}-${index}`} className="grid gap-2 rounded-md border bg-white p-2 md:grid-cols-[8rem_7rem_1fr_auto]">
                      <select
                        value={rule.condition}
                        onChange={(e) => updateInstructionRule(index, "condition", e.target.value)}
                        className="h-9 rounded-md border px-2 text-sm"
                      >
                        <option value="BEFORE_TIME">Before</option>
                        <option value="AFTER_TIME">After</option>
                      </select>
                      <Input type="time" value={rule.time} onChange={(e) => updateInstructionRule(index, "time", e.target.value)} className="h-9" />
                      <Input
                        value={rule.message}
                        maxLength={240}
                        placeholder="Example: Delivery today evening"
                        onChange={(e) => updateInstructionRule(index, "message", e.target.value)}
                        className="h-9"
                      />
                      <Button type="button" variant="ghost" size="icon" onClick={() => removeInstructionRule(index)} className="h-9 w-9">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {errors.serviceInstruction && <p className="text-sm text-red-500">{errors.serviceInstruction}</p>}
          </section>
          <Button type="submit" className="w-full" disabled={addServiceLoader}>
            <Plus className="w-4 h-4 mr-2" />
            Create Service
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default ServiceForm;
