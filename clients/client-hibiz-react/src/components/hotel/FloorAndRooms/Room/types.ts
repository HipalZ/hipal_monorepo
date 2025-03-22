// Original interfaces for single room creation
export interface RoomFormData {
  name: string
  roomTypeId: string
  staffIds: string[]
  zoneId: string
}

export interface RoomFormErrors {
  name?: string
  roomTypeId?: string
  staffIds?: string
  zoneId?: string
  range?: string
  [key: string]: string | undefined
}

export interface StepProps {
  formData: RoomFormData
  errors: RoomFormErrors
  handleChange: (field: string, value: any) => void
  toggleStaff?: (staffId: string) => void
}

// New interfaces for bulk room creation
export interface BulkRoomFormData {
  roomTypeId: string
  staffIds: string[]
  zoneId: string
}

export interface BulkRoomNamingProps {
  usePrefix: boolean
  setUsePrefix: (value: boolean) => void
  prefix: string
  setPrefix: (value: string) => void
  rangeStart: string
  setRangeStart: (value: string) => void
  rangeEnd: string
  setRangeEnd: (value: string) => void
  errors: RoomFormErrors
  previewNames: string[]
  formData: BulkRoomFormData
  handleChange: (field: string, value: any) => void
}

export interface BulkPreviewProps {
  previewNames: string[]
  selectedRoomTypeId: string
  selectedFloorId: string
  selectedStaffIds: string[]
}

