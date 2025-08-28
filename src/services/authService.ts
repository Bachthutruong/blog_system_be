import axios from 'axios'
import { User, AuthResponse } from '../../../shared/types'

const API_URL = (import.meta as any).env?.VITE_API_URL || '/api'

// Create axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    if (config.headers) {
      (config.headers as any).Authorization = `Bearer ${token}`
    } else {
      config.headers = { Authorization: `Bearer ${token}` } as any
    }
  }
  return config
})

// Handle token expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Do not reload; let caller display toast message
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
    }
    return Promise.reject(error)
  }
)

export const authService = {
  async login(email: string, password: string): Promise<AuthResponse> {
    const response = await api.post('/auth/login', { email, password })
    return response.data.data
  },

  async register(username: string, email: string, password: string, role?: string): Promise<AuthResponse> {
    const response = await api.post('/auth/register', { username, email, password, role })
    return response.data.data
  },

  async getProfile(): Promise<User> {
    const response = await api.get('/auth/profile')
    return response.data.data
  },
}
