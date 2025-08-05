import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { memo, useCallback, useState } from "react";
import { Edit, ChevronDown, MessageCircle, Send, Clock } from "lucide-react";
import { useGetFlows } from "@/hooks/useWhatsappFlows";
import { useWhatsappTempStore } from "@/components/store/useWhatsappTempStore";
import LoadingSpinner from "@/components/atom/loadingSpinner";
import {
  flowOptions,
  formatTriggerTime,
} from "@/components/helpers/whatzAppHelpers";

const MemoWhatsappFlowSection = () => {
  const { flowsData, flowsLoading } = useGetFlows();
  const { setCreateEditFlow, setSelectedFlowType, setEditFlowObject } =
    useWhatsappTempStore((s) => ({
      setCreateEditFlow: s.setCreateEditFlow,
      setSelectedFlowType: s.setSelectedFlowType,
      setEditFlowObject: s.setEditFlowObject,
    }));

  const [showDropdown, setShowDropdown] = useState(false);

  const handleCreateEditFlow = useCallback(
    (flowType: string) => {
      setSelectedFlowType(flowType);
      setCreateEditFlow(true);
      setShowDropdown(false);
      setEditFlowObject(null);
    },
    [setCreateEditFlow, setSelectedFlowType, setEditFlowObject],
  );

  const handleEditFlow = useCallback(
    (flow) => {
      setSelectedFlowType(flow?.name);
      setCreateEditFlow(true);
      setEditFlowObject(flow);
    },
    [setCreateEditFlow, setSelectedFlowType, setEditFlowObject],
  );

  const isOptionDisabled = useCallback(
    (flowType) => {
      return flowsData?.some((flow) => flow.name === flowType);
    },
    [flowsData],
  );

  if (flowsLoading) {
    return <LoadingSpinner />;
  }

  return (
    <section className="min-h-screen bg-background p-4">
      <article className="mb-4 flex justify-between items-center">
        <aside>
          <h2 className="text-2xl font-semibold tracking-tight">
            WhatsApp Flows
          </h2>
          <p className="hidden md:flex text-sm text-muted-foreground mt-1">
            Automate your WhatsApp messages with timed message templates
          </p>
        </aside>
        <div className="relative">
          <button
            type="button"
            className="flex items-center gap-2 px-4 py-2 text-white bg-blue-600 rounded-lg shadow-lg hover:bg-blue-500 on_active_bounce"
            onClick={() => setShowDropdown((prev) => !prev)}
          >
            + Create Flow <ChevronDown className="w-4 h-4" />
          </button>
          {showDropdown && (
            <article className="absolute right-0 mt-2 w-48 z-50 bg-white border border-gray-300 rounded-md shadow-lg">
              {flowOptions.map((option) => (
                <button
                  type="button"
                  key={option.id}
                  disabled={isOptionDisabled(option.id)}
                  className="disabled:cursor-not-allowed block w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-100"
                  onClick={() => handleCreateEditFlow(option.id)}
                >
                  {option.label}
                </button>
              ))}
            </article>
          )}
        </div>
      </article>
      <section className="grid gap-4">
        {flowsData?.map((flow) => (
          <Card key={flow._id} className="relative group overflow-hidden">
            <CardHeader className="!p-4 mt-2">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{flow.name}</CardTitle>
                  <CardDescription className="mt-1.5 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#25d366]" />
                    {flow.description ||
                      "This flow triggers on the day customer scans."}
                  </CardDescription>
                </div>
                <article className="absolute right-0 top-0 bg-[#25d366] px-2 text-white rounded-b-sm">
                  {flow.status ? "Active" : "Inactive"}
                </article>
                <article
                  onKeyDown={() => handleEditFlow(flow)}
                  onClick={() => handleEditFlow(flow)}
                  className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                >
                  <Edit className="h-5 w-5 text-[#075E54]" />
                </article>
              </div>
            </CardHeader>
            <CardContent className="!p-4">
              <div className="relative pl-6 before:absolute before:left-[11px] before:top-0 before:bottom-4 before:w-0.5 before:bg-[#25d366]/20">
                {flow?.flows.map((template, index) => (
                  <div
                    key={index?.toString()}
                    className="relative mb-8 last:mb-0"
                  >
                    {/* Template node and content */}
                    <div className="relative">
                      {/* Timeline node */}
                      <div className="absolute -left-6 flex items-center justify-center">
                        <div className="w-5 h-5 rounded-full bg-[#DCF8C6] border-2 border-[#25d366] flex items-center justify-center text-xs font-medium text-[#075E54]">
                          {index + 1}
                        </div>
                      </div>

                      {/* Template content */}
                      <div className="bg-[#DCF8C6]/30 rounded-lg p-4 space-y-3">
                        {/* Action description */}
                        <div className="flex items-start gap-2 text-[#075E54]">
                          <MessageCircle className="h-4 w-4 mt-1 shrink-0" />
                          <div className="text-sm">
                            <span className="font-medium">Action:</span> This
                            message triggers to send {"customer communication"}
                          </div>
                        </div>

                        {/* Template name with WhatsApp icon */}
                        <div className="flex items-center gap-2 bg-white/50 p-2 rounded-lg">
                          <div className="w-8 h-8 rounded-full bg-[#25d366] flex items-center justify-center">
                            <Send className="h-4 w-4 text-white" />
                          </div>
                          <div>
                            <div className="font-medium text-[#075E54]">
                              {template.templateName}
                            </div>
                            <div className="text-xs text-[#128C7E]">
                              WhatsApp Template Message
                            </div>
                          </div>
                        </div>

                        {/* Timing information */}
                        <div className="flex items-center gap-2 text-sm text-[#128C7E] bg-white/50 px-3 py-2 rounded-full">
                          <Clock className="h-4 w-4" />
                          <span>
                            Sends after{" "}
                            {formatTriggerTime(template.triggerAt, flow?.name)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Flow completion indicator */}
              <div className="mt-2 flex items-center gap-2 text-sm text-[#128C7E] justify-center">
                <div className="w-2 h-2 rounded-full bg-[#25d366]" />
                Flow Complete
              </div>
            </CardContent>
          </Card>
        ))}
      </section>
    </section>
  );
};

const WhatsappFlowSection = memo(MemoWhatsappFlowSection);
export default WhatsappFlowSection;
