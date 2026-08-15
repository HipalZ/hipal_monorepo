import { create } from 'zustand'
import type { Alert } from '../types/hotelData'

interface AlertsState {
  // UI states
  isLoading: string | null
  showOrderDetails: string | null
  searchQuery: string
  selectedRooms: string[]
  selectedServices: string[]
  selectedStatuses: string[]
  
  // Data
  alerts: Alert[] | null
  filteredAlerts: Alert[]
  
  // Actions
  setAlerts: (alerts: Alert[] | null) => void
  setIsLoading: (id: string | null) => void
  setShowOrderDetails: (id: string | null) => void
  setSearchQuery: (query: string) => void
  toggleRoomFilter: (room: string) => void
  toggleServiceFilter: (serviceId: string) => void
  toggleStatusFilter: (status: string) => void
  clearFilters: () => void
  
  // Computed values
  getUniqueRooms: () => string[]
  getUniqueServices: () => Array<{ id: string, name: string }>
  hasActiveFilters: () => boolean
}

export const useAlertsStore = create<AlertsState>((set, get) => ({
  // Initial state
  isLoading: null,
  showOrderDetails: null,
  searchQuery: "",
  selectedRooms: [],
  selectedServices: [],
  selectedStatuses: [],
  alerts: null,
  filteredAlerts: [],
  
  // Setters
  setAlerts: (alerts) => {
    set({ alerts })
    // Update filtered alerts when alerts change
    const state = get()
    set({ 
      filteredAlerts: filterAlerts(
        alerts, 
        state.searchQuery, 
        state.selectedRooms, 
        state.selectedServices, 
        state.selectedStatuses
      ) 
    })
  },
  
  setIsLoading: (id) => set({ isLoading: id }),
  setShowOrderDetails: (id) => set({ showOrderDetails: id }),
  
  setSearchQuery: (query) => {
    set({ searchQuery: query })
    const state = get()
    set({ 
      filteredAlerts: filterAlerts(
        state.alerts, 
        query, 
        state.selectedRooms, 
        state.selectedServices, 
        state.selectedStatuses
      ) 
    })
  },
  
  // Toggle filters
  toggleRoomFilter: (room) => {
    set((state) => {
      const newSelectedRooms = state.selectedRooms.includes(room)
        ? state.selectedRooms.filter((r) => r !== room)
        : [...state.selectedRooms, room]
      
      return { 
        selectedRooms: newSelectedRooms,
        filteredAlerts: filterAlerts(
          state.alerts, 
          state.searchQuery, 
          newSelectedRooms, 
          state.selectedServices, 
          state.selectedStatuses
        )
      }
    })
  },
  
  toggleServiceFilter: (serviceId) => {
    set((state) => {
      const newSelectedServices = state.selectedServices.includes(serviceId)
        ? state.selectedServices.filter((s) => s !== serviceId)
        : [...state.selectedServices, serviceId]
      
      return { 
        selectedServices: newSelectedServices,
        filteredAlerts: filterAlerts(
          state.alerts, 
          state.searchQuery, 
          state.selectedRooms, 
          newSelectedServices, 
          state.selectedStatuses
        )
      }
    })
  },
  
  toggleStatusFilter: (status) => {
    set((state) => {
      const newSelectedStatuses = state.selectedStatuses.includes(status)
        ? state.selectedStatuses.filter((s) => s !== status)
        : [...state.selectedStatuses, status]
      
      return { 
        selectedStatuses: newSelectedStatuses,
        filteredAlerts: filterAlerts(
          state.alerts, 
          state.searchQuery, 
          state.selectedRooms, 
          state.selectedServices, 
          newSelectedStatuses
        )
      }
    })
  },
  
  clearFilters: () => {
    set((state) => ({ 
      searchQuery: "", 
      selectedRooms: [], 
      selectedServices: [], 
      selectedStatuses: [],
      filteredAlerts: filterAlerts(state.alerts, "", [], [], [])
    }))
  },
  
  // Computed values
  getUniqueRooms: () => {
    const alerts = get().alerts || []
    const rooms = alerts.map((alert) => alert.roomId.name)
    return [...new Set(rooms)].sort()
  },
  
  getUniqueServices: () => {
    const alerts = get().alerts || []
    const services = alerts.flatMap((alert) => 
      alert.serviceIds.map((service) => ({ id: service._id, name: service.name }))
    )
    
    // Remove duplicates by id
    const uniqueServicesMap = new Map()
    for (const service of services) {
      if (!uniqueServicesMap.has(service.id)) {
        uniqueServicesMap.set(service.id, service)
      }
    }
    
    return Array.from(uniqueServicesMap.values())
  },
  
  hasActiveFilters: () => {
    const state = get()
    return state.searchQuery !== "" || 
      state.selectedRooms.length > 0 || 
      state.selectedServices.length > 0 || 
      state.selectedStatuses.length > 0
  }
}))

// Helper function to filter alerts
function filterAlerts(
  alerts: Alert[] | null,
  searchQuery: string,
  selectedRooms: string[],
  selectedServices: string[],
  selectedStatuses: string[]
): Alert[] {
  if (!alerts) return []
  
  return alerts.filter((alert) => {
    // Search filter
    const roomName = alert.roomId.name.toLowerCase()
    const guestName = alert.createdBy?.name.toLowerCase() || ""
    const isFoodOrder = alert.cart && alert.cart.length > 0
    const serviceNames = [
      ...alert.serviceIds.map((s) => s.name.toLowerCase()),
      ...(isFoodOrder ? ["food order"] : []),
    ].join(" ")
    const searchLower = searchQuery.toLowerCase()
    
    const matchesSearch =
      roomName.includes(searchLower) || 
      guestName.includes(searchLower) || 
      serviceNames.includes(searchLower)
    
    // Room filter
    const matchesRoom = selectedRooms.length === 0 || selectedRooms.includes(alert.roomId.name)
    
    // Service filter
    const matchesService =
      selectedServices.length === 0 || 
      alert.serviceIds.some((service) => selectedServices.includes(service._id))
    
    // Status filter
    const matchesStatus = selectedStatuses.length === 0 || selectedStatuses.includes(alert.alertProgress)
    
    return matchesSearch && matchesRoom && matchesService && matchesStatus
  })
}
