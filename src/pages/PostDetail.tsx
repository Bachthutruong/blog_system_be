import { useState, useEffect } from 'react'
import { useParams, useSearchParams } from 'react-router-dom'
import { postService } from '../services/postService'
import { Post } from '../types'
import { Calendar, User, ArrowLeft, Printer, Copy } from 'lucide-react'
import { format } from 'date-fns'
import toast from 'react-hot-toast'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

export default function PostDetail() {
  const { postId } = useParams<{ postId: string }>()
  const [searchParams] = useSearchParams()
  const [post, setPost] = useState<Post | null>(null)
  const [loading, setLoading] = useState(true)
  const isPrintMode = searchParams.get('print') === 'true'

  useEffect(() => {
    if (postId) {
      fetchPost()
    }
  }, [postId])

  const fetchPost = async () => {
    try {
      const postData = await postService.getPostById(postId!)
      setPost(postData)
    } catch (error) {
      toast.error('Không thể tải thông tin bài viết')
    } finally {
      setLoading(false)
    }
  }

  // Auto print when opened with ?print=true and data is ready
  useEffect(() => {
    if (!loading && isPrintMode && post) {
      setTimeout(() => window.print(), 100)
    }
  }, [loading, isPrintMode, post])

  const copyLink = () => {
    const link = `${window.location.origin}/post/${postId}`
    navigator.clipboard.writeText(link)
    toast.success('Đã copy link bài viết')
  }

  const printPost = () => {
    window.print()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!post) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold mb-2">Không tìm thấy bài viết</h2>
        <p className="text-muted-foreground">Bài viết có thể đã bị xóa hoặc không tồn tại.</p>
      </div>
    )
  }

  // Print-friendly minimal layout
  if (isPrintMode && post) {
    return (
      <div className="max-w-4xl mx-auto print:p-0">
        <div className="mb-6">
          <h1 className="text-3xl font-bold leading-tight mb-2">{post.title}</h1>
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
          </div>
        </div>

        {post.images.length > 0 && (
          <div className="space-y-4 mb-6">
            {post.images.map((image: any, index: number) => (
              <div key={index}>
                <img src={image.url} alt={image.name} className="w-full object-contain" />
              </div>
            ))}
          </div>
        )}

        <div className="prose prose-lg max-w-none">
          <div dangerouslySetInnerHTML={{ __html: post.content }} />
        </div>

        <style>{`
          @media print {
            body { background: #fff !important; }
            header, nav, aside, .no-print, .print-hide { display: none !important; }
            .prose img { page-break-inside: avoid; }
          }
        `}</style>
      </div>
    )
  }

  return (
    <div className={`w-full ${isPrintMode ? 'print-mode' : 'space-y-6'}`}>
      {/* Print Header - Only visible when printing */}
      {isPrintMode && (
        <div className="print-only mb-8 text-center">
          <h1 className="text-2xl font-bold mb-2">Blog System</h1>
          <p className="text-muted-foreground">Bản in bài viết</p>
        </div>
      )}

      {/* Navigation - Hidden when printing */}
      {!isPrintMode && (
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            onClick={() => window.history.back()}
            className="flex items-center"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Quay lại
          </Button>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={copyLink}>
              <Copy className="h-4 w-4 mr-2" />
              Copy link
            </Button>
            <Button variant="outline" onClick={printPost}>
              <Printer className="h-4 w-4 mr-2" />
              In bài viết
            </Button>
          </div>
        </div>
      )}

      {/* Post Content */}
      <Card>
        <CardHeader>
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Badge variant={post.status === 'published' ? 'default' : 'secondary'}>
                {post.status === 'published' ? 'Đã xuất bản' : 'Bản nháp'}
              </Badge>
            </div>
            <CardTitle className="text-3xl font-bold leading-tight">
              {post.title}
            </CardTitle>
            <p className="text-lg text-muted-foreground leading-relaxed">
              {post.description}
            </p>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <User className="h-4 w-4" />
                {post.author.username}
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                {format(new Date(post.createdAt), 'dd/MM/yyyy HH:mm')}
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Images */}
          {post.images.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Hình ảnh bài viết</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {post.images.map((image: any, index: number) => (
                  <div key={index} className="space-y-2">
                    <img
                      src={image.url}
                      alt={image.name}
                      className="w-full h-64 object-cover rounded-lg"
                    />
                    <p className="text-sm font-medium text-center">{image.name}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Content */}
          <div className="prose prose-lg max-w-none">
            <div 
              dangerouslySetInnerHTML={{ __html: post.content }}
              className="leading-relaxed"
            />
          </div>
        </CardContent>
      </Card>

      {/* Print Footer - Only visible when printing */}
      {isPrintMode && (
        <div className="print-only mt-8 text-center text-sm text-muted-foreground">
          <p>In từ Blog System - {format(new Date(), 'dd/MM/yyyy HH:mm')}</p>
        </div>
      )}

      <style>{`
        @media print {
          .print-only {
            display: block !important;
          }
          .no-print {
            display: none !important;
          }
        }
        @media screen {
          .print-only {
            display: none;
          }
        }
      `}</style>
    </div>
  )
}
