import { format } from 'date-fns';
import { AlertTriangle, CheckCheck, CheckCircle, Clock, ShieldAlert, XCircle } from 'lucide-react';
import { useCallback } from 'react';
import type { IconType } from 'react-icons';
import { AiOutlineStar } from 'react-icons/ai';
import { LuHotel } from 'react-icons/lu';
import { MdOutlineHistory, MdOutlineNotificationsActive } from 'react-icons/md';
import { NavItemsHotelEnum, type NavItemHotelTypes } from '../types/hotelData';

export function hotelNavItems(): Array<{
  type: NavItemHotelTypes;
  icon: IconType;
}> {
  const navItems = [
    { type: NavItemsHotelEnum.Rooms, icon: LuHotel },
    { type: NavItemsHotelEnum.Alerts, icon: MdOutlineNotificationsActive },
    { type: NavItemsHotelEnum.Escalation, icon: ShieldAlert as IconType },
    { type: NavItemsHotelEnum.History, icon: MdOutlineHistory },
    { type: NavItemsHotelEnum.Reviews, icon: AiOutlineStar },
  ];
  return navItems;
}

export const useAlertsColors = () => {
  // Get status color
  const getStatusColor = useCallback((progress: string) => {
    switch (progress) {
      case 'CREATED':
        return 'bg-amber-100 text-black border-amber-200';
      case 'ACCEPTED':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'REJECTED':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'NON_ACCEPTED_AND_WARNING':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'IS_ACCEPTED_AND_WARNING':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'DELIVERED':
        return 'bg-gradient-to-r from-blue-400 to-blue-600 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  }, []);

  // Get status icon
  const getStatusIcon = useCallback((progress: string) => {
    switch (progress) {
      case 'CREATED':
        return <Clock className="h-4 w-4" />;
      case 'ACCEPTED':
        return <CheckCircle className="h-4 w-4" />;
      case 'REJECTED':
        return <XCircle className="h-4 w-4" />;
      case 'DELIVERED':
        return <CheckCheck className="h-4 w-4" />;
      default:
        return <AlertTriangle className="h-4 w-4" />;
    }
  }, []);

  // border color
  const borderColor = useCallback((progress: string) => {
    const a: Record<string, string> = {
      CREATED: '#10b981',
      ACCEPTED: '#1E88E5',
      REJECTED: '#ef4444',
      DELIVERED: '#3b82f6',
      WARNING: '#FFA500',
      NON_ACCEPTED_AND_WARNING: '#FFA500',
      IS_ACCEPTED_AND_WARNING: '#FFA500',
      ESCALATION: '#ef4444',
      NON_ACCEPTED_AND_ESCALATION: '#ef4444',
      IS_ACCEPTED_AND_ESCALATION: '#ef4444',
      NOT_DELIVERED: '#FF0000',
    };

    return a[progress] || '#d1d5db';
  }, []);

  const getStatusStyles = useCallback((status: string) => {
    switch (status) {
      case 'AVAILABLE':
        return {
          dot: 'bg-green-500',
          text: 'text-green-700',
          border: 'border-green-500',
          gradient: 'from-green-200/20 to-transparent',
          badge: 'bg-green-100',
        };
      case 'BOOKED':
        return {
          dot: 'bg-amber-500',
          text: 'text-amber-700',
          border: 'border-amber-500',
          gradient: 'from-amber-200/20 to-transparent',
          badge: 'bg-amber-100',
        };
      case 'OCCUPIED':
        return {
          dot: 'bg-[#1E88E5]',
          text: 'text-[#1E88E5]',
          border: 'border-[#1E88E5]',
          gradient: 'from-blue-[#1E88E5]/20 to-transparent',
          badge: 'bg-blue-[#1E88E5]',
        };
      case 'MAINTENANCE':
        return {
          dot: 'bg-red-500',
          text: 'text-red-700',
          border: 'border-red-500',
          gradient: 'from-red-200/20 to-transparent',
          badge: 'bg-red-100',
        };
      // A checked-out room being readied for the next guest. Distinct orange so
      // it never reads as amber BOOKED. Derived from open checkout tasks — the
      // room stays AVAILABLE in the DB, so booking is never blocked.
      case 'CLEANING':
        return {
          dot: 'bg-orange-500',
          text: 'text-orange-700',
          border: 'border-orange-500',
          gradient: 'from-orange-200/30 to-transparent',
          badge: 'bg-orange-100',
        };
      default:
        return {
          dot: 'bg-gray-500',
          text: 'text-gray-700',
          border: 'border-gray-500',
          gradient: 'from-gray-200/20 to-transparent',
          badge: 'bg-gray-100',
        };
    }
  }, []);

  const getSortLabel = (option: SortOption) => {
    switch (option) {
      case 'newest':
        return 'Newest First';
      case 'oldest':
        return 'Oldest First';
      case 'roomAsc':
        return 'Room (A-Z)';
      case 'roomDesc':
        return 'Room (Z-A)';
      case 'fastest':
        return 'Fastest Completion';
      case 'slowest':
        return 'Slowest Completion';
    }
  };

  return {
    statusOptions,
    getStatusColor,
    getStatusIcon,
    borderColor,
    getStatusStyles,
    getSortLabel,
  };
};

export const useFormatTimes = () => {
  const formatTimestamp = (timestamp: number) => {
    return format(new Date(timestamp), 'MMM d, h:mm a');
  };

  // Format date only
  const formatDate = (timestamp: number) => {
    return format(new Date(timestamp), 'MMM d, yyyy');
  };

  return { formatTimestamp, formatDate };
};

export type SortOption = 'newest' | 'oldest' | 'roomAsc' | 'roomDesc' | 'fastest' | 'slowest';
export const statusOptions = ['CREATED', 'ACCEPTED', 'REJECTED', 'DELIVERED'];
export enum ActionType {
  NotDelivered = 'Not delivered',
  ReviewAndThanks = 'Review & Thanks',
  Delivered = 'Delivered',
  ESCALATION = 'Escalation',
  WARNING = 'WARNING',
}

export const actionOptions = [{ id: 'review', text: ActionType.ReviewAndThanks }];

export const reviewOptions = [
  { id: 'bad', text: '😞', value: 1 },
  { id: 'good', text: '😊', value: 3 },
  { id: 'great', text: '😍', value: 5 },
];

export const formatHotelTime = (timestamp: number) => {
  return format(new Date(timestamp), 'h:mm a');
};
