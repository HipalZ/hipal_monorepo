import { Button } from '@/components/ui/button.tsx';
import { Grid3X3, List } from 'lucide-react';
import { memo } from 'react';
import useReports from '../store/useReports.ts';

const MemoLayoutToggleButtons = () => {
  const layout = useReports((s) => s.layoutType);
  const setLayout = useReports((s) => s.setLayoutType);
  return (
    <div className="flex items-center rounded-lg border p-1">
      <Button variant={layout === 'table' ? 'default' : 'ghost'} size="sm" onClick={() => setLayout('table')} className="h-8 px-2" title="Table View">
        <List className="h-4 w-4" />
      </Button>
      <Button
        variant={layout === 'compact' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => setLayout('compact')}
        className="h-8 px-2"
        title="Compact View"
      >
        <Grid3X3 className="h-4 w-4" />
      </Button>
    </div>
  );
};

const LayoutToggleButtons = memo(MemoLayoutToggleButtons);
export default LayoutToggleButtons;
