import type { selectedUsersDetails } from '@/hooks/useCoupon';
import { create } from 'zustand';

export type CouponFlow =
  | 'CREATE'
  | 'EDIT'
  | 'MANAGE'
  | 'INFO'
  | ''
  | 'DETAILS'
  | 'AVAILABLE'
  | 'EXPIRED'
  | 'ELIGIBILITY'
  | 'PREVIEW'
  | 'CUSTOM'
  | 'GRABBING'
  | 'Terms'
  | 'ANALYTICS'
  | 'ANALYTICS_INFO'
  | 'LINK_CHANNELS'
  | 'CHANNELS';

export type CouponType = 'PERCENTAGE' | 'AMOUNT';

export type availability = 'allthetime' | 'weekdays' | 'weekends' | 'birthdayweek' | 'birthdaymonth' | 'custom';

export type eligibilityModal = 'people' | 'group' | '';

export type expiryClaimLimit = 'NO_LIMIT' | 'SET_LIMIT';

interface ICoupon {
  selectedPage: CouponFlow;
  setSelectedPage: (page: CouponFlow) => void;

  couponName: string;
  setCouponName: (name: string) => void;

  couponType: CouponType;
  setCouponType: (type: CouponType) => void;

  couponPrice: number;
  setCouponPrice: (price: number) => void;

  addMinimumBillAmount: boolean;
  setAddMinimumBillAmount: (value: boolean) => void;

  couponPercentage: number;
  setCouponPercentage: (percentage: number) => void;

  couponDiscount: number;
  setCouponDiscount: (discount: number) => void;

  openAvailableModal: boolean;
  setOpenAvailableModal: (value: boolean) => void;

  when: availability;
  setWhen: (value: availability) => void;

  customDays: string[];
  setCustomDays: (value: string[]) => void;

  expiryCoupon: string;
  setExpiryCoupon: (value: string) => void;

  noOfClaims: number;
  setNoOfClaims: (value: number) => void;

  expiryModal: boolean;
  setExpiryModal: (value: boolean) => void;

  couponStartDate: number | null;
  setCouponStartDate: (value: number | null) => void;

  couponEndDate: number | null;
  setCouponEndDate: (value: number | null) => void;

  showDatePicker: boolean;
  setShowDatePicker: (value: boolean) => void;

  overAllLimit: number;
  setOverAllLimit: (value: number) => void;

  expiryAfterGrabbed: number;
  setExpiryAfterGrabbed: (value: number) => void;

  couponForEveryOne: boolean;
  setCouponForEveryOne: (value: boolean) => void;

  eligibilityModal: boolean;
  setEligibilityModal: (value: boolean) => void;

  eligibilityType: eligibilityModal;
  setEligibilityType: (value: eligibilityModal) => void;
  selectedUserIds: string[];
  setSelectedUserIds: (ids: string[]) => void;

  selectedGroupIds: string[];
  setSelectedGroupIds: (ids: string[]) => void;

  expiryClaimLimit: expiryClaimLimit;
  setExpiryClaimLimit: (value: expiryClaimLimit) => void;

  expiryClaimLimitValue: number;
  setExpiryClaimLimitValue: (value: number) => void;

  couponId: string;
  setCouponId: (value: string) => void;

  minimumBillAmount: number;
  setMinimumBillAmount: (value: number) => void;

  startTime: number;
  setStartTime: (value: number) => void;

  endTime: number;
  setEndTime: (value: number) => void;

  extendedEndTime: number;
  setExtendedEndTime: (value: number) => void;

  bgColor: string;
  setBgColor: (value: string) => void;

  couponImage: string;
  setCouponImage: (value: string) => void;

  isPublish: boolean;
  setIsPublish: (value: boolean) => void;

  promoteOnBill: boolean;
  setPromoteOnBill: (value: boolean) => void;

  promote: boolean;
  setPromote: (value: boolean) => void;

  cashbackAvailable: boolean;
  setCashbackAvailable: (value: boolean) => void;

  requiredFields: string[];
  setRequiredFields: (value: string[]) => void;

  termsAndConditions: string;
  setTermsAndConditions: (value: string) => void;

  allowLateNight: boolean;
  setAllowLateNight: (value: boolean) => void;

  isActive: boolean;
  setIsActive: (value: boolean) => void;

  selectedUsers: selectedUsersDetails[];
  addUser: (user: selectedUsersDetails) => void;
  removeUser: (userId: string) => void;
  setSelectedUsers: (users: selectedUsersDetails[]) => void;

  resetCouponState: () => void;

  links: { channelId: { _id: string; name: string }; link: string }[];
  setLinks: (links: { channelId: { _id: string; name: string }; link: string }[]) => void;

  filter: 'active' | 'inactive';
  setFilter: (value: 'active' | 'inactive') => void;
}

