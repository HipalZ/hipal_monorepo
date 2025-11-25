import { VariableDropdown } from '@/components/templates/whatsappTemplates/chatbots/variableDropDown';
import DeleteButton from '@/components/templates/whatsappTemplates/deleteButton';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/components/utils/helper';
import { Handle, Position } from '@xyflow/react';
import { ChevronDown, Diamond, MessageCircle, Plus, X } from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';

export function CondNode({ data, selected }) {
  const logic = data.meta?.logic || [];
  const variables = data.variables || [];
  const flowParams = variables.map((v) => `@${v}`);
  const hasLogic = logic.length > 0;
  const [expanded, setExpanded] = useState(false);

  const updateLogic = (i, patch) => {
    const updated = logic.map((l, idx) => (idx === i ? { ...l, ...patch } : l));
    data.onPatch({ meta: { ...data.meta, logic: updated } });
  };

  const addCondition = () => {
    if (variables.length === 0 && flowParams.length === 0) return toast.error('Please add variables in previous nodes to set conditions.');
    const defaultVar = variables[0] || flowParams[0];
    data.onPatch({
      meta: {
        ...data.meta,
        logic: [...logic, { var: defaultVar, op: 'eq', value: '' }],
      },
    });
  };

  const removeCondition = (i) => {
    const updated = logic.filter((_, j) => j !== i);
    data.onPatch({ meta: { ...data.meta, logic: updated } });
  };

  // Fixed preview to display flow params as-is and custom vars as {{var}}
  const formatVarForPreview = (varName) => {
    if (flowParams.includes(varName)) return varName;
    if (variables.includes(varName)) return `{{${varName}}}`;
    return varName;
  };

  const conditionPreview = hasLogic
    ? logic.map((l, i) => `${i === 0 ? 'IF' : 'AND'} ${formatVarForPreview(l.var)} ${l.op} "${l.value || '...'}"`).join('\n')
    : 'No conditions set';

  return (
    <div className="relative">
      <Handle type="target" position={Position.Left} className="z-50 !h-[0.9rem] !w-[0.9rem] rounded-full border-2 border-amber-400 bg-amber-500" />
      <Card
        className={cn(
          'group relative w-96 overflow-hidden rounded-xl border bg-white shadow-md transition-all',
          selected ? 'border-2 border-amber-500 shadow-2xl ring-2 ring-amber-500/30' : 'border-amber-300 hover:border-amber-400 hover:shadow-lg',
        )}
      >
        <div className="relative bg-amber-500 p-4 text-white shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="rounded-lg bg-white/20 p-1.5">
                <MessageCircle className="h-4 w-4" />
              </div>
              <h3 className="text-base font-semibold tracking-tight">Condition</h3>
            </div>
          </div>
        </div>
        <div className="relative z-10 p-4 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 transform items-center justify-center rounded-full bg-gradient-to-r from-amber-400 to-amber-600 shadow-lg transition-transform group-hover:rotate-12">
            <Diamond className="h-6 w-6 text-white" />
          </div>
          <h3 className="mb-1 text-sm font-bold text-amber-800">Condition</h3>
          <p className="text-xs text-amber-600">Branch your flow</p>
        </div>

        <CardContent className="relative z-10 space-y-3 px-4 pb-4">
          {hasLogic ? (
            <div className="space-y-3">
              <Button variant="ghost" size="sm" className="w-full justify-between text-amber-700" onClick={() => setExpanded(!expanded)}>
                <span className="text-xs">Preview Logic</span>
                <ChevronDown className={`h-3 w-3 transition-transform ${expanded ? 'rotate-180' : ''}`} />
              </Button>
              <div className="max-h-24 overflow-y-auto rounded-lg border border-amber-200 bg-white/80 p-3">
                <code className="block whitespace-pre-wrap font-mono text-xs text-amber-800">{conditionPreview}</code>
              </div>
              <div className="space-y-2">
                {logic.map((l, i) => (
                  <div key={i} className="rounded-lg border border-amber-200 bg-white/70 p-2 shadow-sm">
                    <div className="flex items-center justify-between">
                      <Badge variant="secondary" className="bg-blue-500 text-[10px] text-white">
                        {i === 0 ? 'IF' : 'AND'}
                      </Badge>
                      <Button variant="ghost" size="sm" onClick={() => removeCondition(i)} className="h-6 w-6 p-0 text-red-500 hover:bg-red-50">
                        <X className="h-3 w-3" />
                      </Button>
                    </div>

                    <div className="mt-2 grid grid-cols-3 gap-2">
                      <VariableDropdown
                        value={l.var}
                        onChange={(val) => updateLogic(i, { var: val })}
                        variables={variables} // Non-prefixed for custom
                        flowParams={flowParams} // @ prefixed for stored
                        placeholder="Select var"
                      />

                      <select
                        value={l.op}
                        onChange={(e) => updateLogic(i, { op: e.target.value })}
                        className="rounded border border-gray-300 px-2 py-1 text-xs"
                      >
                        <option value="exists">exists</option>
                        <option value="eq">equals</option>
                        <option value="ne">not equals</option>
                        <option value="gt">greater than</option>
                        <option value="lt">less than</option>
                        <option value="contains">contains</option>
                      </select>

                      <input
                        type="text"
                        value={l.value}
                        onChange={(e) => updateLogic(i, { value: e.target.value })}
                        placeholder="value"
                        className="rounded border border-gray-300 px-2 py-1 text-xs"
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* Add condition button */}
              <Button variant="outline" onClick={addCondition} className="w-full border-amber-300 bg-blue-500 text-white">
                <Plus className="mr-1 h-3 w-3" /> Add Condition
              </Button>

              {/* True / False path badges */}
              <div className="flex gap-2 pt-2">
                <div className="flex items-center">
                  <div className="mr-1 h-3 w-3 rounded-full bg-green-500" />
                  <span className="text-green-800">True</span>
                </div>
                <div className="flex items-center">
                  <div className="mr-1 h-3 w-3 rounded-full bg-red-500" />
                  <span className="text-red-800">False</span>
                </div>
              </div>
            </div>
          ) : (
            // No conditions yet
            <div className="py-4 text-center">
              <p className="mb-2 text-xs italic text-amber-500">No conditions yet</p>
              <Button variant="outline" onClick={addCondition} className="w-full border-amber-300 text-amber-700 hover:bg-amber-100">
                <Plus className="mr-1 h-3 w-3" /> Add Condition
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
      <DeleteButton data={data} />
      {/* True Path Handle (Right - Top) */}
      <Handle
        id="true"
        type="source"
        position={Position.Right}
        className="!h-[0.9rem] !w-[0.9rem] rounded-full border-2 border-green-500 !bg-green-400"
        style={{ top: '30%' }}
      />

      {/* False Path Handle (Right - Bottom) */}
      <Handle
        id="false"
        type="source"
        position={Position.Right}
        className="!h-[0.9rem] !w-[0.9rem] rounded-full border-2 border-red-500 !bg-red-400"
        style={{ top: '70%' }}
      />
    </div>
  );
}
