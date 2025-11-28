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
import type { ConditionJoin, ConditionRow, CondNodeData } from './types';

export function CondNode({ data, selected }: { data: CondNodeData; selected: boolean }) {
  const logic: ConditionRow[] = data.meta?.logic || [];
  const variables = data.variables || [];
  const flowParams = variables.map((v) => `@${v}`);

  const hasLogic = logic.length > 0;
  const [expanded, setExpanded] = useState(false);

  /** 🔄 Update a condition row */
  const updateLogic = (index: number, patch: Partial<ConditionRow>) => {
    const updated = logic.map((row, i) => (i === index ? { ...row, ...patch } : row));
    data.onPatch({ meta: { ...data.meta, logic: updated } });
  };

  /** ➕ Add new condition */
  const addCondition = () => {
    if (variables.length === 0) return toast.error('Please add variables in previous nodes to use conditions.');

    const defaultVar = variables[0] || flowParams[0];

    const newCondition: ConditionRow = {
      join: logic.length === 0 ? 'if' : 'and', // first = IF, rest = AND
      var: defaultVar,
      op: 'eq',
      value: '',
    };

    data.onPatch({
      meta: { ...data.meta, logic: [...logic, newCondition] },
    });
  };

  /** ❌ Remove condition */
  const removeCondition = (index: number) => {
    const updated = logic.filter((_, i) => i !== index);
    data.onPatch({ meta: { ...data.meta, logic: updated } });
  };

  /** 🔍 Correct preview formatter */
  const formatVar = (v: string) => {
    if (flowParams.includes(v)) return v;
    if (variables.includes(v)) return `{{${v}}}`;
    return v;
  };

  const conditionPreview = hasLogic
    ? logic.map((l) => `${l.join.toUpperCase()} ${formatVar(l.var)} ${l.op} "${l.value || '…'}"`).join('\n')
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
          <div className="flex items-center gap-2">
            <div className="rounded-lg bg-white/20 p-1.5">
              <MessageCircle className="h-4 w-4" />
            </div>
            <h3 className="text-base font-semibold tracking-tight">Condition</h3>
          </div>
        </div>

        <div className="p-4 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-r from-amber-400 to-amber-600 shadow-lg">
            <Diamond className="h-6 w-6 text-white" />
          </div>
          <h3 className="text-sm font-bold text-amber-800">Branch Logic</h3>
          <p className="text-xs text-amber-600">Create logical branches</p>
        </div>

        <CardContent className="space-y-3 px-4 pb-4">
          {hasLogic ? (
            <>
              {/* Preview */}
              <Button variant="ghost" size="sm" className="w-full justify-between text-amber-700" onClick={() => setExpanded(!expanded)}>
                <span className="text-xs">Preview Logic</span>
                <ChevronDown
                  className={cn('h-3 w-3 transition-transform', {
                    'rotate-180': expanded,
                  })}
                />
              </Button>

              {expanded && (
                <div className="max-h-24 overflow-y-auto rounded-lg border border-amber-200 bg-white p-3">
                  <code className="block whitespace-pre-wrap font-mono text-xs text-amber-800">{conditionPreview}</code>
                </div>
              )}

              {/* Conditions */}
              {logic.map((row, i) => (
                <div key={i} className="rounded-lg border border-amber-200 bg-white p-2 shadow-sm">
                  <div className="flex items-center justify-between">
                    {/* JOIN Select */}
                    {i === 0 ? (
                      <Badge className="bg-blue-600 text-[10px] text-white">IF</Badge>
                    ) : (
                      <select
                        value={row.join}
                        onChange={(e) =>
                          updateLogic(i, {
                            join: e.target.value as ConditionJoin,
                          })
                        }
                        className="rounded border border-gray-300 px-1 py-0.5 text-[10px]"
                      >
                        <option value="and">AND</option>
                        <option value="or">OR</option>
                      </select>
                    )}

                    <Button variant="ghost" size="sm" onClick={() => removeCondition(i)} className="h-6 w-6 p-0 text-red-500 hover:bg-red-50">
                      <X className="h-3 w-3" />
                    </Button>
                  </div>

                  {/* Row Inputs */}
                  <div className="mt-2 grid grid-cols-3 gap-2">
                    <VariableDropdown
                      value={row.var}
                      onChange={(v) => updateLogic(i, { var: v })}
                      variables={variables}
                      flowParams={flowParams}
                      placeholder="Select var"
                    />

                    <select
                      value={row.op}
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
                      value={row.value}
                      onChange={(e) => updateLogic(i, { value: e.target.value })}
                      placeholder="value"
                      className="rounded border border-gray-300 px-2 py-1 text-xs"
                    />
                  </div>
                </div>
              ))}

              <Button variant="outline" onClick={addCondition} className="w-full border-amber-300 bg-blue-500 text-white">
                <Plus className="mr-1 h-3 w-3" /> Add Condition
              </Button>

              {/* True/false paths */}
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
            </>
          ) : (
            /** No conditions added **/
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

      {/* True */}
      <Handle
        id="true"
        type="source"
        position={Position.Right}
        className="!h-[0.9rem] !w-[0.9rem] rounded-full border-2 border-green-500 !bg-green-400"
        style={{ top: '30%' }}
      />

      {/* False */}
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
