
import axios from 'axios'
import { Post, PostHistory, PaginatedResponse } from '../../../shared/types'

const API_BASE_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:5005/api' || 'https://blog-system-backend.onrender.com/api'

const api = axios.create({
  baseURL: API_BASE_URL,
})

// Add auth token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      window.location.href = '/login'
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
    
    // Validate files before adding
    images.forEach((image, index) => {
      console.log(`Adding image ${index + 1}: ${image.name}, size: ${image.size} bytes, type: ${image.type}`)
      if (image.size === 0) {
        throw new Error(`File ${image.name} is empty`)
      }
      formData.append('images', image)
    })

    // Add image names
    imageNames.forEach((name) => {
      formData.append('imageNames', name)
    })

    console.log('FormData contents:')
    for (let pair of formData.entries()) {
      console.log(pair[0], pair[1])
    }

    // Don't set Content-Type header - let browser set it with boundary
    const response = await api.post(`/posts/${postId}/images`, formData)
    return response.data.data
  },

  async updateImageName(postId: string, imageId: string, name: string): Promise<void> {
    await api.put(`/posts/${postId}/images/${imageId}`, { name })
  },

  async deleteImageFromPost(postId: string, imageId: string): Promise<void> {
    await api.delete(`/posts/${postId}/images/${imageId}`)
  },

  async getPostHistory(postId: string): Promise<PostHistory[]> {
    const response = await api.get(`/posts/${postId}/history`)
    return response.data.data
  },
}