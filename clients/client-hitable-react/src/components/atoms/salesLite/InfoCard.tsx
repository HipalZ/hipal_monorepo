import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { MoreVertical } from "lucide-react";

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

export const InfoCard = ({
  title,
  value,
  icon,
  breakdown,
}: InfoCardProps) => {
  return (
    <motion.div>
      <Card className="bg-white !text-black relative">
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
          <CardTitle className="text-sm font-semibold tracking-wider ">
            {title}
          </CardTitle>
          {breakdown && breakdown.length > 0 && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0 text-primary hover:bg-white/20 absolute right-2 bottom-2 bg-white"
                >
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64">
                <div className="px-2 py-1.5 text-sm font-semibold text-muted-foreground">
                  {title} Breakdown
                </div>
                {breakdown.map((item, index) => (
                  <DropdownMenuItem
                    key={index}
                    className="flex justify-between"
                  >
                    <span className="text-sm">{item.label}</span>
                    <span className="text-sm font-medium">
                      ₹{item.value.toLocaleString()}
                    </span>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-black">
            ₹{value.toLocaleString()}
          </div>
        </CardContent>
        <article className="absolute top-0 right-0 p-2 text-black">
          {icon}
        </article>
      </Card>
    </motion.div>
  );
};
