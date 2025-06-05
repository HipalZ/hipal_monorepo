import { create } from "zustand";
import type {
  ICoinzUsage,
  IHistory,
  Payment,
  Tag,
  TagDetails,
  UserDashboardDetails,
  UserTags,
  UserUpdateTag,
  SummarizedPeopleData,
  IUserGroup,
  INotes,
} from "../types/businessData";
import { DatePickerEnum } from "../types/businessData";
import type {
  ImageFiles,
  ImagePreviews,
  SetImagePreviewsFunction,
} from "./useExploreStore";

export interface ITag {
  tagId: string;
  name: string;
  count: number | null;
  countType: "ABOVE" | "BELOW" | "EQUALS" | "";
}

export type HiPeoplePages =
  | "SUMMARY"
  | "CLIENTS"
  | "TARGET GROUPS"
  | "TAGZ"
  | "ACTIONS"
  | "CHECK IN USERS"

export type NavItems =
  | "RECENT BILLS"
  | "TAGS & NOTES"
  | "COINZ USAGE"
  | "ADD TAGZ"
  | "ADD NOTES";

export type AddToGroup =
  | "ADD TO GROUP"
  | "CREATE GROUP"
  | "CONFIRM"
  | ""
  | "ADD MORE USERS";

export type DatePicker = "TODAY" | "YESTERDAY" | "ONE MONTH" | "CUSTOM DATE";
export type TargetGroupsPages =
  | "USERS"
  | "CREATE GROUP"
  | "GROUP DETAILS"
  | ""
  | "EDIT GROUP"
  | "ADD TAGS";

export interface FilterValue {
  value: string;
  type: "ABOVE" | "BELOW" | "EQUAL" | "";
}

export interface Filter {
  label: string;
  key: keyof FilterValues;
  heading: string;
}

export interface FilterValues {
  visit: FilterValue;
  spend: FilterValue;
  cardBalance: FilterValue;
  coinzIssued: FilterValue;
  coinzUsed: FilterValue;
}

export interface GroupData {
  name: string;
  description: string;
  groupType: "MANUAL" | "DYNAMIC";
  groupColor: string;
  filters: Filter[];
  filterValues: FilterValues;
  durationType?: "days" | "months" | "years" | "";
  durationValue?: string;
}

const today = new Date();
const startOfToday = new Date(
  today.getFullYear(),
  today.getMonth(),
  today.getDate(),
  0,
  0,
  0,
  0,
).getTime();
const endOfToday = new Date(
  today.getFullYear(),
  today.getMonth(),
  today.getDate(),
  23,
  59,
  59,
  999,
).getTime();

interface IHiPeople {
  selectedPage: HiPeoplePages;
  setSelectedPage: (page: HiPeoplePages) => void;

  addGroupPage: AddToGroup;
  setAddGroupPage: (page: AddToGroup) => void;

  selectedUserIds: string[];

  toggleUserSelection: (id: string) => void;

  selectAllUsers: (ids: string[]) => void;

  clearAllUsers: () => void;

  selectedNavItem: NavItems;
  setSelectedNavItem: (item: NavItems) => void;

  openBillPopup: boolean;
  setOpenBillPopup: (open: boolean) => void;

  singleBillData: Payment;
  setSingleBillData: (data: Payment) => void;

  tagNotesData: TagDetails;
  setTagNotesData: (data: TagDetails) => void;

  singleTagData: Tag;
  setSingleTagData: (data: Tag) => void;

  singleNotesData: INotes;
  setSingleNotesData: (data: INotes) => void;

  openTagPopup: boolean;
  setOpenTagPopup: (open: boolean) => void;

  peopleData: SummarizedPeopleData | null;
  setPeopleData: (data: SummarizedPeopleData) => void;

  dateRange: [Date, Date];
  setDateRange: (range: [Date, Date]) => void;

  selectedOption: DatePickerEnum;
  setSelectedOption: (option: DatePickerEnum) => void;

  openDatePickerModal: boolean;
  setOpenDatePickerModal: (open: boolean) => void;

  dateInTimeStamp: {
    from: number;
    to: number;
  };
  setDateInTimeStamp: (range: { from: number; to: number }) => void;

  addGroupModal: boolean;
  setAddGroupModal: (open: boolean) => void;

  selectedGroupId: string;
  setSelectedGroupId: (id: string) => void;

  selectedGroupName: string;
  setSelectedGroupName: (name: string) => void;

