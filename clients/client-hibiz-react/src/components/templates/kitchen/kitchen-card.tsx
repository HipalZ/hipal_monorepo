import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChefHat, Users, Utensils } from "lucide-react";
import type { KitchenData } from "@/hooks/useKItchenHook.ts";

interface KitchenCardProps {
  kitchen: KitchenData;
  onViewDetails: () => void;
}

export default function KitchenCard({
  kitchen,
  onViewDetails,
}: KitchenCardProps) {
  return (
    <Card className="flex flex-col h-full shadow-md hover:shadow-lg transition-shadow duration-200">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-3 mb-2">
          <ChefHat className="h-7 w-7 text-primary" />
          <CardTitle className="text-xl font-semibold text-gray-800">
            {kitchen.name}
          </CardTitle>
        </div>
        <CardDescription className="text-sm text-gray-600 h-10 overflow-hidden text-ellipsis">
          {kitchen.description || "No description provided."}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-grow">
        <div className="space-y-3 text-sm text-gray-700">
          <div className="flex items-center">
            <Users className="mr-2 h-4 w-4 text-gray-500" />
            <span>{kitchen.staffIds?.length || 0} Staff Assigned</span>
          </div>
          <div className="flex items-center">
            <Utensils className="mr-2 h-4 w-4 text-gray-500" />
            <span>{kitchen.dishIds?.length || 0} Dishes Linked</span>
          </div>
        </div>
      </CardContent>
      <div className="p-4 pt-0 mt-auto">
        <Button
          onClick={onViewDetails}
          className="w-full "
        >
          View Details
        </Button>
      </div>
    </Card>
  );
}
