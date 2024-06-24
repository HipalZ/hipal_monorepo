export const state = () => ({
  key: (Math.random() + 1).toString(36).substring(7),
  login: false,
  categoryName : '',
  dishTypes: ['VEG', 'NON_VEG'],
  businessLogo: '',
  permissions: [],
});

export const mutations = {
  updateCategoryName(state, payload) {
    state.categoryName = payload;
  },
  updateDishTypes(state, payload) {
    state.dishTypes = payload;
  },
  updateBusinessLogo(state, payload) {
    state.businessLogo = payload;
  },
  setRolesPermissions(state, payload) {
    state.permissions = payload;
  },
};

export const actions = {
  async getRolePermissions({ state, commit }, Id) {
    try {
      const {data} =await this.$axios.get(`/v1/businesses/roles/${Id}`,
        {
          withCredentials: true,
        },
      )
      commit('setRolesPermissions', data.permissions);
    } catch (error) {
      console.log(error)
    }
  },
}
