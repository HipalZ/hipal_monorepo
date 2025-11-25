import { cn } from '@/components/utils/helper';
import { GripVertical } from 'lucide-react';
import type { DragEvent, ReactNode } from 'react';

export const PaletteItem = ({ label, type, icon, gradient }: { label: string; type: string; icon: ReactNode; gradient: string }) => {
  const handleDragStart = (e: DragEvent<HTMLDivElement>) => {
    if (!e.dataTransfer) return;
    e.dataTransfer.setData('application/reactflow', type);
    e.dataTransfer.effectAllowed = 'move';
  };

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      className={cn(
        'group relative flex cursor-grab items-center gap-3 rounded-lg border bg-white px-4 py-3 shadow-sm transition-all',
        'hover:scale-[1.02] hover:shadow-md active:scale-100 active:cursor-grabbing',
        'border-gray-200',
      )}
    >
      <div className={`flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br ${gradient} p-2 text-white shadow-md`}>{icon}</div>
      <span className="select-none text-sm font-medium text-gray-800">{label}</span>
      <GripVertical className="absolute right-3 h-4 w-4 text-gray-400 opacity-0 transition-opacity group-hover:opacity-100" />
      <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-lg">
        <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
      </div>
    </div>
  );
};
