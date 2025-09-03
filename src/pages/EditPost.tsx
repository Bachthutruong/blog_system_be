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
      toast.error('Không thể tải thông tin bài viết')
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
      toast.success('Xóa ảnh thành công!')
    } catch (error) {
      toast.error('Không thể xóa ảnh')
    }
  }

  const startEditingImageName = (imageId: string, currentName: string) => {
    setEditingImageId(imageId)
    setEditingImageName(currentName)
  }

  const saveImageName = async () => {
    if (!postId || !editingImageId) return
    
    try {
      await postService.updateImageName(postId, editingImageId, editingImageName)
      setEditingImageId(null)
      setEditingImageName('')
      // Refresh post data
      await fetchPost()
      toast.success('Cập nhật tên ảnh thành công!')
    } catch (error) {
      toast.error('Không thể cập nhật tên ảnh')
    }
  }

  const cancelEditingImageName = () => {
    setEditingImageId(null)
    setEditingImageName('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!title.trim() || !description.trim() || !content.trim()) {
      toast.error('Vui lòng điền đầy đủ thông tin bài viết')
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
        toast.success('Tải ảnh lên thành công!')
      }

      toast.success('Cập nhật bài viết thành công!')
      navigate('/')
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Không thể cập nhật bài viết')
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
    return <div>Không tìm thấy bài viết</div>
  }

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Chỉnh sửa bài viết</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Chỉnh sửa nội dung và hình ảnh bài viết
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileText className="h-5 w-5 mr-2" />
              Thông tin cơ bản
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">
                Tiêu đề bài viết *
              </Label>
              <Input
                id="title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Nhập tiêu đề bài viết"
                maxLength={200}
                required
              />
              <p className="text-sm text-muted-foreground">
                {title.length}/200 ký tự
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">
                Mô tả ngắn *
              </Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                placeholder="Nhập mô tả ngắn gọn về bài viết"
                maxLength={500}
                required
              />
              <p className="text-sm text-muted-foreground">
                {description.length}/500 ký tự
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="content">
                Nội dung bài viết *
              </Label>
              <ReactQuill
                value={content}
                onChange={setContent}
                placeholder="Viết nội dung bài viết..."
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

            <div className="space-y-2">
              <Label htmlFor="status">
                Trạng thái
              </Label>
              <Select value={status} onValueChange={(value: 'draft' | 'published') => setStatus(value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Chọn trạng thái" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Bản nháp</SelectItem>
                  <SelectItem value="published">Xuất bản</SelectItem>
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
                Hình ảnh hiện tại ({post.images.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {post.images.map((image: any, index: number) => (
                  <div key={index} className="border rounded-lg p-4 bg-muted/50 relative">
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      className="absolute top-2 right-2 h-6 w-6 p-0"
                      onClick={() => removeExistingImage(image._id)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                    <img
                      src={image.url}
                      alt={image.name}
                      className="w-full h-32 object-cover rounded-lg mb-3"
                    />
                    
                    {/* Editable image name */}
                    <div className="space-y-2">
                      {editingImageId === image._id ? (
                        <div className="flex items-center gap-2">
                          <Input
                            value={editingImageName}
                            onChange={(e) => setEditingImageName(e.target.value)}
                            className="text-sm"
                            placeholder="Tên ảnh..."
                          />
                          <Button
                            type="button"
                            size="sm"
                            onClick={saveImageName}
                            className="px-2"
                          >
                            <Save className="h-3 w-3" />
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            onClick={cancelEditingImageName}
                            className="px-2"
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium">
                            Tên: {image.name}
                          </p>
                          <Button
                            type="button"
                            size="sm"
                            variant="ghost"
                            onClick={() => startEditingImageName(image._id, image.name)}
                            className="h-6 w-6 p-0"
                          >
                            <FileText className="h-3 w-3" />
                          </Button>
                        </div>
                      )}
                      <p className="text-xs text-muted-foreground">
                        Kích thước: {image.width} x {image.height}
                      </p>
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
              Thêm hình ảnh mới
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
                {isDragActive ? 'Thả ảnh vào đây' : 'Kéo thả ảnh vào đây hoặc click để chọn'}
              </p>
              <p className="text-sm text-muted-foreground">
                Hỗ trợ: JPG, PNG, GIF, WEBP (tối đa 5MB mỗi ảnh)
              </p>
            </div>

            {/* New Image List */}
            {newImages.length > 0 && (
              <div className="mt-6">
                <h3 className="text-md font-medium mb-4">
                  Ảnh mới sẽ thêm ({newImages.length})
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {newImages.map((image, index) => (
                    <div
                      key={index}
                      className="border rounded-lg p-4 bg-muted/50"
                    >
                      <div className="mb-3">
                        <img
                          src={image.preview}
                          alt={image.name}
                          className="w-full h-32 object-cover rounded-lg"
                        />
                      </div>
                      
                      <div className="mb-3 space-y-2">
                        <Label>Tên hình ảnh</Label>
                        <Input
                          type="text"
                          value={image.name}
                          onChange={(e) => handleImageNameChange(index, e.target.value)}
                          placeholder="Nhập tên hình ảnh"
                        />
                      </div>

                      <Button
                        type="button"
                        variant="destructive"
                        onClick={() => removeNewImage(index)}
                        className="w-full"
                      >
                        <X className="h-4 w-4 mr-2" />
                        Xóa ảnh
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
            Hủy
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
            Cập nhật bài viết
          </Button>
        </div>
      </form>
    </div>
  )
}
