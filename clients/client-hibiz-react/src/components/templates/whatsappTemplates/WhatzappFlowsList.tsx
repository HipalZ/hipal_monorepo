import { useGetFlows } from "@/components/helpers/whatzAppHelpers";
import { Button } from "@/components/ui/button";
import { usePublishFlow } from "@/hooks/useWhatsappFlows";

const WhatzappFlowsList = () => {
  const { flows, isLoading, error } = useGetFlows();
  const { publishFlow } = usePublishFlow();

  if (isLoading) {
    return <p className="p-4 text-gray-500">Loading flows...</p>;
  }

  if (error) {
    return (
      <div className="p-4 text-red-600">
        Failed to load flows: {(error as Error).message}
      </div>
    );
  }

  if (!flows || flows.length === 0) {
    return (
      <div className="p-4 text-gray-600">
        No WhatsApp flows found. Start by creating one!
      </div>
    );
  }

  return (
    <div className="overflow-x-auto p-4 bg-white rounded-lg shadow">
      <h2 className="text-xl font-semibold mb-4 text-gray-800">
        WhatsApp Flows List
      </h2>
      <article className="overflow-y-auto max-h-[400px]">
        <table className="min-w-full text-sm text-left text-gray-700">
          <thead className="text-xs uppercase bg-gray-100 border-b border-gray-300">
            <tr>
              <th className="px-4 py-3">Flow Name</th>
              <th className="px-4 py-3">Flow ID</th>
              <th className="px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {flows.map((flow: any, idx: number) => (
              <tr
                key={flow.id}
                className={idx % 2 === 0 ? "bg-white" : "bg-gray-50"}
              >
                <td className="px-4 py-3 font-medium">{flow.name}</td>
                <td className="px-4 py-3">{flow.id}</td>
                <td className="px-4 py-3 capitalize flex items-center gap-2">
                  <span>{flow.status}</span>
                  {flow.status === "DRAFT" && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-xs px-2 py-1 text-blue-500 border-none hover:underline"
                      onClick={() => publishFlow.mutate(flow.id)}
                      disabled={publishFlow.isPending}
                    >
                      {publishFlow.isPending ? "..." : "Publish"}
                    </Button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </article>
    </div>
  );
};

export default WhatzappFlowsList;
