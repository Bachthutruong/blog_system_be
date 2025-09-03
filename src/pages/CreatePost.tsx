import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDropzone } from 'react-dropzone'
import { postService } from '../services/postService'
import { Upload, X, Image as ImageIcon, FileText, Save, ArrowLeft, Sparkles } from 'lucide-react'
import toast from 'react-hot-toast'
import ReactQuill from 'react-quill'
import 'react-quill/dist/quill.snow.css'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'

interface ImageFile {
  file: File
  name: string
  preview: string
}

export default function CreatePost() {
  const navigate = useNavigate()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [content, setContent] = useState('')
  const [images, setImages] = useState<ImageFile[]>([])
  const [loading, setLoading] = useState(false)


  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp']
    },
    maxSize: 5 * 1024 * 1024, // 5MB
    onDrop: (acceptedFiles) => {
      const newImages = acceptedFiles.map(file => ({
        file,
        name: file.name.replace(/\.[^/.]+$/, ''), // Remove extension
        preview: URL.createObjectURL(file)
      }))
      setImages(prev => [...prev, ...newImages])
    }
  })

  const handleImageNameChange = (index: number, newName: string) => {
    setImages(prev => prev.map((img, i) => 
      i === index ? { ...img, name: newName } : img
    ))
  }

  const removeImage = (index: number) => {
    setImages(prev => {
      const newImages = prev.filter((_, i) => i !== index)
      return newImages
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!title.trim() || !description.trim() || !content.trim()) {
      toast.error('Vui lòng điền đầy đủ thông tin bài viết')
      return
    }

    setLoading(true)
    try {
      // Create post first
      const post = await postService.createPost({
        title: title.trim(),
        description: description.trim(),
        content: content.trim()
      })
      


      // Upload images if any
      if (images.length > 0) {
        const imageFiles = images.map(img => img.file)
        const imageNames = images.map(img => img.name)
        
        await postService.uploadImages(post._id, imageFiles, imageNames)
        toast.success('Tải ảnh lên thành công!')
      }

      toast.success('Tạo bài viết thành công!')
      navigate('/')
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Không thể tạo bài viết')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
            Tạo bài viết mới
          </h1>
          <p className="mt-2 text-muted-foreground">
            Viết và chia sẻ nội dung tuyệt vời của bạn
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => navigate('/')}
          className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Quay lại
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Post Information */}
        <Card className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileText className="h-5 w-5 mr-2" />
              Thông tin bài viết
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="title" className="text-sm font-medium">
                Tiêu đề bài viết *
              </Label>
              <Input
                id="title"
                type="text"
                placeholder="Nhập tiêu đề bài viết..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="bg-white/50 dark:bg-slate-800/50 border-0 focus:ring-2 focus:ring-primary/20 transition-all duration-200"
                required
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description" className="text-sm font-medium">
                Mô tả ngắn *
              </Label>
              <Textarea
                id="description"
                placeholder="Nhập mô tả ngắn về bài viết..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="min-h-[100px] bg-white/50 dark:bg-slate-800/50 border-0 focus:ring-2 focus:ring-primary/20 transition-all duration-200"
                required
              />
            </div>

            {/* Content */}
            <div className="space-y-2">
              <Label htmlFor="content" className="text-sm font-medium">
                Nội dung bài viết *
              </Label>
              <div className="border rounded-lg overflow-hidden bg-white/50 dark:bg-slate-800/50">
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
            </div>
          </CardContent>
        </Card>

        {/* Image Upload Section */}
        <Card className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center">
              <ImageIcon className="h-5 w-5 mr-2" />
              Hình ảnh bài viết
            </CardTitle>
          </CardHeader>
          <CardContent>
            {/* Dropzone */}
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-200 ${
                isDragActive
                  ? 'border-primary bg-primary/5 shadow-lg'
                  : 'border-gray-300 dark:border-gray-600 hover:border-primary hover:bg-primary/5 hover:shadow-md'
              }`}
            >
              <input {...getInputProps()} />
              <div className="mx-auto w-16 h-16 bg-gradient-to-r from-primary/10 to-primary/20 rounded-full flex items-center justify-center mb-4">
                <Upload className="h-8 w-8 text-primary" />
              </div>
              <p className="text-lg font-medium mb-2">
                {isDragActive ? 'Thả ảnh vào đây' : 'Kéo thả ảnh vào đây hoặc click để chọn'}
              </p>
              <p className="text-sm text-muted-foreground">
                Hỗ trợ: JPG, PNG, GIF, WEBP (tối đa 5MB mỗi ảnh)
              </p>
            </div>

            {/* Image List */}
            {images.length > 0 && (
              <div className="mt-6">
                <h3 className="text-lg font-medium mb-4 flex items-center">
                  <Sparkles className="h-5 w-5 mr-2 text-primary" />
                  Danh sách ảnh ({images.length})
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {images.map((image, index) => (
                    <div
                      key={index}
                      className="group bg-white dark:bg-slate-800 rounded-xl border border-gray-200/50 dark:border-slate-700/50 p-4 shadow-sm hover:shadow-lg transition-all duration-300"
                    >
                      {/* Image Preview */}
                      <div className="mb-4 relative">
                        <img
                          src={image.preview}
                          alt={image.name}
                          className="w-full h-32 object-cover rounded-lg group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute top-2 right-2">
                          <Badge variant="secondary" className="bg-white/90 dark:bg-slate-800/90">
                            Ảnh {index + 1}
                          </Badge>
                        </div>
                      </div>
                      
                      {/* Image Name Input */}
                      <div className="mb-4 space-y-2">
                        <Label className="text-sm font-medium">Tên hình ảnh</Label>
                        <Input
                          type="text"
                          value={image.name}
                          onChange={(e) => handleImageNameChange(index, e.target.value)}
                          placeholder="Nhập tên hình ảnh"
                          className="bg-white/50 dark:bg-slate-800/50 border-0 focus:ring-2 focus:ring-primary/20"
                        />
                      </div>

                      {/* Remove Button */}
                      <Button
                        type="button"
                        variant="destructive"
                        onClick={() => removeImage(index)}
                        className="w-full hover:bg-red-600 transition-colors"
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
        <div className="flex justify-end">
          <Button
            type="submit"
            className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg hover:shadow-xl transition-all duration-200 px-8 h-12 text-base font-medium"
            disabled={loading}
          >
            {loading ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Đang tạo bài viết...
              </div>
            ) : (
              <div className="flex items-center">
                <Save className="h-5 w-5 mr-2" />
                Tạo bài viết
              </div>
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}
