/**
 * Represents a closed time interval within a business day
 */
export type ClosedInterval = {
    startTime: string;  // Format: "HH:MM" (24-hour)
    endTime: string;    // Format: "HH:MM" (24-hour)
  };
  
  /**
   * Represents a business day configuration from the API
   */
  export type BusinessDayConfig = {
    _id: string;
    businessId: string;
    dayOfWeek: number;        // 0-6 (Sunday-Saturday)
    startTime: string;        // Format: "HH:MM"
    endTime: string;          // Format: "HH:MM"
    isOpen: boolean;          // Whether the business is open on this day
    closedIntervals: ClosedInterval[]; // Periods within the day when bookings are not allowed
    archived_at: null | string;
    createdAt: string;
    updatedAt: string;
    __v: number;
  };
  
  /**
   * API response format for business day configurations
   */
  export type BusinessDayConfigResponse = {
    status: number;
    data: BusinessDayConfig[];
    message: string;
  };
  
  /**
   * Payload for updating a business day configuration
   */
  export type UpdateBusinessDayConfigPayload = {
    dayOfWeek: number;
    startTime: string;
    endTime: string;
    closedIntervals: ClosedInterval[];
    isOpen: boolean;
  };
  
  /**
   * Interface for the UI state of a day configuration being edited
   */
  export interface DayConfigEditState {
    dayOfWeek: number;
    startTime: string;
    endTime: string;
    closedIntervals: ClosedInterval[];
    isOpen: boolean;
  }