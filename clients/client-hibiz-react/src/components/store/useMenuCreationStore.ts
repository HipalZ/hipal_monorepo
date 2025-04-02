import { create } from "zustand"

export enum MenuType {
  MAIN_SUB_DISH = 1,
  SUB_DISH = 2,
}

export enum CategoryLayout {
  EDGE = 1,
  CLASSIC = 2,
}

export enum CardLayout {
  GRID = 1,
  HORIZONTAL = 2,
}

export enum WeekDay {
  SUNDAY = 1,
  MONDAY = 2,
  TUESDAY = 3,
  WEDNESDAY = 4,
  THURSDAY = 5,
  FRIDAY = 6,
  SATURDAY = 7,
}

export interface Category {
  _id: string
  name: string
  coverImage?: string
  dishIds?: string[]
}

export interface Dish {
  _id: string
  name: string
  price: number
  description?: string
  images?: string[]
}

export interface MenuLayout {
  _id: string
  name: string
  menuType: MenuType
  categoryLayout: CategoryLayout
  cardLayout: CardLayout
  primaryColor: string
  secondaryColor: string
  zoneIds: string[]
  days: WeekDay[]
  startTime: number
  endTime: number
  isActive?: boolean
  isDeleted?: boolean
}

interface MenuCreationState {

  copyMenuLayoutId: string | null
  copyCompleteMenu: boolean
  sourceMenuName: string

  showCopyMenuConfirmModal: boolean
  setShowCopyMenuConfirmModal: (show: boolean) => void

  currentStep: number
  menuType: MenuType | null
  categoryLayout: CategoryLayout | null
  cardLayout: CardLayout | null
  primaryColor: string
  secondaryColor: string

  // New fields for additional steps
  name: string
  selectedZoneIds: string[]
  selectedDays: WeekDay[]
  startTime: number
  endTime: number

  editingMenuId: string

  showCreationFlow: boolean
  setShowCreationFlow: (show: boolean) => void

  // Actions
  setCurrentStep: (step: number) => void
  setMenuType: (type: MenuType) => void
  setCategoryLayout: (layout: CategoryLayout) => void
  setCardLayout: (layout: CardLayout) => void
  setColors: (primary: string, secondary: string) => void
  resetStore: () => void
  goPreviousStep: () => void

  // New actions
  setMenuName: (name: string) => void
  setSelectedZoneIds: (zoneIds: string[]) => void
  toggleZoneSelection: (zoneId: string) => void
  toggleSelectedDay: (day: WeekDay) => void
  setTimeRange: (start: number, end: number) => void
  setEditingMenuId: (menuId: string) => void

  // New function to set all menu data at once
  setMenuData: (menu: MenuLayout) => void

  // Computed
  getPayload: () => MenuCreationPayload
  canProceed: () => boolean

  setCopyMenuLayoutId: (id: string | null) => void
  setCopyCompleteMenu: (copy: boolean) => void
  setSourceMenuName: (name: string) => void
}

export interface MenuCreationPayload {
  menuType: MenuType | null
  categoryLayout: CategoryLayout | null
  cardLayout: CardLayout | null
  primaryColor: string
  secondaryColor: string
  name: string
  zoneIds: string[]
  days: WeekDay[]
  startTime: number
  endTime: number
  copyCompleteMenu?: boolean
  sourceMenuId?: string
}

const initialState = {
  copyMenuLayoutId: null,
  sourceMenuId: null,
  copyCompleteMenu: false,
  sourceMenuName: "",
  currentStep: 1,
  menuType: null,
  categoryLayout: null,
  cardLayout: null,
  primaryColor: "#ec4899",
  secondaryColor: "#fce7f3",
  name: "",
  selectedZoneIds: [],
  selectedDays: [1, 2, 3, 4, 5, 6, 7],
  startTime: 240,
  endTime: 239,
  editingMenuId: "",
}

