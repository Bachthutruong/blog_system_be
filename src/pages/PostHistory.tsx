import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { postService } from '../services/postService'
import type { PostHistory as PostHistoryType } from '../types'
import { ArrowLeft, User, FileText } from 'lucide-react'
import { format } from 'date-fns'
import toast from 'react-hot-toast'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

export default function PostHistoryPage() {
  const { postId } = useParams<{ postId: string }>()
  const [history, setHistory] = useState<PostHistoryType[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (postId) {
      fetchHistory()
    }
  }, [postId])

  const fetchHistory = async () => {
    try {
      const historyData = await postService.getPostHistory(postId!)
      setHistory(historyData)
    } catch (error) {
      toast.error('無法載入編輯歷史')
    } finally {
      setLoading(false)
    }
  }

  const getChangeTypeLabel = (changeType: string) => {
    switch (changeType) {
      case 'created':
        return 'Tạo mới'
      case 'updated':
        return 'Cập nhật'
      default:
        return changeType
    }
  }

  const getChangeTypeVariant = (changeType: string) => {
    switch (changeType) {
      case 'created':
        return 'default'
      case 'updated':
        return 'secondary'
      default:
        return 'outline'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">文章編輯歷史</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            檢視此文章的變更紀錄
          </p>
        </div>
        <Link to={`/post/${postId}`}>
          <Button variant="outline" className="flex items-center">
            <ArrowLeft className="h-4 w-4 mr-2" />
            查看文章
          </Button>
        </Link>
      </div>

      {/* History List */}
      {history.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">尚無編輯歷史</h3>
            <p className="text-muted-foreground">
              此文章尚未有任何變更紀錄。
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {history.map((item) => (
            <Card key={item._id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge variant={getChangeTypeVariant(item.changeType)}>
                      {getChangeTypeLabel(item.changeType)}
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      {format(new Date(item.changedAt), 'dd/MM/yyyy HH:mm')}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <User className="h-4 w-4" />
                    {item.changedBy.username}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Title Changes */}
                {item.title && (
                  <div>
                    <h4 className="font-medium mb-2">標題：</h4>
                    <p className="text-lg">{item.title}</p>
                  </div>
                )}

                {/* Description Changes */}
                {item.description && (
                  <div>
                    <h4 className="font-medium mb-2">描述：</h4>
                    <p className="text-muted-foreground">{item.description}</p>
                  </div>
                )}

                {/* Content Changes */}
                {item.content && (
                  <div>
                    <h4 className="font-medium mb-2">內容：</h4>
                    <div 
                      className="prose prose-sm max-w-none text-muted-foreground"
                      dangerouslySetInnerHTML={{ __html: item.content }}
                    />
                  </div>
                )}

                {/* Images Changes */}
                {item.images && item.images.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2">圖片（{item.images.length}）：</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      {item.images.map((image: any, imgIndex: number) => (
                        <div key={imgIndex} className="space-y-1">
                          <img
                            src={image.url}
                            alt={image.name}
                            className="w-full h-20 object-cover rounded"
                          />
                          <p className="text-xs text-center truncate">{image.name}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
