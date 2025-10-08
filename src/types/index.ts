export interface User {
  _id: string;
  username: string;
  email: string;
  role: 'admin' | 'employee';
  createdAt: Date;
  updatedAt: Date;
}

export interface Post {
  _id: string;
  title: string;
  description: string;
  content: string;
  images: PostImage[];
  author: User;
  status: 'draft' | 'published';
  createdAt: Date;
  updatedAt: Date;
}

export interface PostImage {
  _id: string;
  name: string;
  url: string;
  publicId: string;
  width: number;
  height: number;
}

export interface PostHistory {
  _id: string;
  postId: string;
  title: string;
  description: string;
  content: string;
  images: PostImage[];
  changedBy: User;
  changedAt: Date;
  changeType: 'created' | 'updated';
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}


