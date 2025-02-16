import { useCallback, useMemo, useState } from "react";
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
    MessageCircle,
    Plus,
    Clock,
    Scan,
    QrCodeIcon as ScanQrCode,
    ArrowBigDownDash,
} from "lucide-react";
import BottomButton from "@/components/atom/bottomButton"
import { useWhatsappTempStore } from "@/components/store/useWhatsappTempStore"
import { formatTriggerTime, ISelectedFlowType } from "@/components/helpers/whatzAppHelpers"
import useBusinessData from "@/components/store/useBusinessData"
import { apiRpc } from "@hi/common"
import toast from "react-hot-toast"
import { useMutation } from "@tanstack/react-query";
import type { WhatsAppFlowType } from "@hi/db-models/src/validators";

type FlowStep = {
    templateName: string
    templateId: string
    triggerAt: number
}

export default function WhatsAppFlowBuilder() {
    const { allTemplates, selectedFlowType, setselectedFlowType, editFlowObject } = useWhatsappTempStore((s) => ({
        allTemplates: s.allTemplates,
        selectedFlowType: s.selectedFlowType,
        setselectedFlowType: s.setSelectedFlowType,
        editFlowObject: s.editFlowObject,
    }))
    const businessId = useBusinessData((s) => s.businessData?._id)
    const initialSteps = useMemo<FlowStep[]>(() => {
        if (editFlowObject?.flows) {
            return editFlowObject.flows.map((flow) => ({
                templateName: flow.templateName,
                templateId: flow.templateId,
                triggerAt: flow.triggerAt,
            }));
        }
        return [];
    }, [editFlowObject]);
    const [steps, setSteps] = useState<FlowStep[]>(initialSteps)
    const [selectedTemplateId, setSelectedTemplateId] = useState<string>("")
    const [selectedTemplateName, setSelectedTemplateName] = useState<string>("");
    const [triggerTime, setTriggerTime] = useState<string>("")

    const isStepLimitReached = useCallback(() => {
        if (selectedFlowType === ISelectedFlowType.COME_BACK || selectedFlowType === ISelectedFlowType.SAME_DAY) return steps.length >= 4
        if (selectedFlowType === ISelectedFlowType.SCAN) return steps.length >= 1
        return false
    }, [selectedFlowType, steps.length])

    const addStep = useCallback(() => {
        if (selectedTemplateId && triggerTime) {
            const newStep: FlowStep = {
                templateName: selectedTemplateName,
                templateId: selectedTemplateId,
                triggerAt: selectedFlowType === ISelectedFlowType.COME_BACK ? Number(triggerTime) * 24 * 60 * 60 * 1000 : Number(triggerTime) * 60 * 1000,
            }
            setSteps([...steps, newStep])
            setSelectedTemplateId("")
            setTriggerTime("")
        }
    }, [selectedTemplateId, triggerTime, selectedTemplateName, steps, selectedFlowType])

    const removeStep = useCallback((id: string) => {
        setSteps((prevSteps) => prevSteps.filter((step) => step.templateId !== id));
    }, []);

    const saveWhatzappFlow = async (payload: WhatsAppFlowType) => {
        const response = await apiRpc.whatsapp_flow.$post({
            json: payload,
        });
        if (response.status === 409) {
            toast.error("Flow already exists")
        }
        if (!response.ok) {
            throw new Error("Failed to save flow");
        }
        return response.json();
    }

    const editWhatzappFlow = async (payload: WhatsAppFlowType) => {
        const response = await apiRpc.whatsapp_flow.$put({
            json: payload,
        });
        if (!response.ok) {
            throw new Error("Failed to save flow");
        }
        return response.json();
    }

    const { mutateAsync: saveFlowMutation } = useMutation(
        {
            mutationFn: editFlowObject?._id ? editWhatzappFlow : saveWhatzappFlow,
            onSuccess: (data) => {
                toast.success(data?.message || "Flow saved successfully");
            },
            onError: (error) => {
                console.error("Error while saving flow", error);
                toast.error(data?.message || "Error while saving flow");
            },
        }
    );

    const handleSaveFlow = async () => {
        if (steps.length === 0) return toast.error("Please add at least one step to save flow");
        const payload = {
            name: selectedFlowType,
            businessId,
            status: true,
            flows: steps,
            ...(editFlowObject?._id && { flowId: editFlowObject._id }),
        };
        try {
            await saveFlowMutation(payload);
        } catch (e) {
            console.error("Error while saving flow", e);
        }
    };

    const handleSelectChange = useCallback((value: string) => {
        setTriggerTime(value);
    }, [])

    const renderTimeInput = () => {
        if (selectedFlowType === ISelectedFlowType.COME_BACK) {
            return (
                <Select value={triggerTime} onValueChange={handleSelectChange}>
                    <SelectTrigger className="w-[120px]">
                        <SelectValue placeholder="Select week" />
                    </SelectTrigger>
                    <SelectContent>
                        {[1, 2, 3, 4].map((week) => (
                            <SelectItem key={week} value={week.toString()}>
                                {week} week{week > 1 ? "s" : ""}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            )
        }
        return (
            <Input
                type="number"
                placeholder="Minutes"
                value={triggerTime}
                max={3600}
                onChange={(e) => {
                    const value = Math.min(Number(e.target.value), 3600);
                    setTriggerTime(value);
                }}
                className="w-[120px]"
                min={1}
            />
        )
    }

    return (
        <div className="container mx-auto p-3">
            <Tabs value={selectedFlowType} onValueChange={(value) => setselectedFlowType(value)} className="space-y-6">
                <h2 className="text-2xl font-semibold tracking-tight">{selectedFlowType}</h2>
                <Alert className="bg-[#DCF8C6] border-[#25D366] text-[#075E54]">
                    <AlertDescription className="flex items-center justify-between gap-2">
                        {selectedFlowType === ISelectedFlowType.SAME_DAY &&
                            "After bill settlement, these templates will be triggered in minutes. Maximum 4 templates allowed."}
                        {selectedFlowType === ISelectedFlowType.COME_BACK &&
                            "After scan, these templates will be triggered in weeks."}
                        {selectedFlowType === ISelectedFlowType.SCAN &&
                            "After scan, this template will be triggered in minutes. Only 1 template allowed."}
                        <ScanQrCode className="h-8 w-8" />
                    </AlertDescription>
                </Alert>
                <Card>
                    <section className="p-3">
                        <CardTitle className="flex items-center gap-2">
                            {selectedFlowType === ISelectedFlowType.SAME_DAY && <MessageCircle className="h-5 w-5" />}
                            {selectedFlowType === ISelectedFlowType.COME_BACK && <Clock className="h-5 w-5" />}
                            {selectedFlowType === ISelectedFlowType.SCAN && <Scan className="h-5 w-5" />}
                            Add Template
                        </CardTitle>
                    </section>
                    <section className="md:flex space-y-4 md:space-y-0 gap-4 p-3">
                        <div className="w-full space-y-2 flex-1">
                            <Label>Select Template</Label>
                            <Select value={selectedTemplateId} onValueChange={(value) => {
                                setSelectedTemplateId(value);
                                const template = allTemplates.find((t) => t.id === value);
                                setSelectedTemplateName(template?.name || "");
                            }}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Choose" />
                                </SelectTrigger>
                                <SelectContent>
                                    {allTemplates?.map((template) => (
                                        <SelectItem key={template.id} value={template.id}>
                                            {template.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <article className="flex items-end gap-4">
                            <div className="space-y-2">
                                <Label>Trigger After</Label>
                                {renderTimeInput()}
                            </div>
                            <Button
                                onClick={addStep}
                                disabled={!selectedTemplateId || !triggerTime || isStepLimitReached()}
                                className="bg-[#25D366] hover:bg-[#128C7E]"
                            >
                                <Plus className="h-4 w-4 mr-2" /> Add
                            </Button>
                        </article>
                    </section>
                </Card>
                <section className="space-y-8 pb-[5rem] relative">
                    {steps.map((step, index) => (
                        <div key={step.templateId} className="relative">
                            <CardContent className="!px-3 bg-muted/50 relative mx-auto w-[98%] border rounded-lg">
                                {/* Step number circle */}
                                <div className="absolute left-6 -top-4 -translate-x-full flex items-center">
                                    <div className="w-8 h-8 rounded-full bg-[#25D366] text-white flex items-center justify-center font-semibold">
                                        {index + 1}
                                    </div>
                                </div>
                                <article className="pt-6 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#DCF8C6]">
                                            <MessageCircle className="h-4 w-4 text-[#075E54]" />
                                        </div>
                                        <div>
                                            <p className="font-medium">{allTemplates?.find((t) => t.id === step.templateId)?.name}</p>
                                            <div className="flex items-center gap-2 mt-1">
                                                <Clock className="h-4 w-4 text-[#128C7E]" />
                                                <p className="text-sm text-[#128C7E]">
                                                    Triggers after {formatTriggerTime(step.triggerAt, selectedFlowType as ISelectedFlowType)}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="bg-red-500 hover:bg-red-400 text-white"
                                        onClick={() => removeStep(step?.templateId)}
                                    >
                                        Remove
                                    </Button>
                                </article>
                            </CardContent>
                            {/* Arrow to next step */}
                            {index < steps.length - 1 && (
                                <div className="absolute left-1/2 -bottom-10 transform -translate-x-1/2 flex items-center justify-center">
                                    <ArrowBigDownDash className="h-12 w-12 text-[#25D366]" />
                                </div>
                            )}
                        </div>
                    ))}
                </section>
            </Tabs>
            <BottomButton
                colorGrad
                fixed
                buttons={[
                    {
                        text: "Save Flow",
                        onClick: handleSaveFlow,
                        type: "button",
                    },
                ]}
            />
        </div>
    )
}

