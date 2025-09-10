export type FloorDoc = { _id: string; name: string };

export type RoomDoc = {
  type: string;
  _id: string;
  name: string;
  roomTypeId?: string;
  capacity?: number;
  availability?: boolean;
  zoneId: string;
  staffIds?: string[];
};

export type StaffDoc = {
  _id: string;
  name: string;
  phone?: string;
  nickName?: string;
  customRole?: { role: string }[];
};

export type GroupedPreview = Array<{
  floorId: string;
  floorName: string;
  rooms: Array<{
    roomId: string;
    roomName: string;
    staff: Array<{ _id: string; name: string; role?: string }>;
  }>;
}>;
