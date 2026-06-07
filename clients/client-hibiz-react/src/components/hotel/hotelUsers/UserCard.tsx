import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { User, Phone, ArrowRight, CalendarDays, Star, Wrench } from "lucide-react";

interface UserCardProps {
  user: {
    _id: string;
    name: string;
    phone: string;
    stays?: number;
    services?: number;
    reviews?: number;
    lastVisit?: string;
    topSource?: string;
  };
  onClick: () => void;
}

export function UserCard({ user, onClick }: UserCardProps) {
  return (
    <Card
      className="group relative cursor-pointer overflow-hidden rounded-lg border border-border/60 bg-card shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-xl"
      onClick={onClick}
    >
      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-teal-500 via-amber-400 to-rose-400 opacity-80" />
      <CardHeader className="pb-3 pt-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-teal-50 text-teal-700 ring-1 ring-teal-100 transition-transform duration-300 group-hover:scale-105">
              <User className="h-6 w-6" />
            </div>
            <div className="min-w-0 space-y-1">
              <h3 className="truncate text-lg font-bold capitalize text-foreground transition-colors duration-300 group-hover:text-primary">
                {user.name}
              </h3>
              <Badge
                variant="secondary"
                className="rounded-md border border-amber-200 bg-amber-50 text-xs font-medium text-amber-700"
              >
                {user.topSource || "Guest User"}
              </Badge>
            </div>
          </div>
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted/60 transition-all duration-300 group-hover:bg-primary group-hover:text-primary-foreground">
            <ArrowRight className="h-4 w-4" />
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="flex items-center gap-2 rounded-md border border-border/50 bg-muted/20 px-3 py-2">
          <Phone className="h-4 w-4 text-teal-700" />
          <span className="text-sm font-medium text-foreground">
            {user.phone}
          </span>
        </div>

        <div className="grid grid-cols-3 gap-2">
          <div className="rounded-md bg-slate-50 px-2 py-2 text-center ring-1 ring-slate-100">
            <CalendarDays className="mx-auto mb-1 h-3.5 w-3.5 text-slate-600" />
            <div className="text-sm font-bold text-foreground">{user.stays ?? 0}</div>
            <div className="text-[10px] font-medium uppercase text-muted-foreground">Visits</div>
          </div>
          <div className="rounded-md bg-rose-50 px-2 py-2 text-center ring-1 ring-rose-100">
            <Wrench className="mx-auto mb-1 h-3.5 w-3.5 text-rose-600" />
            <div className="text-sm font-bold text-foreground">{user.services ?? 0}</div>
            <div className="text-[10px] font-medium uppercase text-muted-foreground">Services</div>
          </div>
          <div className="rounded-md bg-amber-50 px-2 py-2 text-center ring-1 ring-amber-100">
            <Star className="mx-auto mb-1 h-3.5 w-3.5 text-amber-600" />
            <div className="text-sm font-bold text-foreground">{user.reviews ?? 0}</div>
            <div className="text-[10px] font-medium uppercase text-muted-foreground">Reviews</div>
          </div>
        </div>

        <div className="flex items-center justify-between border-t border-border/50 pt-3 text-xs">
          <span className="text-muted-foreground">Last visit</span>
          <span className="font-semibold text-foreground">{user.lastVisit || "No date"}</span>
        </div>
      </CardContent>
    </Card>
  );
}
