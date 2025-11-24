import { useKotStore } from '@/components/store/useKotStore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useTablesKotMutation } from '@/hooks/useAllRunningTable';
import { motion } from 'framer-motion';
import { MoreVertical } from 'lucide-react';
import { useMemo } from 'react';
import toast from 'react-hot-toast';

interface BreakdownItem {
  label: string;
  value: number;
}

interface InfoCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  gradient: string;
  breakdown?: BreakdownItem[];
}

export const InfoCard = ({ title, value, icon, gradient, breakdown }: InfoCardProps) => {
  const setOpen = useKotStore((state) => state.setOpen);
  console.log('breakdown', breakdown);
  const setSelectedTableId = useKotStore((state) => state.setSelectedTableId);
  const { mutateAsync } = useTablesKotMutation();
  const getAllTableIds = useMemo(() => {
    if (title === 'Running Tables' && breakdown && breakdown.length > 0) {
      return breakdown.map((item: any) => item.tableId);
    }
    return [];
  }, [title, breakdown]);

  const openModal = async () => {
    if (getAllTableIds.length) {
      setOpen(true);
      const res = await mutateAsync({ tableIds: getAllTableIds });
      console.log('res', res);
      if (res.length) {
        setSelectedTableId(res[0].tableId);
      }
      return;
    }
    return toast.error('No active tables found');
  };

  return (
    <motion.div>
      <Card className="relative bg-white !text-black">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-semibold tracking-wider">{title}</CardTitle>
          {breakdown && breakdown.length > 0 && (
            <DropdownMenu modal={false}>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="text-primary absolute bottom-2 right-2 h-6 w-6 bg-white p-0 hover:bg-white/20">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64">
                <div className="text-muted-foreground px-2 py-1.5 text-sm font-semibold">{title} Breakdown</div>
                {breakdown.map((item, index) => (
                  <DropdownMenuItem key={index} className="flex justify-between">
                    <span className="text-sm">{item.label}</span>
                    <span className="text-sm font-medium">₹{item?.value?.toLocaleString()}</span>
                  </DropdownMenuItem>
                ))}
                {title === 'Running Tables' && (
                  <Button onClick={openModal} className="w-full">
                    View All Kots
                  </Button>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-black">₹{value?.toLocaleString()}</div>
        </CardContent>
        <article className="absolute right-0 top-0 p-2 text-black">{icon}</article>
      </Card>
    </motion.div>
  );
};
