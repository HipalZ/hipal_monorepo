import { Badge } from '@/components/ui/badge';
import type { IHotelRoom } from '@/hooks/hotel/useRoomHook';
import type { IRoomType } from '@/hooks/hotel/useRoomTypeHook';
import { Bed } from 'lucide-react';
import { memo } from 'react';
import { RoomCard } from './RoomComponants';

interface RoomTypeSectionProps {
  roomType?: IRoomType;
  title?: string;
  rooms: IHotelRoom[];
  onEditRoom: (roomId: string) => void;
  getFloorName: (floorId: string) => string;
  getStaffNames: (staffIds: string[]) => string[];
  downloadSingleQRCode: (e: React.MouseEvent<HTMLButtonElement>, roomId: string) => void;
}

const RoomTypeSection = ({ roomType, title, rooms, onEditRoom, getFloorName, getStaffNames, downloadSingleQRCode }: RoomTypeSectionProps) => {
  if (rooms.length === 0) return null;
  const sectionTitle = title || roomType?.roomType.replace(/_/g, ' ') || 'Rooms';

  return (
    <div className="mb-8">
      <div className="mb-4 flex items-center gap-2">
        <div className="bg-primary/10 rounded-full p-2">
          <Bed className="text-primary h-5 w-5" />
        </div>
        <h2 className="text-xl font-bold">{sectionTitle}</h2>
        <Badge variant="outline" className="ml-2">
          {rooms.length} {rooms.length === 1 ? 'Room' : 'Rooms'}
        </Badge>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {rooms.map((room) => (
          <RoomCard
            key={room._id}
            room={room}
            onEdit={onEditRoom}
            floorName={getFloorName(room.zoneId)}
            staffNames={getStaffNames(room.staffIds || [])}
            downloadSingleQRCode={downloadSingleQRCode}
          />
        ))}
      </div>
    </div>
  );
};

export default memo(RoomTypeSection);
