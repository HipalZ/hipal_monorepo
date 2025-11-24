import PopUp from '@/components/atom/popUp';
import type { IDuesPersonsData } from '@/components/types/businessData';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useCallback, useState } from 'react';
import toast from 'react-hot-toast';
import ClearDues from './clearDues';

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

interface UserDue {
  _id: string;
  userId: {
    _id: string;
    name: string;
    phone: string;
  };
  totalDuesAmount: number;
}

interface UserDueCardProps {
  userDue: UserDue;
}

const UserDueCard = ({ userDue }: UserDueCardProps) => {
  const { userId, totalDuesAmount } = userDue;
  const [openSettleDues, setOpenSettleDues] = useState<boolean>(false);
  const [selectedUser, setSelectedUser] = useState<IDuesPersonsData | null>(null);

  const handleUserClick = (user: IDuesPersonsData) => {
    if (user.totalDuesAmount === 0) return toast.error('No dues available');
    setSelectedUser(user);
    setOpenSettleDues(true);
  };

  const closeSettleDues = useCallback(() => {
    setOpenSettleDues(false);
    setSelectedUser(null);
  }, []);

  return (
    <>
      <Card onClick={() => handleUserClick(userDue)} className="w-full max-w-sm">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-xl font-semibold">{userId.name}</CardTitle>
          <Avatar className="h-8 w-8">
            <AvatarFallback>{userId.name.charAt(0)}</AvatarFallback>
          </Avatar>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold opacity-70">{formatCurrency(totalDuesAmount)}</div>
          <p className="text-muted-foreground mt-2 text-xs">Phone: {userId.phone}</p>
        </CardContent>
      </Card>
      {openSettleDues && (
        <PopUp rightTopBack onClose={closeSettleDues} hide show={openSettleDues} height="h-[100dvh] lg:h-[90dvh]" width="w-[30rem]">
          <ClearDues closeSettleDues={closeSettleDues} selectedUser={selectedUser} />
        </PopUp>
      )}
    </>
  );
};

export default UserDueCard;
