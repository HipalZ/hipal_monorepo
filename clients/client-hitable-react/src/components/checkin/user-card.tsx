import { memo } from "react";
import { Eye, EyeOff, Clock, Hash, User, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface UserData {
  _id: string;
  userId: {
    _id: string;
    name: string;
    phone: string;
  };
  date: number;
  code: string;
}

interface UserCardProps {
  user: UserData;
  isPhoneRevealed: boolean;
  onRevealPhone: (userId: string) => void;
  onHidePhone: (userId: string) => void;
  formatTime: (timestamp: number) => string;
  maskPhoneNumber: (phone: string) => string;
}

const UserCard = memo(
  ({
    user,
    isPhoneRevealed,
    onRevealPhone,
    onHidePhone,
    formatTime,
    maskPhoneNumber,
  }: UserCardProps) => {
    return (
      <Card className="hover:shadow-md transition-shadow relative">
        <CardHeader className="!p-4">
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-muted-foreground" />
            <h3 className="font-semibold truncate">{user.userId.name}</h3>
          </div>
        </CardHeader>
        <CardContent className="space-y-3 !px-4">
        <div className="flex items-center gap-2 text-sm absolute right-4 top-4">
          <Hash className="h-4 w-4 text-muted-foreground" />
          <Badge variant="outline" className="font-mono">
            {user.code}
          </Badge>
        </div>
        <section className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>{formatTime(user.date)}</span>
          </div>

          <div className="flex items-center">
            <div className="flex items-center gap-2 text-sm">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <span className="font-mono">
                {isPhoneRevealed
                  ? user.userId.phone
                  : maskPhoneNumber(user.userId.phone)}
              </span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() =>
                isPhoneRevealed
                  ? onHidePhone(user.userId._id)
                  : onRevealPhone(user.userId._id)
              }
            >
              {isPhoneRevealed ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </Button>
          </div>

        </section>
        </CardContent>
      </Card>
    );
  },
);

UserCard.displayName = "UserCard";

export default UserCard;
