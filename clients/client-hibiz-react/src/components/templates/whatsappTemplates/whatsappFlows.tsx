import LoadingSpinner from '@/components/atom/loadingSpinner';
import { flowOptions, formatTriggerTime } from '@/components/helpers/whatzAppHelpers';
import { useWhatsappTempStore } from '@/components/store/useWhatsappTempStore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useGetFlows } from '@/hooks/useWhatsappFlows';
import { ChevronDown, Clock, Edit, MessageCircle, Send } from 'lucide-react';
import { memo, useCallback, useState } from 'react';

const MemoWhatsappFlowSection = () => {
  const { flowsData, flowsLoading } = useGetFlows();
  const setFlowBuilderOpen = useWhatsappTempStore((s) => s.setFlowBuilderOpen);
  const setCreateEditFlow = useWhatsappTempStore((s) => s.setCreateEditFlow);
  const setSelectedFlowType = useWhatsappTempStore((s) => s.setSelectedFlowType);
  const setEditFlowObject = useWhatsappTempStore((s) => s.setEditFlowObject);

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
    <section className="bg-background min-h-screen p-4">
      <article className="mb-4 flex items-center justify-between">
        <aside>
          <h2 className="text-2xl font-semibold tracking-tight">WhatsApp Flows</h2>
          <p className="text-muted-foreground mt-1 hidden text-sm md:flex">Automate your WhatsApp messages with timed message templates</p>
        </aside>
        <div className="relative flex gap-2">
          <button
            type="button"
            className="on_active_bounce flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white shadow-lg hover:bg-blue-500"
            onClick={() => setShowDropdown((prev) => !prev)}
          >
            + Create Flow <ChevronDown className="h-4 w-4" />
          </button>
          <Button variant="outline" onClick={() => setFlowBuilderOpen(false)} className="ml-2">
            Back
          </Button>
          {showDropdown && (
            <article className="absolute right-0 z-50 mt-2 w-48 rounded-md border border-gray-300 bg-white shadow-lg">
              {flowOptions.map((option) => (
                <button
                  type="button"
                  key={option.id}
                  disabled={isOptionDisabled(option.id)}
                  className="block w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-100 disabled:cursor-not-allowed"
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
          <Card key={flow._id} className="group relative overflow-hidden">
            <CardHeader className="mt-2 !p-4">
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg">{flow.name}</CardTitle>
                  <CardDescription className="mt-1.5 flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-[#25d366]" />
                    {flow.description || 'This flow triggers on the day customer scans.'}
                  </CardDescription>
                </div>
                <article className="absolute right-0 top-0 rounded-b-sm bg-[#25d366] px-2 text-white">{flow.status ? 'Active' : 'Inactive'}</article>
                <article
                  onKeyDown={() => handleEditFlow(flow)}
                  onClick={() => handleEditFlow(flow)}
                  className="rounded-full p-2 transition-colors hover:bg-gray-100"
                >
                  <Edit className="h-5 w-5 text-[#075E54]" />
                </article>
              </div>
            </CardHeader>
            <CardContent className="!p-4">
              <div className="relative pl-6 before:absolute before:bottom-4 before:left-[11px] before:top-0 before:w-0.5 before:bg-[#25d366]/20">
                {flow?.flows.map((template, index) => (
                  <div key={index?.toString()} className="relative mb-8 last:mb-0">
                    {/* Template node and content */}
                    <div className="relative">
                      {/* Timeline node */}
                      <div className="absolute -left-6 flex items-center justify-center">
                        <div className="flex h-5 w-5 items-center justify-center rounded-full border-2 border-[#25d366] bg-[#DCF8C6] text-xs font-medium text-[#075E54]">
                          {index + 1}
                        </div>
                      </div>

                      {/* Template content */}
                      <div className="space-y-3 rounded-lg bg-[#DCF8C6]/30 p-4">
                        {/* Action description */}
                        <div className="flex items-start gap-2 text-[#075E54]">
                          <MessageCircle className="mt-1 h-4 w-4 shrink-0" />
                          <div className="text-sm">
                            <span className="font-medium">Action:</span> This message triggers to send {'customer communication'}
                          </div>
                        </div>

                        {/* Template name with WhatsApp icon */}
                        <div className="flex items-center gap-2 rounded-lg bg-white/50 p-2">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#25d366]">
                            <Send className="h-4 w-4 text-white" />
                          </div>
                          <div>
                            <div className="font-medium text-[#075E54]">{template.templateName}</div>
                            <div className="text-xs text-[#128C7E]">WhatsApp Template Message</div>
                          </div>
                        </div>

                        {/* Timing information */}
                        <div className="flex items-center gap-2 rounded-full bg-white/50 px-3 py-2 text-sm text-[#128C7E]">
                          <Clock className="h-4 w-4" />
                          <span>Sends after {formatTriggerTime(template.triggerAt, flow?.name)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Flow completion indicator */}
              <div className="mt-2 flex items-center justify-center gap-2 text-sm text-[#128C7E]">
                <div className="h-2 w-2 rounded-full bg-[#25d366]" />
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
