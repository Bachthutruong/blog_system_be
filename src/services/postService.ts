import axios from 'axios'
import { Post, PostHistory, PaginatedResponse } from '../../../shared/types'

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

api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Do not redirect; surface error to UI
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
    }
    return Promise.reject(error)
  }
)

export const postService = {
  async getPosts(page = 1, limit = 10, status?: string, search?: string): Promise<PaginatedResponse<Post>> {
    const params = new URLSearchParams()
    params.append('page', page.toString())
    params.append('limit', limit.toString())
    if (status) params.append('status', status)
    if (search) params.append('search', search)

    const response = await api.get(`/posts?${params.toString()}`)
    const payload = response.data.data
    return {
      data: payload.posts,
      total: payload.total,
      page: payload.page,
      limit: payload.limit,
      totalPages: payload.totalPages,
    }
  },

  async getPostById(postId: string): Promise<Post> {
    const response = await api.get(`/posts/${postId}`)
    return response.data.data
  },

  async createPost(postData: { title: string; description: string; content: string }): Promise<Post> {
    const response = await api.post('/posts', postData)
    return response.data.data
  },

  async updatePost(postId: string, postData: { title?: string; description?: string; content?: string; status?: string }): Promise<Post> {
    const response = await api.put(`/posts/${postId}`, postData)
    return response.data.data
  },

  async deletePost(postId: string): Promise<void> {
    await api.delete(`/posts/${postId}`)
  },

  async uploadImages(postId: string, images: File[], imageNames: string[]): Promise<any> {
    const formData = new FormData()
    images.forEach((image, index) => {
      formData.append('images', image)
      formData.append('imageNames', imageNames[index])
    })

    const response = await api.post(`/posts/${postId}/images`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return response.data.data
  },

  async getPostHistory(postId: string): Promise<PostHistory[]> {
    const response = await api.get(`/posts/${postId}/history`)
    return response.data.data
  },
}
