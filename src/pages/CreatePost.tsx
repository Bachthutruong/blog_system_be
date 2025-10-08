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
// import { Badge } from '@/components/ui/badge'

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
    
    if (!title.trim()) {
      toast.error('請輸入文章標題')
      return
    }

    setLoading(true)
    try {
      // Create post first
      const post = await postService.createPost({
        title: title.trim(),
        // description and content are optional now
        description: description.trim(),
        content: content.trim()
      })
      


      // Upload images if any
      if (images.length > 0) {
        const imageFiles = images.map(img => img.file)
        const imageNames = images.map(img => img.name)
        try {
          await postService.uploadImages(post._id, imageFiles, imageNames)
          toast.success('圖片上傳成功！')
        } catch (e: any) {
          toast.error(e.response?.data?.error || e.message || '圖片上傳失敗')
        }
      }

      toast.success('建立文章成功！')
      navigate('/')
    } catch (error: any) {
      toast.error(error.response?.data?.error || '無法建立文章')
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
            建立新文章
          </h1>
          <p className="mt-2 text-muted-foreground">
            撰寫並分享您的精彩內容
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => navigate('/')}
          className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          返回
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Post Information */}
        <Card className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileText className="h-5 w-5 mr-2" />
              文章資訊
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="title" className="text-sm font-medium">
                文章標題 *
              </Label>
              <Input
                id="title"
                type="text"
                placeholder="請輸入文章標題..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="bg-white/50 dark:bg-slate-800/50 border-0 focus:ring-2 focus:ring-primary/20 transition-all duration-200"
                required
              />
            </div>

            {/* Description hidden as requested */}
            {false && (
              <div className="space-y-2">
                <Label htmlFor="description" className="text-sm font-medium">
                  簡短描述
                </Label>
                <Textarea
                  id="description"
                  placeholder="請輸入文章的簡短描述..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="min-h-[100px] bg-white/50 dark:bg-slate-800/50 border-0 focus:ring-2 focus:ring-primary/20 transition-all duration-200"
                />
              </div>
            )}

            {/* Content hidden as requested */}
            {false && (
              <div className="space-y-2">
                <Label htmlFor="content" className="text-sm font-medium">
                  文章內容
                </Label>
                <div className="border rounded-lg overflow-hidden bg-white/50 dark:bg-slate-800/50">
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
              </div>
            )}
          </CardContent>
        </Card>

        {/* Image Upload Section */}
        <Card className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center">
              <ImageIcon className="h-5 w-5 mr-2" />
              文章圖片
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
                {isDragActive ? '將圖片拖放到此處' : '拖放圖片到此或點擊選擇'}
              </p>
              <p className="text-sm text-muted-foreground">
                支援：JPG、PNG、GIF、WEBP（每張最多 5MB）
              </p>
            </div>

            {/* Image List */}
            {images.length > 0 && (
              <div className="mt-6">
                <h3 className="text-lg font-medium mb-4 flex items-center">
                  <Sparkles className="h-5 w-5 mr-2 text-primary" />
                  圖片清單（{images.length}）
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {images.map((image, index) => (
                    <div key={index} className="relative border rounded-lg overflow-hidden bg-white dark:bg-slate-800">
                      {/* remove */}
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute top-2 right-2 z-10 inline-flex h-6 w-6 items-center justify-center rounded bg-red-500 text-white shadow hover:bg-red-600"
                        aria-label="remove"
                      >
                        <X className="h-4 w-4" />
                      </button>

                      {/* Row 1: title (full border-bottom) */}
                      <div className="p-3 border-b">
                        <Label className="text-xs text-muted-foreground block mb-1">圖片名稱</Label>
                        <Input
                          type="text"
                          value={image.name}
                          onChange={(e) => handleImageNameChange(index, e.target.value)}
                          placeholder="請輸入圖片名稱"
                          className="bg-transparent"
                        />
                      </div>

                      {/* Row 2: image */}
                      <div className="p-3">
                        <img src={image.preview} alt={image.name} className="w-full h-40 object-cover rounded" />
                      </div>
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
                正在建立文章...
              </div>
            ) : (
              <div className="flex items-center">
                <Save className="h-5 w-5 mr-2" />
                建立文章
              </div>
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}