export const useMenuCreationStore = create<MenuCreationState>()((set, get) => ({
  ...initialState,

  showCreationFlow: false,
  setShowCreationFlow: (show) => set({ showCreationFlow: show }),

  showCopyMenuConfirmModal: false,
  setShowCopyMenuConfirmModal: (show) => set({ showCopyMenuConfirmModal: show }),

  setCopyMenuLayoutId: (id: string | null) => set({ copyMenuLayoutId: id }),
  setCopyCompleteMenu: (copy: boolean) => set({ copyCompleteMenu: copy }),
  setSourceMenuName: (name: string) => set({ sourceMenuName: name }),

  setCurrentStep: (step) => set({ currentStep: step }),

  setMenuType: (type) =>
    set({
      menuType: type,
    }),

  setCategoryLayout: (layout) =>
    set({
      categoryLayout: layout,
    }),

  setCardLayout: (layout) =>
    set({
      cardLayout: layout,
    }),

  setColors: (primary, secondary) =>
    set({
      primaryColor: primary,
      secondaryColor: secondary,
    }),

  setMenuName: (name) => set({ name: name }),

  setEditingMenuId: (menuId) => set({ editingMenuId: menuId }),

  setSelectedZoneIds: (zoneIds) => set({ selectedZoneIds: zoneIds }),

  toggleZoneSelection: (zoneId) =>
    set((state) => {
      const zones = [...state.selectedZoneIds]
      const index = zones.indexOf(zoneId)

      if (index === -1) {
        zones.push(zoneId)
      } else {
        zones.splice(index, 1)
      }

      return { selectedZoneIds: zones }
    }),

  toggleSelectedDay: (day) =>
    set((state) => {
      const days = [...state.selectedDays]
      const index = days.indexOf(day)

      if (index === -1) {
        days.push(day)
      } else {
        days.splice(index, 1)
      }

      return { selectedDays: days }
    }),

  setTimeRange: (start: number, end: number) =>
    set({
      startTime: start,
      endTime: end,
    }),

  setMenuData: (menu: MenuLayout) =>
    set({
      editingMenuId: menu._id,
      menuType: menu.menuType,
      categoryLayout: menu.categoryLayout,
      cardLayout: menu.cardLayout,
      primaryColor: menu.primaryColor,
      secondaryColor: menu.secondaryColor,
      name: menu.name,
      selectedZoneIds: menu.zoneIds,
      selectedDays: menu.days,
      startTime: menu.startTime,
      endTime: menu.endTime,
      currentStep: 8,
    }),

  resetStore: () => set(initialState),

  goPreviousStep: () =>
    set((state) => ({
      currentStep: state.currentStep > 1 ? state.currentStep - 1 : 1,
    })),

  getPayload: () => {
    const payload: MenuCreationPayload = {
      menuType: get().menuType,
      categoryLayout: get().categoryLayout,
      cardLayout: get().cardLayout,
      primaryColor: get().primaryColor,
      secondaryColor: get().secondaryColor,
      name: get().name,
      zoneIds: get().selectedZoneIds,
      days: get().selectedDays,
      startTime: get().startTime,
      endTime: get().endTime,
    }

    // Add copy properties if copying a menu
    if (get().copyMenuLayoutId) {
      payload.sourceMenuId = get().copyMenuLayoutId

      if (get().copyCompleteMenu) {
        payload.copyCompleteMenu = true
      }
    }

    return payload
  },

  canProceed: () => {
    const { currentStep, menuType, categoryLayout, cardLayout, name, selectedZoneIds } = get()
    switch (currentStep) {
      case 1:
        return menuType !== null
      case 2:
        return categoryLayout !== null
      case 3:
        return cardLayout !== null
      case 4:
        return true
      case 5:
        return name.trim() !== ""
      case 6:
        return name.trim() !== "" && selectedZoneIds.length > 0
      case 7:
        return true
      case 8:
        return true
      default:
        return true
    }
  },
}))

