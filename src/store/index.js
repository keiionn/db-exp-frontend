import { createStore } from 'vuex'

export default createStore({
  state: {
    user: JSON.parse(localStorage.getItem("user")) || null
  },

  mutations: {
    setUser(state, user) {
      state.user = user
      if (user) {
        localStorage.setItem("user", JSON.stringify(user))
      } else {
        localStorage.removeItem("user")
      }
    }
  },

  actions: {
    login({ commit }, user) {
      commit("setUser", user)
    },

    logout({ commit }) {
      commit("setUser", null)
    }
  },

  getters: {
    isAuthenticated: state => !!state.user
  }
})