  reset: () => void;

  formData: {
    name: string;
    description: string;
    groupColor: string;
    groupType: string;
  };

  setFormData: (key: string, value: string) => void;
  userDashboardDetails: UserDashboardDetails;
  setUserDashboardDetails: (data: UserDashboardDetails) => void;

  tags: UserTags[];
  setTags: (tags: UserTags[]) => void;

  appliedUserTags: UserTags[];
  setAppliedUserTags: (tags: UserTags[]) => void;

  removeTagIds: string[];
  setRemoveTagIds: (updateFn: (prevIds: string[]) => string[]) => void;

  userTags: UserUpdateTag;
  setUserTags: (tags: UserUpdateTag) => void;

  userComment: string;
  setUserComment: (comment: string) => void;

  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;

  tagData: Tag;
  setTagData: (tag: Tag) => void;

  showRemainder: boolean;
  setShowRemainder: (show: boolean) => void;

  displayToCaptain: boolean;
  setDisplayToCaptain: (display: boolean) => void;

  userCoinzDetails: ICoinzUsage;
  setUserCoinzDetails: (data: ICoinzUsage) => void;

  openAddTagz: boolean;
  setOpenAddTagz: (open: boolean) => void;

  openAddNotes: boolean;
  setOpenAddNotes: (open: boolean) => void;

  imageFiles: File[];
  setImageFiles: (files: File[]) => void;

  cropping: {
    image: string;
    type: string;
  };
  setCropping: (crop: { image: string; type: string }) => void;

  showCropper: boolean;
  setShowCropper: (show: boolean) => void;

  img: ImagePreviews;
  setImg: SetImagePreviewsFunction;

  titleNotes: string;
  setTitleNotes: (title: string) => void;

  descriptionNotes: string;
  setDescriptionNotes: (description: string) => void;

  selectedDeleteTagId: string;
  setSelectedDeleteTagId: (id: string) => void;

  selectedDeleteNoteId: string;
  setSelectedDeleteNoteId: (id: string) => void;

  selectedTagId: string;
  setSelectedTagId: (id: string) => void;

  openDeletePopup: boolean;
  setOpenDeletePopup: (open: boolean) => void;

  openDeleteNotePopup: boolean;
  setOpenDeleteNotePopup: (open: boolean) => void;

  openCreateTagPopup: boolean;
  setOpenCreateTagPopup: (open: boolean) => void;

  openEditNotes: boolean;
  setOpenEditNotes: (open: boolean) => void;

  tagName: string;
  setTagName: (name: string) => void;

  tagNotes: string;
  setTagNotes: (notes: string) => void;

  tagType: string;
  setTagType: (type: string) => void;

  remainder: string;
  setRemainder: (remainder: string) => void;

  duration: string;
  setDuration: (duration: string) => void;

  time: string;
  setTime: (time: string) => void;

  history: IHistory[];
  setHistory: (history: IHistory[]) => void;

  openDisplayForCaptains: boolean;
  setOpenDisplayForCaptains: (open: boolean) => void;

  groupDetailsModal: boolean;
  setGroupDetailsModal: (open: boolean) => void;

  selectedGroup: IUserGroup;
  setSelectedGroup: (group: IUserGroup) => void;

  openEditTagPopup: boolean;
  setOpenEditTagPopup: (open: boolean) => void;

  notesData: INotes;
  setNotesData: (data: INotes) => void;
  selectedGroupPage: TargetGroupsPages;
  setSelectedGroupPage: (page: TargetGroupsPages) => void;

  groupData: GroupData;
  setGroupData: (data: Partial<GroupData>) => void;

  showDuration: boolean;
  setShowDuration: (show: boolean) => void;

  untilNow: boolean;
  setUntilNow: (untilNow: boolean) => void;

  addTags: ITag[];
  saveSelectedTags: (tags: ITag[]) => void;

  selectedTags: ITag[];
  clearSelectedTags: () => void;
}

