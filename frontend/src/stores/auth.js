import { defineStore } from 'pinia'
import { api } from '../api'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    token: localStorage.getItem('token') || null,
  }),

  actions: {
    async login(email, password) {
      const res = await api.post('/auth/login', { email, password })

      this.token = res.data.access_token
      localStorage.setItem('token', this.token)

      await this.fetchUser()
    },

    async fetchUser() {
      if (!this.token) return

      try {
        const res = await api.get('/auth/me')
        this.user = res.data
      } catch (err) {
        this.logout()
      }
    },

    logout() {
      this.user = null
      this.token = null
      localStorage.removeItem('token')
    },
  },
})