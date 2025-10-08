import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useDropzone } from 'react-dropzone'
import { postService } from '../services/postService'
import { Post } from '../types'
import { Upload, X, Image as ImageIcon, FileText, Save } from 'lucide-react'
import toast from 'react-hot-toast'
import ReactQuill from 'react-quill'
import 'react-quill/dist/quill.snow.css'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

interface ImageFile {
  file: File
  name: string
  preview: string
}

export default function EditPost() {
  const navigate = useNavigate()
  const { postId } = useParams<{ postId: string }>()
  const [post, setPost] = useState<Post | null>(null)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [content, setContent] = useState('')
  const [status, setStatus] = useState<'draft' | 'published'>('draft')
  const [newImages, setNewImages] = useState<ImageFile[]>([])
  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)
  const [editingImageId, setEditingImageId] = useState<string | null>(null)
  const [editingImageName, setEditingImageName] = useState('')

  useEffect(() => {
    if (postId) {
      fetchPost()
    }
  }, [postId])

  const fetchPost = async () => {
    try {
      const postData = await postService.getPostById(postId!)
      setPost(postData)
      setTitle(postData.title)
      setDescription(postData.description)
      setContent(postData.content)
      setStatus(postData.status)
    } catch (error) {
      toast.error('無法載入文章資訊')
      navigate('/')
    } finally {
      setInitialLoading(false)
    }
  }

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp']
    },
    maxSize: 5 * 1024 * 1024, // 5MB
    onDrop: (acceptedFiles) => {
      const newImageFiles = acceptedFiles.map(file => ({
        file,
        name: file.name.replace(/\.[^/.]+$/, ''),
        preview: URL.createObjectURL(file)
      }))
      setNewImages(prev => [...prev, ...newImageFiles])
    }
  })

  const handleImageNameChange = (index: number, newName: string) => {
    setNewImages(prev => prev.map((img, i) => 
      i === index ? { ...img, name: newName } : img
    ))
  }

  const removeNewImage = (index: number) => {
    setNewImages(prev => prev.filter((_, i) => i !== index))
  }

  const removeExistingImage = async (imageId: string) => {
    if (!postId) return
    
    try {
      await postService.deleteImageFromPost(postId, imageId)
      // Refresh post data
      await fetchPost()
      toast.success('刪除圖片成功！')
    } catch (error) {
      toast.error('無法刪除圖片')
    }
  }

  // const startEditingImageName = (imageId: string, currentName: string) => {
  //   setEditingImageId(imageId)
  //   setEditingImageName(currentName)
  // }

  const saveImageName = async () => {
    if (!postId || !editingImageId) return
    
    try {
      await postService.updateImageName(postId, editingImageId, editingImageName)
      setEditingImageId(null)
      setEditingImageName('')
      // Refresh post data
      await fetchPost()
      toast.success('更新圖片名稱成功！')
    } catch (error) {
      toast.error('無法更新圖片名稱')
    }
  }

  // const cancelEditingImageName = () => {
  //   setEditingImageId(null)
  //   setEditingImageName('')
  // }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!title.trim()) {
      toast.error('請輸入文章標題')
      return
    }

    setLoading(true)
    try {
      // Update post
      await postService.updatePost(postId!, {
        title: title.trim(),
        description: description.trim(),
        content: content.trim(),
        status
      })

      // Upload new images if any
      if (newImages.length > 0) {
        const imageFiles = newImages.map(img => img.file)
        const imageNames = newImages.map(img => img.name)
        
        await postService.uploadImages(postId!, imageFiles, imageNames)
        toast.success('圖片上傳成功！')
      }

      toast.success('更新文章成功！')
      navigate('/')
    } catch (error: any) {
      toast.error(error.response?.data?.error || '無法更新文章')
    } finally {
      setLoading(false)
    }
  }

  if (initialLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!post) {
    return <div>找不到文章</div>
  }

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">編輯文章</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          編輯文章內容與圖片
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileText className="h-5 w-5 mr-2" />
              基本資訊
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">
                文章標題 *
              </Label>
              <Input
                id="title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="請輸入文章標題"
                maxLength={200}
                required
              />
              <p className="text-sm text-muted-foreground">
                {title.length}/200 字元
              </p>
            </div>

            {false && (
              <div className="space-y-2">
                <Label htmlFor="description">
                  簡短描述
                </Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  placeholder="請輸入文章的簡短描述"
                  maxLength={500}
                />
                <p className="text-sm text-muted-foreground">
                  {description.length}/500 字元
                </p>
              </div>
            )}

            {false && (
              <div className="space-y-2">
                <Label htmlFor="content">
                  文章內容
                </Label>
                <ReactQuill
                  value={content}
                  onChange={setContent}
                  placeholder="撰寫文章內容..."
                  modules={{
                    toolbar: [
                      [{ 'header': [1, 2, 3, false] }],
                      ['bold', 'italic', 'underline', 'strike'],
                      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                      [{ 'color': [] }, { 'background': [] }],
                      [{ 'align': [] }],
                      ['link', 'image'],
                      ['clean']
                    ]
                  }}
                  className="min-h-[200px]"
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="status">
                狀態
              </Label>
              <Select value={status} onValueChange={(value: 'draft' | 'published') => setStatus(value)}>
                <SelectTrigger>
                  <SelectValue placeholder="選擇狀態" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">草稿</SelectItem>
                  <SelectItem value="published">發佈</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Current Images */}
        {post.images.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>
                目前的圖片（{post.images.length}）
              </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {post.images.map((image: any, index: number) => (
                  <div key={index} className="border rounded-lg overflow-hidden">
                    {/* Row 1: Title and actions */}
                    <div className="p-3 border-b">
                      <div className="flex items-center gap-2">
                        <Input
                          value={image.name}
                          onChange={(e) => {
                            setEditingImageId(image._id);
                            setEditingImageName(e.target.value);
                            setPost(prev => prev ? { ...prev, images: (prev.images as any).map((img: any) => img._id === image._id ? { ...img, name: e.target.value } : img) } : prev);
                          }}
                          className="text-sm flex-1"
                          placeholder="圖片名稱..."
                        />
                        <div className="flex items-center gap-2">
                          <Button type="button" size="sm" onClick={saveImageName} className="px-2" disabled={editingImageId !== image._id} title="儲存名稱">
                            <Save className="h-3 w-3" />
                          </Button>
                          <Button type="button" size="sm" variant="destructive" onClick={() => removeExistingImage(image._id)} title="刪除圖片" className="px-2">
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">尺寸：{image.width} x {image.height}</p>
                    </div>

                    {/* Row 2: Image */}
                    <div className="p-3">
                      <img src={image.url} alt={image.name} className="w-full h-32 object-cover rounded" />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Add New Images */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <ImageIcon className="h-5 w-5 mr-2" />
              新增圖片
            </CardTitle>
          </CardHeader>
          <CardContent>
            {/* Dropzone */}
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                isDragActive
                  ? 'border-primary bg-primary/5'
                  : 'border-muted-foreground/25 hover:border-primary hover:bg-muted/50'
              }`}
            >
              <input {...getInputProps()} />
              <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-lg font-medium mb-2">
                {isDragActive ? '將圖片拖放到此處' : '拖放圖片到此或點擊選擇'}
              </p>
              <p className="text-sm text-muted-foreground">
                支援：JPG、PNG、GIF、WEBP（每張最多 5MB）
              </p>
            </div>

            {/* New Image List */}
            {newImages.length > 0 && (
              <div className="mt-6">
                <h3 className="text-md font-medium mb-4">
                  將新增的圖片（{newImages.length}）
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {newImages.map((image, index) => (
                    <div
                      key={index}
                      className="border rounded-lg p-4 bg-muted/50"
                    >
                      <div className="mb-3 space-y-2">
                        <Label>圖片名稱</Label>
                        <Input
                          type="text"
                          value={image.name}
                          onChange={(e) => handleImageNameChange(index, e.target.value)}
                          placeholder="請輸入圖片名稱"
                        />
                      </div>

                      <div className="mb-3">
                        <img
                          src={image.preview}
                          alt={image.name}
                          className="w-full h-32 object-cover rounded-lg"
                        />
                      </div>

                      <Button
                        type="button"
                        variant="destructive"
                        onClick={() => removeNewImage(index)}
                        className="w-full"
                      >
                        <X className="h-4 w-4 mr-2" />
                        刪除圖片
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Submit Button */}
        <div className="flex justify-end space-x-4">
            <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/')}
          >
            取消
          </Button>
          <Button
            type="submit"
            disabled={loading}
          >
            {loading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            更新文章
          </Button>
        </div>
      </form>
    </div>
  )
}
