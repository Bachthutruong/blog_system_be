import axios from 'axios'
import { User } from '../types'

const API_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:5005/api' || 'https://blog-system-backend.onrender.com/api'

// Create axios instance with base configuration
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Add request interceptor to attach JWT token
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

// Add response interceptor to handle 401 errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Do not reload; let caller decide how to handle
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
    }
    return Promise.reject(error)
  }
)

export const userService = {
  // Get all users (admin only)
  getAllUsers: async (): Promise<User[]> => {
    const response = await api.get('/users')
    return response.data.data
  },

  // Create user (admin only)
  createUser: async (payload: { username: string; email: string; password: string; role: 'admin' | 'employee' }): Promise<User> => {
    const response = await api.post('/users', payload)
    return response.data.data
  },

  // Get user by ID
  getUserById: async (userId: string): Promise<User> => {
    const response = await api.get(`/users/${userId}`)
    return response.data.data
  },

  // Update user
  updateUser: async (userId: string, userData: Partial<User>): Promise<User> => {
    const response = await api.put(`/users/${userId}`, userData)
    return response.data.data
  },

  // Delete user (admin only)
  deleteUser: async (userId: string): Promise<void> => {
    await api.delete(`/users/${userId}`)
  },

  // Change password (current user)
  changePassword: async (currentPassword: string, newPassword: string): Promise<void> => {
    await api.post(`/users/change-password`, {
      currentPassword,
      newPassword,
    })
  },
}