const useHiPeopleStore = create<IHiPeople>((set, get) => ({
  selectedPage: "SUMMARY",
  setSelectedPage: (page: HiPeoplePages) => set({ selectedPage: page }),

  addGroupPage: "",
  setAddGroupPage: (page: AddToGroup) => set({ addGroupPage: page }),

  selectedUserIds: [],

  toggleUserSelection: (id: string) => {
    const selectedUserIds = get().selectedUserIds;
    if (selectedUserIds.includes(id)) {
      set({
        selectedUserIds: selectedUserIds.filter((userId) => userId !== id),
      });
    } else {
      set({ selectedUserIds: [...selectedUserIds, id] });
    }
  },

  selectAllUsers: (ids: string[]) => set({ selectedUserIds: ids }),

  clearAllUsers: () => set({ selectedUserIds: [] }),

  selectedNavItem: "RECENT BILLS",
  setSelectedNavItem: (item: NavItems) => set({ selectedNavItem: item }),

  openBillPopup: false,
  setOpenBillPopup: (open: boolean) => set({ openBillPopup: open }),

  singleBillData: {} as Payment,
  setSingleBillData: (data: Payment) => set({ singleBillData: data }),

  tagNotesData: {} as TagDetails,
  setTagNotesData: (data) => set({ tagNotesData: data }),

  singleTagData: {} as Tag,
  setSingleTagData: (data) => set({ singleTagData: data }),

  openTagPopup: false,
  setOpenTagPopup: (open: boolean) => set({ openTagPopup: open }),

  peopleData: null,
  setPeopleData: (data: SummarizedPeopleData) => set({ peopleData: data }),

  dateRange: [new Date(), new Date()],
  setDateRange: (range) => set({ dateRange: range }),

  selectedOption: DatePickerEnum.TODAY,
  setSelectedOption: (option: DatePickerEnum) =>
    set({ selectedOption: option }),

  openDatePickerModal: false,
  setOpenDatePickerModal: (open: boolean) => set({ openDatePickerModal: open }),

  dateInTimeStamp: {
    from: startOfToday,
    to: endOfToday,
  },
  setDateInTimeStamp: (range) => set({ dateInTimeStamp: range }),

  addGroupModal: false,
  setAddGroupModal: (open: boolean) => set({ addGroupModal: open }),

  selectedGroupId: "",
  setSelectedGroupId: (id: string) => set({ selectedGroupId: id }),

  selectedGroupName: "",
  setSelectedGroupName: (name: string) => set({ selectedGroupName: name }),

  formData: {
    name: "",
    description: "",
    groupColor: "#161616",
    groupType: "MANUAL",
  },
  setFormData: (key: string, value: string) =>
    set((state) => ({
      formData: {
        ...state.formData,
        [key]: value,
      },
    })),
  reset: () => {
    set({
      addGroupPage: "",
      openBillPopup: false,
      addGroupModal: false,
      selectedGroupId: "",
      selectedGroupName: "",
      addTags: [],
      formData: {
        name: "",
        description: "",
        groupColor: "#161616",
        groupType: "MANUAL",
      },
    });
  },
  userDashboardDetails: {} as UserDashboardDetails,
  setUserDashboardDetails: (data: UserDashboardDetails) =>
    set({ userDashboardDetails: data }),

  tags: [],
  setTags: (tags) => set({ tags }),

  appliedUserTags: [],
  setAppliedUserTags: (tags: UserTags[]) => set({ appliedUserTags: tags }),

  removeTagIds: [],
  setRemoveTagIds: (updateFn: (prevIds: string[]) => string[]) =>
    set((state) => ({
      removeTagIds: updateFn(state.removeTagIds),
    })),

  userTags: {} as UserUpdateTag,
  setUserTags: (tags) => set({ userTags: tags }),

  userComment: "",
  setUserComment: (comment) => set({ userComment: comment }),

  isLoading: false,
  setIsLoading: (loading) => set({ isLoading: loading }),

  tagData: {} as Tag,
  setTagData: (tag) => set({ tagData: tag }),

  showRemainder: false,
  setShowRemainder: (show) => set({ showRemainder: show }),

  displayToCaptain: false,
  setDisplayToCaptain: (display) => set({ displayToCaptain: display }),

  userCoinzDetails: {} as ICoinzUsage,
  setUserCoinzDetails: (data) => set({ userCoinzDetails: data }),

  openAddTagz: false,
  setOpenAddTagz: (open) => set({ openAddTagz: open }),

  openAddNotes: false,
  setOpenAddNotes: (open) => set({ openAddNotes: open }),

  imageFiles: { banner: null, logo: null, footer: null } as ImageFiles,
  setImageFiles: (files: Partial<ImageFiles>) =>
    set((state) => ({
      imageFiles: { ...state.imageFiles, ...files },
    })),

  cropping: { image: "", type: "" },
  setCropping: (crop: { image: string; type: string }) =>
    set({ cropping: crop }),

  showCropper: false,
  setShowCropper: (show) => set({ showCropper: show }),

  img: {
    banner: null,
    logo: null,
    footer: null,
  } as ImagePreviews,
  setImg: (
    previews: ImagePreviews | ((prev: ImagePreviews) => ImagePreviews),
  ) =>
    set((state) => ({
      img: typeof previews === "function" ? previews(state.img) : previews,
    })),

  titleNotes: "",
  setTitleNotes: (title) => set({ titleNotes: title }),

  descriptionNotes: "",
  setDescriptionNotes: (description) => set({ descriptionNotes: description }),

  selectedDeleteTagId: "",
  setSelectedDeleteTagId: (id) => set({ selectedDeleteTagId: id }),

  selectedDeleteNoteId: "",
  setSelectedDeleteNoteId: (id) => set({ selectedDeleteNoteId: id }),

  openDeleteNotePopup: false,
  setOpenDeleteNotePopup: (open) => set({ openDeleteNotePopup: open }),

  selectedTagId: "",
  setSelectedTagId: (id) => set({ selectedTagId: id }),

  openDeletePopup: false,
  setOpenDeletePopup: (open) => set({ openDeletePopup: open }),

  openCreateTagPopup: false,
  setOpenCreateTagPopup: (open) => set({ openCreateTagPopup: open }),

  openEditNotes: false,
  setOpenEditNotes: (open) => set({ openEditNotes: open }),

  singleNotesData: {} as INotes,
  setSingleNotesData: (data) => set({ singleNotesData: data }),

  tagName: "",
  setTagName: (name) => set({ tagName: name }),

  tagNotes: "",
  setTagNotes: (notes) => set({ tagNotes: notes }),

  tagType: "",
  setTagType: (type) => set({ tagType: type }),

  remainder: "",
  setRemainder: (remainder) => set({ remainder: remainder }),

  duration: "",
  setDuration: (duration) => set({ duration: duration }),

  time: "",
  setTime: (time) => set({ time: time }),

  history: [],
  setHistory: (history) => set({ history: history }),

  openDisplayForCaptains: false,
  setOpenDisplayForCaptains: (open) => set({ openDisplayForCaptains: open }),

  groupDetailsModal: false,
  setGroupDetailsModal: (open: boolean) => set({ groupDetailsModal: open }),

  selectedGroup: {} as IUserGroup,
  setSelectedGroup: (group) => set({ selectedGroup: group }),
  openEditTagPopup: false,
  setOpenEditTagPopup: (open) => set({ openEditTagPopup: open }),

  notesData: {},
  setNotesData: (data) => set({ notesData: data }),

  selectedGroupPage: "",
  setSelectedGroupPage: (page) => set({ selectedGroupPage: page }),

  groupData: {
    name: "",
    description: "",
    groupType: "MANUAL",
    groupColor: "#E43065",
    filters: [
      {
        label: "By visits",
        key: "visit",
        heading: "Every bill is considered as a visit",
      },
      {
        label: "Avg bill value",
        key: "spend",
        heading: "Avg bill spend in the selected period",
      },
      {
        label: "Card Balance",
        key: "cardBalance",
        heading: "Avg loyalty spend in the selected period",
      },
      {
        label: "Coinz rewarded",
        key: "coinzIssued",
        heading: "Avg coinz rewarded in the selected period",
      },
      {
        label: "Coinz used",
        key: "coinzUsed",
        heading: "Avg coinz used in the selected period",
      },
    ],
    filterValues: {
      visit: { value: "", type: "" },
      spend: { value: "", type: "" },
      cardBalance: { value: "", type: "" },
      coinzIssued: { value: "", type: "" },
      coinzUsed: { value: "", type: "" },
    },
    durationType: "days",
    durationValue: "",
  },
  setGroupData: (data) =>
    set((state) => ({
      groupData: { ...state.groupData, ...data },
    })),

  showDuration: false,
  setShowDuration: (show) => set({ showDuration: show }),

  untilNow: false,
  setUntilNow: (untilNow) => set({ untilNow }),

  addTags: [],
  saveSelectedTags: (tags) => set({ addTags: tags }),

  selectedTags: [],
  clearSelectedTags: () => set({ selectedTags: [] }),
}));

export default useHiPeopleStore;