const useCouponsStore = create<ICoupon>((set) => ({
  selectedPage: 'MANAGE',
  setSelectedPage: (page: CouponFlow) => set(() => ({ selectedPage: page })),

  couponName: '',
  setCouponName: (name: string) => set(() => ({ couponName: name })),

  couponType: 'PERCENTAGE',
  setCouponType: (type: CouponType) => set(() => ({ couponType: type })),

  couponPrice: 0,
  setCouponPrice: (price: number) => set(() => ({ couponPrice: price })),

  addMinimumBillAmount: false,
  setAddMinimumBillAmount: (value: boolean) => set(() => ({ addMinimumBillAmount: value })),

  couponPercentage: 0,
  setCouponPercentage: (percentage: number) => set(() => ({ couponPercentage: percentage })),

  couponDiscount: 0,
  setCouponDiscount: (discount: number) => set(() => ({ couponDiscount: discount })),

  openAvailableModal: false,
  setOpenAvailableModal: (value: boolean) => set(() => ({ openAvailableModal: value })),

  when: 'allthetime',
  setWhen: (value: availability) => set(() => ({ when: value })),

  customDays: [],
  setCustomDays: (value: string[]) => set(() => ({ customDays: value })),

  expiryCoupon: '',
  setExpiryCoupon: (value: string) => set(() => ({ expiryCoupon: value })),

  noOfClaims: 0,
  setNoOfClaims: (value: number) => set(() => ({ noOfClaims: value })),

  expiryModal: false,
  setExpiryModal: (value: boolean) => set(() => ({ expiryModal: value })),

  couponStartDate: null,
  setCouponStartDate: (timestamp: number | null) => set(() => ({ couponStartDate: timestamp })),

  couponEndDate: null,
  setCouponEndDate: (timestamp: number | null) => set(() => ({ couponEndDate: timestamp })),

  showDatePicker: false,
  setShowDatePicker: (value: boolean) => set(() => ({ showDatePicker: value })),

  overAllLimit: 0,
  setOverAllLimit: (value: number) => set(() => ({ overAllLimit: value })),

  expiryAfterGrabbed: 0,
  setExpiryAfterGrabbed: (value: number) => set(() => ({ expiryAfterGrabbed: value })),

  couponForEveryOne: true,
  setCouponForEveryOne: (value: boolean) => set(() => ({ couponForEveryOne: value })),

  eligibilityModal: false,
  setEligibilityModal: (value: boolean) => set(() => ({ eligibilityModal: value })),

  eligibilityType: '',
  setEligibilityType: (value: eligibilityModal) => set(() => ({ eligibilityType: value })),

  selectedUserIds: [],
  setSelectedUserIds: (ids: string[]) => set(() => ({ selectedUserIds: ids })),

  selectedGroupIds: [],
  setSelectedGroupIds: (ids: string[]) => set(() => ({ selectedGroupIds: ids })),

  expiryClaimLimit: 'NO_LIMIT',
  setExpiryClaimLimit: (value: expiryClaimLimit) => set(() => ({ expiryClaimLimit: value })),

  expiryClaimLimitValue: 0,
  setExpiryClaimLimitValue: (value: number) => set(() => ({ expiryClaimLimitValue: value })),

  couponId: '',
  setCouponId: (value: string) => set(() => ({ couponId: value })),

  minimumBillAmount: 0,
  setMinimumBillAmount: (value: number) => set(() => ({ minimumBillAmount: value })),

  startTime: 0,
  setStartTime: (value: number) => set(() => ({ startTime: value })),
  endTime: 0,
  setEndTime: (value: number) => set(() => ({ endTime: value })),

  bgColor: '#9267EC',
  setBgColor: (value: string) => set(() => ({ bgColor: value })),

  couponImage: '',
  setCouponImage: (value: string) => set(() => ({ couponImage: value })),

  isPublish: false,
  setIsPublish: (value: boolean) => set(() => ({ isPublish: value })),

  promoteOnBill: false,
  setPromoteOnBill: (value: boolean) => set(() => ({ promoteOnBill: value })),

  promote: false,
  setPromote: (value: boolean) => set(() => ({ promote: value })),

  cashbackAvailable: false,
  setCashbackAvailable: (value: boolean) => set(() => ({ cashbackAvailable: value })),

  requiredFields: [],
  setRequiredFields: (value: string[]) => set(() => ({ requiredFields: value })),

  termsAndConditions: '',
  setTermsAndConditions: (value: string) => set(() => ({ termsAndConditions: value })),

  extendedEndTime: 0,
  setExtendedEndTime: (value: number) => set(() => ({ extendedEndTime: value })),

  allowLateNight: false,
  setAllowLateNight: (value: boolean) => set(() => ({ allowLateNight: value })),

  isActive: false,
  setIsActive: (value: boolean) => set(() => ({ isActive: value })),

  links: [],
  setLinks: (links: { channelId: { _id: string; name: string }; link: string }[]) => set(() => ({ links: links })),

  selectedUsers: [],

  setSelectedUsers: (users: selectedUsersDetails[]) => set(() => ({ selectedUsers: users })),

  addUser: (user: selectedUsersDetails) =>
    set((state) => ({
      selectedUsers: [...state.selectedUsers, user],
    })),

  removeUser: (userId: string) =>
    set((state) => ({
      selectedUsers: state.selectedUsers.filter((user) => user._id !== userId),
    })),

  filter: 'active',
  setFilter: (value: 'active' | 'inactive') => set(() => ({ filter: value })),

  resetCouponState: () =>
    set(() => ({
      couponName: '',
      couponType: 'PERCENTAGE',
      couponId: '',
      couponPrice: 0,
      couponPercentage: 0,
      couponDiscount: 0,
      addMinimumBillAmount: false,
      when: 'allthetime',
      customDays: [],
      expiryCoupon: '',
      noOfClaims: 0,
      couponStartDate: null,
      couponEndDate: null,
      showDatePicker: false,
      overAllLimit: 0,
      expiryAfterGrabbed: 0,
      couponForEveryOne: true,
      eligibilityType: '',
      selectedUserIds: [],
      selectedGroupIds: [],
      expiryClaimLimit: 'NO_LIMIT',
      expiryClaimLimitValue: 0,
      minimumBillAmount: 0,
      startTime: 0,
      endTime: 0,
      extendedEndTime: 0,
      bgColor: '#9267EC',
      couponImage: '',
      isPublish: false,
      promoteOnBill: false,
      promote: false,
      cashbackAvailable: false,
      requiredFields: [],
      termsAndConditions: '',
      allowLateNight: false,
    })),
}));

export default useCouponsStore;
