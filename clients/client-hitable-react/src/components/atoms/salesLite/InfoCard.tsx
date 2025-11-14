import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { motion } from 'framer-motion';
import { MoreVertical } from 'lucide-react';

interface BreakdownItem {
  label: string;
  value: number;
}

interface InfoCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  breakdown?: BreakdownItem[];
}

export const InfoCard = ({ title, value, icon, breakdown }: InfoCardProps) => {
  return (
    <motion.div>
      <Card className="relative bg-white !text-black">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-semibold tracking-wider">{title}</CardTitle>
          {breakdown && breakdown.length > 0 && (
            <DropdownMenu>
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
