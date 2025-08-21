import AdvancedBottomButton from '@/components/atom/bottomButton/advancedBottomButton.tsx';
import { useFloorStore } from '@/components/store/hotel/useFloorStore.ts';
import { useStaffDataStore } from '@/components/store/hotel/useHotelStaff.ts';
import { useRoomStore } from '@/components/store/hotel/useRoomStore.ts';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useStaffLinking } from '@/hooks/hotel/useStaffLinking';
import { useScreenSize } from '@/hooks/useScreenSize.ts';
import { AlertCircle, ArrowRight, Building, Check, CheckCircle, Edit3, Home, Link, MapPin, Plus, Search, Trash2, User, Users } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

interface AssignmentGroup {
  id: string;
  name: string;
  roomIds: string[];
  staffIds: string[];
  createdAt: Date;
}

export const RoomStaffLinking = () => {
  const screenSize = useScreenSize();
  const isMobile = screenSize === 'xs' || screenSize === 'sm';
  const isTablet = screenSize === 'md';
  const { mutateAsync, isPending } = useStaffLinking();
  const {
    selectedRooms,
    selectedStaff,
    setSelectedRooms,
    setSelectedStaff,
    toggleRoomSelection,
    toggleStaffSelection,
    clearSelections,
    getStaffByRoom,
    getRoomsByStaff,
    roomStaffAssignments,
    staffData: staffList,
  } = useStaffDataStore();

  const { roomData, roomType: roomTypes } = useRoomStore();
  const floorData = useFloorStore((state) => state.floorData);
  const [roomSearchTerm, setRoomSearchTerm] = useState('');
  const [staffSearchTerm, setStaffSearchTerm] = useState('');
  const [selectedRoleFilter, setSelectedRoleFilter] = useState<string>('all');
  const [selectedFloorFilter, setSelectedFloorFilter] = useState<string>('all');
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  const [currentStep, setCurrentStep] = useState<'select' | 'confirm' | 'success'>('select');

  const [assignmentGroups, setAssignmentGroups] = useState<AssignmentGroup[]>([]);
  const [groupName, setGroupName] = useState('');
  const [editingGroupId, setEditingGroupId] = useState<string | null>(null);
  const [showAssignmentView, setShowAssignmentView] = useState(false);

  const [savedSelections, setSavedSelections] = useState<{
    roomIds: string[];
    staffIds: string[];
    savedAt: Date;
    name?: string;
  } | null>(null);
  const [showSaveSuccess, setShowSaveSuccess] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('room-staff-selections');
    if (saved) {
      try {
        const parsedSelections = JSON.parse(saved);
        if (parsedSelections.savedAt) {
          parsedSelections.savedAt = new Date(parsedSelections.savedAt);
        }
        setSavedSelections(parsedSelections);
      } catch (error) {
        console.error('Failed to load saved selections:', error);
      }
    }
  }, []);

  const safeSelectedRooms = Array.isArray(selectedRooms) ? selectedRooms : [];
  const safeSelectedStaff = Array.isArray(selectedStaff) ? selectedStaff : [];
  const safeRoomData = Array.isArray(roomData) ? roomData : [];
  const safeStaffList = Array.isArray(staffList) ? staffList : [];
  const safeFloorData = Array.isArray(floorData) ? floorData : [];

  const roomsByFloor = useMemo(() => {
    const floors = new Map<string, { floorName: string; rooms: any[] }>();

    for (const room of safeRoomData) {
      const floorId = room.zoneId;
      const floor = safeFloorData.find((floor) => floor._id === floorId);
      const floorName = floor ? floor.name : 'Unassigned';

      if (!floors.has(floorId)) {
        floors.set(floorId, { floorName, rooms: [] });
      }

      const matchesSearch = room.name.toLowerCase().includes(roomSearchTerm.toLowerCase());
      const matchesFloor = selectedFloorFilter === 'all' || floorId === selectedFloorFilter;

      if (matchesSearch && matchesFloor) {
        floors.get(floorId)!.rooms.push(room);
      }
    }

    return Array.from(floors.entries())
      .map(([floorId, data]) => ({
        floorId,
        floorName: data.floorName,
        rooms: data.rooms,
      }))
      .filter((floor) => floor.rooms.length > 0);
  }, [safeRoomData, roomSearchTerm, selectedFloorFilter, safeFloorData]);

  const filteredStaff = useMemo(() => {
    return safeStaffList.filter((staff) => {
      const matchesSearch =
        staff.name.toLowerCase().includes(staffSearchTerm.toLowerCase()) ||
        staff.phone.includes(staffSearchTerm) ||
        (staff.nickName && staff.nickName.toLowerCase().includes(staffSearchTerm.toLowerCase()));

      const matchesRole =
        selectedRoleFilter === 'all' || staff.customRole.some((role) => role?.role?.toLowerCase() === selectedRoleFilter?.toLowerCase());

      return matchesSearch && matchesRole;
    });
  }, [safeStaffList, staffSearchTerm, selectedRoleFilter]);

  const availableRoles = useMemo(() => {
    const roles = new Set<string>();
    for (const staff of safeStaffList) {
      for (const role of staff.customRole) {
        roles.add(role.role);
      }
    }
    return Array.from(roles).sort();
  }, [safeStaffList]);

  const addToGroup = () => {
    if (safeSelectedRooms.length === 0 || safeSelectedStaff.length === 0) {
      return;
    }

    const newGroup: AssignmentGroup = {
      id: Date.now().toString(),
      name: groupName || `Group ${assignmentGroups.length + 1}`,
      roomIds: [...safeSelectedRooms],
      staffIds: [...safeSelectedStaff],
      createdAt: new Date(),
    };

    setAssignmentGroups([...assignmentGroups, newGroup]);
    clearSelections();
    setGroupName('');
  };

  const removeGroup = (groupId: string) => {
    setAssignmentGroups(assignmentGroups.filter((group) => group.id !== groupId));
  };

  const editGroup = (groupId: string) => {
    const group = assignmentGroups.find((g) => g.id === groupId);
    if (group) {
      setSelectedRooms(group.roomIds);
      setSelectedStaff(group.staffIds);
      setGroupName(group.name);
      setEditingGroupId(groupId);
    }
  };

  const updateGroup = () => {
    if (editingGroupId && safeSelectedRooms.length > 0 && safeSelectedStaff.length > 0) {
      setAssignmentGroups(
        assignmentGroups.map((group) =>
          group.id === editingGroupId
            ? {
                ...group,
                name: groupName || group.name,
                roomIds: [...safeSelectedRooms],
                staffIds: [...safeSelectedStaff],
              }
            : group,
        ),
      );
      clearSelections();
      setGroupName('');
      setEditingGroupId(null);
    }
  };

  const cancelEdit = () => {
    clearSelections();
    setGroupName('');
    setEditingGroupId(null);
  };

  const handleAssignAllGroups = () => {
    if (assignmentGroups.length === 0) {
      return;
    }
    setShowConfirmDialog(true);
  };

  const confirmAssignment = async () => {
    // Map the assignment groups to the desired structure
    const assignmentPayload = assignmentGroups.map((group) => ({
      rooms: [
        {
          roomIds: group.roomIds,
          staffIds: group.staffIds,
        },
      ],
      action: 'ADD',
    }));

    console.log('[v0] Assignment Payload:', assignmentPayload);

    try {
      // Execute assignments for all groups
      for (const group of assignmentPayload) {
        console.log('group', group);

        // useStaffDataStore.getState().linkStaffToRooms(group.rooms[0].staffIds, group.rooms[0].roomIds);
      }

      setShowConfirmDialog(false);
      setShowSuccessAlert(true);
      setCurrentStep('success');
      setAssignmentGroups([]);

      // Hide success alert after 3 seconds
      setTimeout(() => {
        setShowSuccessAlert(false);
        setCurrentStep('select');
      }, 3000);
    } catch (error) {
      console.error('Assignment failed:', error);
      setShowConfirmDialog(false);
    }
  };

  const selectAllRooms = () => {
    const allRoomIds = roomsByFloor.flatMap((floor) => floor.rooms.map((room) => room._id));
    setSelectedRooms(allRoomIds);
  };

  const selectRoomsByFloor = (floorId: string) => {
    const floor = roomsByFloor.find((f) => f.floorId === floorId);
    if (floor) {
      const currentSelected = [...safeSelectedRooms];
      const floorRoomIds = floor.rooms.map((room) => room._id);
      const allFloorRoomsSelected = floorRoomIds.every((id) => currentSelected.includes(id));

      if (allFloorRoomsSelected) {
        // Deselect all rooms from this floor
        setSelectedRooms(currentSelected.filter((id) => !floorRoomIds.includes(id)));
      } else {
        // Select all rooms from this floor
        const newSelected = [...new Set([...currentSelected, ...floorRoomIds])];
        setSelectedRooms(newSelected);
      }
    }
  };

  const selectAllStaff = () => {
    const allStaffIds = filteredStaff.map((staff) => staff._id);
    setSelectedStaff(allStaffIds);
  };

  const getRoomTypeName = (roomTypeId: string) => {
    if (!roomTypes || !Array.isArray(roomTypes)) return 'Unknown';
    const roomType = roomTypes.find((type) => type._id === roomTypeId);
    return roomType?.roomType || 'Unknown';
  };

  const getRoleColor = (role: string) => {
    const roleColors: Record<string, string> = {
      MANAGER: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      FRONT_OFFICE: 'bg-blue-100 text-blue-800 border-blue-200',
      HOUSEKEEPING: 'bg-purple-100 text-purple-800 border-purple-200',
      KITCHEN: 'bg-orange-100 text-orange-800 border-orange-200',
      CLEANER: 'bg-green-100 text-green-800 border-green-200',
      PLUMBER: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      LAUNDRY: 'bg-pink-100 text-pink-800 border-pink-200',
      SECURITY: 'bg-red-100 text-red-800 border-red-200',
    };
    return roleColors[role] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const totalAssignments = assignmentGroups.reduce((total, group) => total + group.roomIds.length * group.staffIds.length, 0);

  const handleStartAssign = () => {
    setShowAssignmentView(true);
  };

  const saveCurrentSelections = () => {
    if (safeSelectedRooms.length === 0 && safeSelectedStaff.length === 0) {
      return;
    }

    const selections = {
      roomIds: [...safeSelectedRooms],
      staffIds: [...safeSelectedStaff],
      savedAt: new Date(),
      name: `Saved Selection ${new Date().toLocaleTimeString()}`,
    };

    setSavedSelections(selections);

    // Save to localStorage for persistence
    localStorage.setItem('room-staff-selections', JSON.stringify(selections));

    setShowSaveSuccess(true);
    setTimeout(() => setShowSaveSuccess(false), 2000);
  };

  const loadSavedSelections = () => {
    if (savedSelections) {
      setSelectedRooms(savedSelections.roomIds);
      setSelectedStaff(savedSelections.staffIds);
    }
  };

  const clearSavedSelections = () => {
    setSavedSelections(null);
    localStorage.removeItem('room-staff-selections');
  };

  if (showAssignmentView) {
    return (
      <div className={`space-y-6 ${isMobile ? 'p-4' : 'p-6'} mx-auto max-w-7xl`}>
        <div className="space-y-2 text-center">
          <h1 className={`${isMobile ? 'text-2xl' : 'text-3xl'} font-bold text-gray-900`}>Staff-Room Assignment</h1>
          <p className={`text-gray-600 ${isMobile ? 'text-sm' : ''}`}>Create assignment groups and execute them all at once</p>
          <Button variant="outline" onClick={() => setShowAssignmentView(false)} className="mt-4">
            ← Back to Overview
          </Button>
        </div>
        {showSuccessAlert && (
          <Alert className="border-emerald-200 bg-emerald-50">
            <CheckCircle className="h-4 w-4 text-emerald-600" />
            <AlertDescription className="text-emerald-800">
              Successfully executed {assignmentGroups.length} assignment groups with {totalAssignments} total assignments!
            </AlertDescription>
          </Alert>
        )}

        {showSaveSuccess && (
          <Alert className="border-blue-200 bg-blue-50">
            <CheckCircle className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-800">Selections saved successfully! You can continue working or come back later.</AlertDescription>
          </Alert>
        )}

        {(safeSelectedRooms.length > 0 || safeSelectedStaff.length > 0) && (
          <Card
            className={`border-2 ${
              editingGroupId ? 'border-purple-300 bg-gradient-to-r from-pink-50 to-purple-50' : 'border-emerald-200 bg-emerald-50'
            }`}
          >
            <CardContent className="pt-6">
              <div className="space-y-4">
                {editingGroupId && (
                  <div className="text-center">
                    <Badge className="border-purple-300 bg-purple-100 px-3 py-1 text-purple-800">
                      Editing Group: {assignmentGroups.find((g) => g.id === editingGroupId)?.name}
                    </Badge>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-6">
                    <div className="text-center">
                      <div className={`text-2xl font-bold ${editingGroupId ? 'text-purple-600' : 'text-emerald-600'}`}>
                        {safeSelectedRooms.length}
                      </div>
                      <div className={`text-sm ${editingGroupId ? 'text-purple-700' : 'text-emerald-700'}`}>Rooms Selected</div>
                    </div>
                    <ArrowRight className={`h-6 w-6 ${editingGroupId ? 'text-purple-600' : 'text-emerald-600'}`} />
                    <div className="text-center">
                      <div className={`text-2xl font-bold ${editingGroupId ? 'text-purple-600' : 'text-emerald-600'}`}>
                        {safeSelectedStaff.length}
                      </div>
                      <div className={`text-sm ${editingGroupId ? 'text-purple-700' : 'text-emerald-700'}`}>Staff Selected</div>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      onClick={saveCurrentSelections}
                      disabled={safeSelectedRooms.length === 0 && safeSelectedStaff.length === 0}
                      className="border-blue-300 bg-transparent text-blue-700 hover:bg-blue-100"
                    >
                      Save
                    </Button>
                    <Button variant="outline" onClick={editingGroupId ? cancelEdit : clearSelections}>
                      {editingGroupId ? 'Cancel Edit' : 'Clear All'}
                    </Button>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Input
                    placeholder={editingGroupId ? 'Update group name' : 'Group name (optional)'}
                    value={groupName}
                    onChange={(e) => setGroupName(e.target.value)}
                    className="flex-1"
                  />
                  <Button
                    onClick={editingGroupId ? updateGroup : addToGroup}
                    disabled={safeSelectedRooms.length === 0 || safeSelectedStaff.length === 0}
                    className={`px-6 text-white ${editingGroupId ? 'bg-purple-600 hover:bg-purple-700' : 'bg-emerald-600 hover:bg-emerald-700'}`}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    {editingGroupId ? 'Update Group' : 'Add New Group'}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {assignmentGroups.length > 0 && (
          <Card className="border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50">
            <CardHeader>
              <div className={`flex items-center ${isMobile ? 'flex-col space-y-2' : 'justify-between'}`}>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-blue-600" />
                  Assignment Groups ({assignmentGroups.length})
                </CardTitle>
                <Button onClick={handleAssignAllGroups} className={`bg-blue-600 text-white hover:bg-blue-700 ${isMobile ? 'w-full' : 'px-6'}`}>
                  Assign Staff to Rooms ({totalAssignments} total)
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className={`grid ${isMobile ? 'grid-cols-1' : isTablet ? 'grid-cols-2' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'} gap-4`}>
                {assignmentGroups.map((group, index) => (
                  <div
                    key={group.id}
                    className={`rounded-lg border-2 p-4 ${
                      editingGroupId === group.id ? 'border-purple-300 bg-gradient-to-r from-pink-50 to-purple-50' : 'border-blue-200 bg-white'
                    }`}
                  >
                    <div className="mb-3 flex items-center justify-between">
                      <h4 className={`font-semibold text-gray-900 ${isMobile ? 'text-sm' : ''}`}>
                        {index + 1}. {group.name}
                        {editingGroupId === group.id && <Badge className="ml-2 bg-purple-100 text-xs text-purple-800">Editing</Badge>}
                      </h4>
                      <div className="flex space-x-1">
                        <Button size="sm" variant="outline" onClick={() => editGroup(group.id)} className="h-8 w-8 p-0">
                          <Edit3 className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => removeGroup(group.id)}
                          className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-2 text-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Rooms:</span>
                        <Badge variant="outline">{group.roomIds.length}</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Staff:</span>
                        <Badge variant="outline">{group.staffIds.length}</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Total Assignments:</span>
                        <Badge className="bg-blue-100 text-blue-800">{group.roomIds.length * group.staffIds.length}</Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Fixed Bottom Buttons */}
        <AdvancedBottomButton
          fixed={true}
          maxWidth="30rem"
          buttons={[
            // Initial State: Save Selection and Add New Group buttons
            ...(assignmentGroups.length === 0
              ? [
                  {
                    text: 'Save Selection',
                    onClick: addToGroup,
                    disable: safeSelectedRooms.length === 0 && safeSelectedStaff.length === 0,
                    className: `border-blue-300 text-blue-700 hover:bg-blue-100 ${isMobile ? 'w-full py-3' : 'px-6 py-3'} shadow-lg`,
                  },
                  {
                    text: 'Add New Group',
                    onClick: addToGroup,
                    disable: safeSelectedRooms.length === 0 || safeSelectedStaff.length === 0,
                    icon: <Plus className="mr-2 h-4 w-4" />,
                    className: `bg-emerald-600 hover:bg-emerald-700 text-white ${isMobile ? 'w-full py-3' : 'px-6 py-3'} shadow-lg`,
                  },
                ]
              : [
                  // When groups exist: Show Assign Staff and Add New Group buttons
                  {
                    text: `Assign Staff to Rooms (${totalAssignments})`,
                    onClick: handleAssignAllGroups,
                    className: `bg-blue-600 hover:bg-blue-700 text-white ${isMobile ? 'w-full py-3' : 'px-6 py-3'} shadow-lg`,
                  },
                  {
                    text: 'Add New Group',
                    onClick: addToGroup,
                    disable: safeSelectedRooms.length === 0 || safeSelectedStaff.length === 0,
                    icon: <Plus className="mr-2 h-4 w-4" />,
                    className: `bg-emerald-600 hover:bg-emerald-700 text-white ${isMobile ? 'w-full py-3' : 'px-6 py-3'} shadow-lg`,
                  },
                ]),
          ]}
        />

        <div className={`grid ${isMobile ? 'grid-cols-1 gap-4' : 'grid-cols-1 gap-6 lg:grid-cols-2'} ${isMobile ? 'pb-32' : 'pb-20'}`}>
          {/* Room Selection - Floor-wise Grid */}
          <Card>
            <CardHeader>
              <div className={`flex items-center ${isMobile ? 'flex-col space-y-2' : 'justify-between'}`}>
                <CardTitle className="flex items-center gap-2">
                  <Building className="h-5 w-5 text-emerald-600" />
                  Select Rooms by Floor
                </CardTitle>
                <div className={`flex ${isMobile ? 'w-full' : ''} space-x-2`}>
                  <Button size="sm" variant="outline" onClick={selectAllRooms} className={isMobile ? 'flex-1' : ''}>
                    Select All
                  </Button>
                  <Select value={selectedFloorFilter} onValueChange={setSelectedFloorFilter}>
                    <SelectTrigger className={isMobile ? 'flex-1' : 'w-32'}>
                      <SelectValue placeholder="Filter Floor" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Floors</SelectItem>
                      {safeFloorData.map((floor) => (
                        <SelectItem key={floor._id} value={floor._id}>
                          {floor.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
                <Input placeholder="Search rooms..." value={roomSearchTerm} onChange={(e) => setRoomSearchTerm(e.target.value)} className="pl-10" />
              </div>
            </CardHeader>
            <CardContent>
              <ScrollArea className={isMobile ? 'h-80' : 'h-96'}>
                <div className="space-y-4">
                  {roomsByFloor.map((floor) => {
                    const floorRoomIds = floor.rooms.map((room) => room._id);
                    const selectedInFloor = floorRoomIds.filter((id) => safeSelectedRooms.includes(id)).length;
                    const allFloorSelected = selectedInFloor === floorRoomIds.length && floorRoomIds.length > 0;

                    return (
                      <div key={floor.floorId} className="space-y-2">
                        <div
                          className={`flex items-center ${
                            isMobile ? 'flex-col space-y-2' : 'justify-between'
                          } rounded-lg bg-gradient-to-r from-pink-50 to-purple-50 p-2`}
                        >
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-emerald-600" />
                            <span className={`font-semibold text-gray-900 ${isMobile ? 'text-sm' : ''}`}>{floor.floorName}</span>
                            <Badge variant="outline" className="text-xs">
                              {selectedInFloor}/{floor.rooms.length} selected
                            </Badge>
                          </div>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => selectRoomsByFloor(floor.floorId)}
                            className={`text-xs ${isMobile ? 'w-full' : ''}`}
                          >
                            {allFloorSelected ? 'Deselect All' : 'Select All'}
                          </Button>
                        </div>

                        <div className={`grid ${isMobile ? 'grid-cols-1' : 'grid-cols-2'} gap-2`}>
                          {floor.rooms.map((room) => {
                            const isSelected = safeSelectedRooms.includes(room._id);
                            const assignedStaff = getStaffByRoom(room._id);

                            return (
                              <div
                                key={room._id}
                                className={`cursor-pointer rounded-lg border-2 p-3 transition-all ${
                                  isSelected
                                    ? 'border-purple-300 bg-gradient-to-r from-pink-50 to-purple-50 shadow-sm'
                                    : 'border-gray-200 hover:border-gray-300 hover:bg-gradient-to-r hover:from-pink-50 hover:to-purple-50'
                                }`}
                                onClick={() => toggleRoomSelection(room._id)}
                              >
                                <div className="mb-2 flex items-start justify-between">
                                  <Checkbox
                                    checked={isSelected}
                                    readOnly
                                    className="mt-0.5 data-[state=checked]:border-purple-600 data-[state=checked]:bg-purple-600"
                                  />
                                  <Badge variant="outline" className="text-xs">
                                    {getRoomTypeName(room.roomTypeId)}
                                  </Badge>
                                </div>

                                <div className="space-y-1">
                                  <p className={`font-semibold text-gray-900 ${isMobile ? 'text-sm' : 'text-sm'}`}>{room.name}</p>
                                  <div className="flex items-center justify-between text-xs text-gray-600">
                                    <span>Cap: {room.capacity}</span>
                                    <span>${room.price}</span>
                                  </div>
                                  <div
                                    className={`h-2 w-2 rounded-full ${room.availability ? 'bg-green-400' : 'bg-red-400'}`}
                                    title={room.availability ? 'Available' : 'Occupied'}
                                  />

                                  {assignedStaff.length > 0 && (
                                    <div className="mt-1 flex items-center gap-1">
                                      <User className="h-3 w-3 text-gray-500" />
                                      <span className="text-xs text-gray-500">{assignedStaff.length}</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Staff Selection */}
          <Card>
            <CardHeader>
              <div className={`flex items-center ${isMobile ? 'flex-col space-y-2' : 'justify-between'}`}>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-emerald-600" />
                  Select Staff
                </CardTitle>
                <div className={`flex ${isMobile ? 'w-full' : ''} space-x-2`}>
                  <Button size="sm" variant="outline" onClick={selectAllStaff} className={isMobile ? 'flex-1' : ''}>
                    Select All
                  </Button>
                  <Select value={selectedRoleFilter} onValueChange={setSelectedRoleFilter}>
                    <SelectTrigger className={isMobile ? 'flex-1' : 'w-32'}>
                      <SelectValue placeholder="By Role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Roles</SelectItem>
                      {availableRoles.map((role) => (
                        <SelectItem key={role} value={role}>
                          {role.replace('_', ' ')}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
                <Input placeholder="Search staff..." value={staffSearchTerm} onChange={(e) => setStaffSearchTerm(e.target.value)} className="pl-10" />
              </div>
            </CardHeader>
            <CardContent>
              <ScrollArea className={isMobile ? 'h-80' : 'h-96'}>
                <div className="space-y-2">
                  {filteredStaff.map((staff) => {
                    const isSelected = safeSelectedStaff.includes(staff._id);
                    const assignedRooms = getRoomsByStaff(staff._id);
                    const primaryRole = staff.customRole[0];

                    return (
                      <div
                        key={staff._id}
                        className={`flex cursor-pointer items-center space-x-3 rounded-lg border-2 p-4 transition-all ${
                          isSelected
                            ? 'border-purple-300 bg-gradient-to-r from-pink-50 to-purple-50 shadow-sm'
                            : 'border-gray-200 hover:border-gray-300 hover:bg-gradient-to-r hover:from-pink-50 hover:to-purple-50'
                        }`}
                        onClick={() => toggleStaffSelection(staff._id)}
                      >
                        <Checkbox
                          checked={isSelected}
                          readOnly
                          className="data-[state=checked]:border-purple-600 data-[state=checked]:bg-purple-600"
                        />
                        <div className="flex-1">
                          <div className={`flex items-center ${isMobile ? 'flex-col items-start space-y-1' : 'justify-between'}`}>
                            <p className={`font-semibold text-gray-900 ${isMobile ? 'text-sm' : ''}`}>{staff.name}</p>
                            {primaryRole && (
                              <Badge className={`${getRoleColor(primaryRole.role)} border text-xs`}>{primaryRole.role.replace('_', ' ')}</Badge>
                            )}
                          </div>
                          <p className={`text-gray-600 ${isMobile ? 'text-xs' : 'text-sm'}`}>{staff.phone}</p>
                          {assignedRooms.length > 0 && (
                            <div className="mt-2 flex items-center gap-1">
                              <Home className="h-3 w-3 text-gray-500" />
                              <span className="text-xs text-gray-500">{assignedRooms.length} rooms currently assigned</span>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-amber-500" />
                Confirm Bulk Assignment
              </DialogTitle>
              <DialogDescription>
                You are about to execute <strong>{assignmentGroups.length} assignment groups</strong> with{' '}
                <strong>{totalAssignments} total assignments</strong>.
              </DialogDescription>
            </DialogHeader>
            <div className="max-h-96 overflow-y-auto py-4">
              <div className="space-y-4">
                {assignmentGroups.map((group, index) => (
                  <div key={group.id} className="rounded-lg border p-4">
                    <h4 className="mb-2 font-semibold text-gray-900">
                      {index + 1}. {group.name}
                    </h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="mb-1 font-medium text-gray-900">Rooms ({group.roomIds.length}):</p>
                        <div className="max-h-24 space-y-1 overflow-y-auto">
                          {group.roomIds.slice(0, 5).map((roomId) => {
                            const room = safeRoomData.find((r) => r._id === roomId);
                            return (
                              <p key={roomId} className="text-xs text-gray-600">
                                • {room?.name || `Room ${roomId.slice(-4)}`}
                              </p>
                            );
                          })}
                          {group.roomIds.length > 5 && <p className="text-xs text-gray-500">• +{group.roomIds.length - 5} more</p>}
                        </div>
                      </div>
                      <div>
                        <p className="mb-1 font-medium text-gray-900">Staff ({group.staffIds.length}):</p>
                        <div className="max-h-24 space-y-1 overflow-y-auto">
                          {group.staffIds.slice(0, 5).map((staffId) => {
                            const staff = safeStaffList.find((s) => s._id === staffId);
                            return (
                              <p key={staffId} className="text-xs text-gray-600">
                                • {staff?.name || `Staff ${staffId.slice(-4)}`}
                              </p>
                            );
                          })}
                          {group.staffIds.length > 5 && <p className="text-xs text-gray-500">• +{group.staffIds.length - 5} more</p>}
                        </div>
                      </div>
                    </div>
                    <div className="mt-2 border-t pt-2">
                      <Badge className="bg-blue-100 text-blue-800">{group.roomIds.length * group.staffIds.length} assignments</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowConfirmDialog(false)}>
                Cancel
              </Button>
              <Button onClick={confirmAssignment} className="bg-emerald-600 hover:bg-emerald-700">
                Execute All Assignments
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${isMobile ? 'p-4' : 'p-6'} mx-auto max-w-7xl`}>
      <div className="space-y-2 text-center">
        <h1 className={`${isMobile ? 'text-2xl' : 'text-3xl'} font-bold text-gray-900`}>Staff-Room Management</h1>
        <p className={`text-gray-600 ${isMobile ? 'text-sm' : ''}`}>Manage staff assignments to rooms efficiently</p>
      </div>

      {/* Current Assignments Overview */}
      <Card>
        <CardHeader>
          <div className={`flex items-center ${isMobile ? 'flex-col space-y-2' : 'justify-between'}`}>
            <CardTitle className="flex items-center gap-2">
              <Link className="h-5 w-5 text-emerald-600" />
              Current Assignments ({roomStaffAssignments.length})
            </CardTitle>
            <Button onClick={handleStartAssign} className={`bg-emerald-600 text-white hover:bg-emerald-700 ${isMobile ? 'w-full' : 'px-6'}`}>
              Start Assign
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {roomStaffAssignments.length > 0 ? (
            <div className={`grid ${isMobile ? 'grid-cols-1' : isTablet ? 'grid-cols-2' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'} gap-4`}>
              {roomStaffAssignments.slice(0, 6).map((assignment) => {
                const room = safeRoomData.find((r) => r._id === assignment.roomId);
                const assignedStaffList = safeStaffList.filter((s) => assignment.staffIds.includes(s._id));

                return (
                  <div key={assignment.roomId} className="rounded-lg border bg-gradient-to-r from-pink-50 to-purple-50 p-3">
                    <div className="mb-2 flex items-center justify-between">
                      <p className={`font-medium text-gray-900 ${isMobile ? 'text-sm' : ''}`}>{room?.name || 'Unknown Room'}</p>
                      <Badge variant="outline" className="text-xs">
                        {assignment.staffIds.length} staff
                      </Badge>
                    </div>
                    <div className="space-y-1">
                      {assignedStaffList.slice(0, 3).map((staff) => (
                        <p key={staff._id} className="text-xs text-gray-600">
                          • {staff.name}
                        </p>
                      ))}
                      {assignedStaffList.length > 3 && <p className="text-xs text-gray-600">• +{assignedStaffList.length - 3} more</p>}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="py-8 text-center">
              <Link className="text-muted-foreground mx-auto mb-4 h-12 w-12" />
              <p className="text-muted-foreground">No room-staff assignments yet</p>
              <p className={`text-muted-foreground ${isMobile ? 'text-xs' : 'text-sm'}`}>Click "Start Assign" to create assignment groups</p>
            </div>
          )}
        </CardContent>
      </Card>

      {savedSelections && !showAssignmentView && (
        <Card className="border-blue-200 bg-gradient-to-r from-blue-50 to-cyan-50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="mb-1 font-semibold text-blue-900">Saved Selections Available</h4>
                <p className="text-sm text-blue-700">
                  {savedSelections.roomIds.length} rooms, {savedSelections.staffIds.length} staff • Saved at{' '}
                  {savedSelections.savedAt instanceof Date
                    ? savedSelections.savedAt.toLocaleTimeString()
                    : new Date(savedSelections.savedAt).toLocaleTimeString()}
                </p>
              </div>
              <div className="flex space-x-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={loadSavedSelections}
                  className="border-blue-300 bg-transparent text-blue-700 hover:bg-blue-100"
                >
                  Load
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={clearSavedSelections}
                  className="border-red-300 bg-transparent text-red-700 hover:bg-red-100"
                >
                  Clear
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
