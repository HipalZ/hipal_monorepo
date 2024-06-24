export const state = () => ({
  zones: [],
  tables: [],
  dishes: [],
  categories: [],
  zoneOrders: [],
  kitchenOrders: [],
  orderedTableIds: [],
  items: [],
})

export const getters = {
  zoneNames(state: any) {
    const zoneNames = [] as any
    state.tables.forEach((table: any) => {
      const zone = state.zones.find((obj: any) => obj.id === table.zoneId)
      zoneNames.push({
        zone,
        table,
      })
    })
    return zoneNames
  },

  tableNames: (state: any) => (id: any) => {
    return state.tables.filter((table: any) => table.zoneId === id)
  },

  dishes: (state: any) => (id: any) => {
    const dishes = [] as any
    state.dishes.forEach((dish: any) => {
      dish.categories.forEach((category: any) => {
        if (category.id === id) {
          dishes.push(dish)
        }
      })
    })
    return dishes
  },

  tableTime: (state: any) => (id: any) => {
    const time = state.zoneOrders[id] as any
    if (time && time.length) {
      return new Date(time[0].startedAt).toLocaleTimeString('en-US', {
        hour12: false,
        hour: 'numeric',
        minute: 'numeric',
      })
    }
    return '00:00'
  },

  customerName: (state: any) => (id: any) => {
    const name = state.zoneOrders[id]
    if (name && name.length) {
      return name[0].customerName
    }
    return ''
  },

  zoneNameById: (state: any) => (id: any) => {
    for (let i = 0; i < state.zones.length; i++) {
      for (let j = 0; j < state.zones[i].tables.length; j++) {
        if (id.includes(state.zones[i].tables[j])) {
          return state.zones[i].zoneName
        }
      }
    }
  },

  zoneTypeById: (state: any) => (id: any) => {
    for (let i = 0; i < state.zones.length; i++) {
      for (let j = 0; j < state.zones[i].tables.length; j++) {
        if (id.includes(state.zones[i].tables[j])) {
          return state.zones[i].zoneType
        }
      }
    }
    return 'Take Away'
  },

  tableNameById: (state: any) => (tableId: any) => {
    if (tableId === '123') {
      return 'TakeAway'
    }
    return state.tables.find((table: any) => table.id === tableId).name
  },

  totalPrice: (state: any) => (id: any) => {
    const ordersTotal = state.zoneOrders[id]
    let price = 0
    for (const i in ordersTotal) {
      if (ordersTotal[i].status === 'PAID') continue
      // price = + ordersTotal[i].dish.price*ordersTotal[i].dish.qty;
      for (let j = 0; j < ordersTotal[i].dish.extras.length; j++) {
        price +=
          ordersTotal[i].dish.extras[j].price *
          ordersTotal[i].dish.extras[j].qty
      }
      if (ordersTotal[i].dish?.portions) {
        price += ordersTotal[i].dish.portions?.price * ordersTotal[i].dish.qty
      } else {
        price += ordersTotal[i].dish.price * ordersTotal[i].dish.qty
      }
    }
    return price
  },

  settleOrders: (state: any) => (tableId: any) => {
    const update = [] as any
    if (state.orderedTableIds.includes(tableId)) {
      state.zoneOrders[tableId].forEach((element: any) => {
        if (element.cookedAt !== -1) {
          update.push(element)
        }
      })
    }
    return update
  },
} as any

export const mutations = {
  setZones(state: any, zones: any) {
    state.zones = zones
  },

  setTables(state: any, tables: any) {
    state.tables = tables
  },

  setDishes(state: any, dishes: any) {
    state.dishes = dishes
  },

  setCategories(state: any, categories: any) {
    state.categories = categories
  },

  setZoneOrders(state: any, zonesOrders: any) {
    state.zoneOrders = zonesOrders
  },

  setKitchenOrders(state: any, kitchenOrders: any) {
    state.kitchenOrders = kitchenOrders
  },

  setOrderTableIds(state: any, ids: any) {
    state.orderedTableIds = ids
  },

  setItems(state: any, cookingDishes: any) {
    state.items = cookingDishes
  },
} as any

export const actions = {
  async getAllZones({ commit }: any, businessId: string) {
    try {
      const { data } = await this.$axios.get(
        `/v1/zones?businessId=${businessId}`,
        {
          withCredentials: true,
        },
      )
      commit('setZones', data)
    } catch (error) {
      console.log(error)
    }
  },

  async getAllTables({ commit }: any, businessId: string) {
    try {
      const { data } = await this.$axios.get(
        `/v1/zones/all/tables?businessId=${businessId}`,
        {
          withCredentials: true,
        },
      )
      commit('setTables', data)
    } catch (error) {
      console.log(error)
    }
  },

  async getDishes({ commit }: any, businessId: string) {
    try {
      const { data } = await this.$axios.get(
        `/v1/dishes?businessId=${businessId}`,
        {
          withCredentials: true,
        },
      )
      commit('setDishes', data)
    } catch (error) {
      console.log(error)
    }
  },

  async getCategories({ commit }: any, businessId: string) {
    try {
      const { data } = await this.$axios.get(
        `/v1/categories?businessId=${businessId}`,
        {
          withCredentials: true,
        },
      )
      commit('setCategories', data)
    } catch (error) {
      console.log(error)
    }
  },

  async getZoneOrders({ commit }: any, zoneId: string) {
    try {
      const { data } = await this.$axios.get(
        `/v1/kitchens/${zoneId}/kots?zoneId=${zoneId}`,
        {
          withCredentials: true,
        },
      )
      const results = data.reduce(function (results: any, org: any) {
        ;(results[org.tableId] = results[org.tableId] || []).push(org)

        return results
      }, {})
      const tablesIds = data.map((s: any) => s.tableId)
      commit('setOrderTableIds', [...new Set(tablesIds)])
      commit('setZoneOrders', results)
      commit('setItems', data)
    } catch (error) {
      console.log(error)
    }
  },

  async getKitchenOrders({ commit }: any, kitchenId: string) {
    try {
      const { data } = await this.$axios.get(
        `/v1/kitchens/${kitchenId}/kots?kitchenId=${kitchenId}`,
        {
          withCredentials: true,
        },
      )
      const results = data.reduce(function (results: any, org: any) {
        ;(results[org.tableId] = results[org.tableId] || []).push(org)
        return results
      }, {})

      commit('setKitchenOrders', results)
    } catch (error) {
      console.log(error)
    }
  },
} as any
