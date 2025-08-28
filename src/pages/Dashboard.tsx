import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { postService } from '../services/postService'
import { Post } from '../../../shared/types'
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Copy, 
  Printer,
  Eye,
  Calendar,
  User,
  History,
  Filter,
  Grid3X3,
  List,
  FileText
} from 'lucide-react'
import toast from 'react-hot-toast'
import { format } from 'date-fns'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

export default function Dashboard() {
  const { user } = useAuth()
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

  useEffect(() => {
    fetchPosts()
  }, [currentPage, statusFilter, searchTerm, pageSize])

  const fetchPosts = async () => {
    try {
      setLoading(true)
      const response = await postService.getPosts(
        currentPage,
        pageSize,
        statusFilter === 'all' ? '' : statusFilter,
        searchTerm
      )
      setPosts(response.data)
      setTotalPages(response.totalPages)
    } catch (error) {
      toast.error('Không thể tải danh sách bài viết')
    } finally {
      setLoading(false)
    }
  }

  const handleDeletePost = async (postId: string) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa bài viết này?')) {
      return
    }

    try {
      await postService.deletePost(postId)
      toast.success('Xóa bài viết thành công')
      fetchPosts()
    } catch (error) {
      toast.error('Không thể xóa bài viết')
    }
  }

  const copyLink = (postId: string) => {
    const link = `${window.location.origin}/post/${postId}`
    navigator.clipboard.writeText(link)
    toast.success('Đã copy link bài viết')
  }

  const printPost = (postId: string) => {
    window.open(`/post/${postId}?print=true`, '_blank')
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setCurrentPage(1)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="relative">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <div className="absolute inset-0 rounded-full border-2 border-primary/20"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
            Dashboard
          </h1>
          <p className="mt-2 text-muted-foreground">
            Quản lý tất cả bài viết của bạn
          </p>
        </div>
        <Link to="/create-post">
          <Button className="w-full sm:w-auto bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg hover:shadow-xl transition-all duration-200">
            <Plus className="h-5 w-5 mr-2" />
            Tạo bài viết mới
          </Button>
        </Link>
      </div>

      {/* Search and Filters */}
      <Card className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border-0 shadow-lg">
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <form onSubmit={handleSearch} className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Tìm kiếm bài viết..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-white/50 dark:bg-slate-800/50 border-0 focus:ring-2 focus:ring-primary/20"
                />
              </form>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-48 bg-white/50 dark:bg-slate-800/50 border-0 focus:ring-2 focus:ring-primary/20">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Lọc theo trạng thái" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả</SelectItem>
                  <SelectItem value="published">Đã xuất bản</SelectItem>
                  <SelectItem value="draft">Bản nháp</SelectItem>
                </SelectContent>
              </Select>

              {/* View Mode Toggle */}
              <div className="flex border rounded-lg bg-white/50 dark:bg-slate-800/50 p-1">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                  className="h-8 px-3"
                >
                  <Grid3X3 className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                  className="h-8 px-3"
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
              {/* Page size */}
              <Select value={String(pageSize)} onValueChange={(v) => { setCurrentPage(1); setPageSize(Number(v)) }}>
                <SelectTrigger className="w-full sm:w-32 bg-white/50 dark:bg-slate-800/50 border-0 focus:ring-2 focus:ring-primary/20">
                  <SelectValue placeholder="Số lượng" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="6">6 / trang</SelectItem>
                  <SelectItem value="10">10 / trang</SelectItem>
                  <SelectItem value="12">12 / trang</SelectItem>
                  <SelectItem value="20">20 / trang</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Posts Grid/List */}
      <Card className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Danh sách bài viết ({posts.length})</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {posts.length === 0 ? (
            <div className="text-center py-12">
              <div className="mx-auto w-24 h-24 bg-gradient-to-r from-primary/10 to-primary/20 rounded-full flex items-center justify-center mb-4">
                <FileText className="h-12 w-12 text-primary" />
              </div>
              <h3 className="text-lg font-medium mb-2">Chưa có bài viết nào</h3>
              <p className="text-muted-foreground mb-4">
                Bắt đầu tạo bài viết đầu tiên của bạn
              </p>
              <Link to="/create-post">
                <Button className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70">
                  <Plus className="h-4 w-4 mr-2" />
                  Tạo bài viết
                </Button>
              </Link>
            </div>
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {posts.map((post, index) => (
                <div
                  key={post._id}
                  className="group bg-white dark:bg-slate-800 rounded-xl border border-gray-200/50 dark:border-slate-700/50 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  {/* Post Image Preview */}
                  {post.images.length > 0 && (
                    <div className="relative h-48 overflow-hidden">
                      <img
                        src={post.images[0].url}
                        alt={post.images[0].name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute top-2 right-2">
                        <Badge variant="secondary" className="bg-white/90 dark:bg-slate-800/90">
                          {post.images.length} ảnh
                        </Badge>
                      </div>
                    </div>
                  )}

                  <div className="p-6">
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="font-semibold text-lg line-clamp-2 group-hover:text-primary transition-colors">
                        {post.title}
                      </h3>
                      <Badge variant={post.status === 'published' ? 'default' : 'secondary'} className="ml-2 flex-shrink-0">
                        {post.status === 'published' ? 'Đã xuất bản' : 'Bản nháp'}
                      </Badge>
                    </div>
                    
                    <p className="text-muted-foreground mb-4 line-clamp-2">{post.description}</p>
                    
                    <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                      <div className="flex items-center gap-1">
                        <User className="h-4 w-4" />
                        {post.author.username}
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {format(new Date(post.createdAt), 'dd/MM/yyyy')}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-wrap gap-2">
                      <Link to={`/post/${post._id}`}>
                        <Button variant="outline" size="sm" className="flex-1">
                          <Eye className="h-4 w-4 mr-1" />
                          Xem
                        </Button>
                      </Link>
                      <Link to={`/edit-post/${post._id}`}>
                        <Button variant="outline" size="sm" className="flex-1">
                          <Edit className="h-4 w-4 mr-1" />
                          Sửa
                        </Button>
                      </Link>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyLink(post._id)}
                        className="flex-1"
                      >
                        <Copy className="h-4 w-4 mr-1" />
                        Copy
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => printPost(post._id)}
                        className="flex-1"
                      >
                        <Printer className="h-4 w-4 mr-1" />
                        In
                      </Button>
                      {user?.role === 'admin' && (
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeletePost(post._id)}
                          className="flex-1"
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          Xóa
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {posts.map((post, index) => (
                <div
                  key={post._id}
                  className="group bg-white dark:bg-slate-800 rounded-xl border border-gray-200/50 dark:border-slate-700/50 p-6 hover:shadow-lg transition-all duration-300"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-semibold text-lg group-hover:text-primary transition-colors">
                          {post.title}
                        </h3>
                        <Badge variant={post.status === 'published' ? 'default' : 'secondary'}>
                          {post.status === 'published' ? 'Đã xuất bản' : 'Bản nháp'}
                        </Badge>
                      </div>
                      <p className="text-muted-foreground mb-3">{post.description}</p>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <User className="h-4 w-4" />
                          {post.author.username}
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {format(new Date(post.createdAt), 'dd/MM/yyyy HH:mm')}
                        </div>
                        {post.images.length > 0 && (
                          <span className="text-primary">
                            {post.images.length} ảnh
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <Link to={`/post/${post._id}`}>
                        <Button variant="outline" size="sm" title="Xem bài viết">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Link to={`/edit-post/${post._id}`}>
                        <Button variant="outline" size="sm" title="Chỉnh sửa">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Link to={`/post/${post._id}/history`}>
                        <Button variant="outline" size="sm" title="Lịch sử chỉnh sửa">
                          <History className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyLink(post._id)}
                        title="Copy link"
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => printPost(post._id)}
                        title="In bài viết"
                      >
                        <Printer className="h-4 w-4" />
                      </Button>
                      {user?.role === 'admin' && (
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeletePost(post._id)}
                          title="Xóa bài viết"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center space-x-2">
          <Button
            variant="outline"
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm"
          >
            Trước
          </Button>
          <span className="text-sm text-muted-foreground bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm px-4 py-2 rounded-lg">
            Trang {currentPage} / {totalPages}
          </span>
          <Button
            variant="outline"
            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
            className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm"
          >
            Sau
          </Button>
        </div>
      )}
    </div>
  )
}
