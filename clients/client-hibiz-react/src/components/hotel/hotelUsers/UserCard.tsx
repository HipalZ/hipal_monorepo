import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { User, Phone, ArrowRight } from "lucide-react";

interface UserCardProps {
  user: {
    _id: string;
    name: string;
    phone: string;
  };
  onClick: () => void;
}

export function UserCard({ user, onClick }: UserCardProps) {
  return (
    <Card
      className="cursor-pointer hover:shadow-xl transition-all duration-300 hover:border-primary/50 hover:-translate-y-1 bg-gradient-to-r from-[#f4f4f450] to-red-100 group border-0 shadow-sm"
      onClick={onClick}
    >
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-14 h-14 bg-gradient-to-br from-primary/20 to-accent/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <User className="w-7 h-7 text-primary" />
            </div>
            <div className="space-y-1">
              <h3 className="font-bold text-xl capitalize text-foreground group-hover:text-primary transition-colors duration-300">
                {user.name}
              </h3>
              <Badge
                variant="secondary"
                className="text-xs font-medium bg-primary/10 text-primary border-primary/20"
              >
                Guest User
              </Badge>
            </div>
          </div>
          <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all duration-300" />
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="flex items-center space-x-3 p-3 bg-muted/30 rounded-lg">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Phone className="w-4 h-4 text-primary" />
          </div>
          <span className="text-sm font-medium text-foreground">
            {user.phone}
          </span>
        </div>

        <div className="pt-4 border-t border-border/50">
          <div className="flex items-center justify-between p-3 bg-gradient-to-r from-primary/5 to-accent/5 rounded-lg border border-primary/10">
            <p className="text-sm font-medium text-foreground">
              View Analytics
            </p>
            <div className="flex items-center space-x-1 text-primary">
              <span className="text-xs font-medium">Details</span>
              <ArrowRight className="w-3 h-3" />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
