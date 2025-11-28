import DeleteButton from '@/components/templates/whatsappTemplates/deleteButton';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/components/utils/helper';
import { Handle, Position } from '@xyflow/react';
import { motion } from 'framer-motion';
import { X, Zap } from 'lucide-react';
import { useState } from 'react';

export function TriggerNode({ data, selected }) {
  const meta = data.meta || {};
  const existingKeywords: string[] = meta.keywords || [];

  const [keywordInput, setKeywordInput] = useState<string>('');

  const handleAddKeyword = () => {
    const keyword = keywordInput.trim().toLowerCase();
    if (!keyword) return;

    if (existingKeywords.includes(keyword)) {
      setKeywordInput('');
      return;
    }

    const updatedKeywords = [...existingKeywords, keyword];

    data.onPatch({
      meta: {
        ...meta,
        keywords: updatedKeywords,
      },
    });

    setKeywordInput('');
  };

  const handleRemoveKeyword = (keywordToRemove: string) => {
    const updatedKeywords = existingKeywords.filter((k: string) => k !== keywordToRemove);

    data.onPatch({
      meta: {
        ...meta,
        keywords: updatedKeywords,
      },
    });
  };

  return (
    <div className="relative">
      <Handle id="start" type="source" position={Position.Right} className="z-50 !h-3 !w-3 !border-2 !border-white !bg-orange-500" />

      <Card
        className={cn(
          'relative w-96 overflow-hidden border-2 shadow-xl transition-all duration-200',
          selected ? 'border-orange-500 ring-4 ring-orange-500/20' : 'border-gray-300',
        )}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-500 to-red-600 p-4 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              <h3 className="text-lg font-bold">Trigger Keyword</h3>
            </div>
            <DeleteButton data={data} />
          </div>
        </div>

        <CardContent className="space-y-4 bg-gray-50 p-5">
          {/* Input Field */}
          <div className="space-y-3">
            <label className="text-xs font-semibold uppercase tracking-wider text-gray-700">Trigger Keywords</label>

            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={keywordInput}
                  maxLength={24}
                  onChange={(e) => setKeywordInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddKeyword();
                    }
                  }}
                  placeholder="e.g. hi, hello, start"
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 pr-12 text-sm placeholder-gray-400 transition-all focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-200"
                />
                <div aria-hidden className="absolute right-3 top-1/2 -translate-y-1/2 select-none text-xs text-gray-500">
                  {keywordInput.length} / 24
                </div>
              </div>
              <Button
                onClick={handleAddKeyword}
                disabled={!keywordInput.trim()}
                size="sm"
                className="bg-orange-500 px-5 font-medium text-white hover:bg-orange-600"
              >
                Add
              </Button>
            </div>
          </div>

          {/* Keyword Chips */}
          {existingKeywords.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {existingKeywords.map((keyword) => (
                <motion.div
                  key={keyword}
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.8, opacity: 0 }}
                  transition={{ duration: 0.15 }}
                >
                  <Badge
                    variant="secondary"
                    className="group flex items-center gap-1.5 border border-orange-300 bg-orange-100 py-1.5 pl-3 pr-2 text-sm font-medium text-orange-800 hover:bg-orange-200"
                  >
                    <span>{keyword}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveKeyword(keyword)}
                      className="ml-1 rounded-full p-0.5 transition-colors hover:bg-orange-300"
                      title={`Remove "${keyword}"`}
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </Badge>
                </motion.div>
              ))}
            </div>
          )}

          {/* Empty State */}
          {existingKeywords.length === 0 && (
            <p className="py-4 text-center text-xs italic text-gray-500">No trigger keywords yet. Add one to activate this flow!</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
