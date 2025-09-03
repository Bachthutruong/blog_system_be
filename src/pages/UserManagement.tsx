import { useState, useEffect } from 'react'
import { userService } from '../services/userService'
import { User } from '../../../shared/types'
import { Plus, Search, Edit, Trash2, User as UserIcon, Calendar } from 'lucide-react'
import { format } from 'date-fns'
import toast from 'react-hot-toast'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  // DialogTrigger,
} from '@/components/ui/dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

export default function UserManagement() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filteredUsers, setFilteredUsers] = useState<User[]>([])
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [form, setForm] = useState<{ username: string; email: string; password?: string; role: 'admin' | 'employee' }>({ username: '', email: '', password: '', role: 'employee' })

  useEffect(() => {
    fetchUsers()
  }, [])

  useEffect(() => {
    const filtered = users.filter(user =>
      user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
    )
    setFilteredUsers(filtered)
  }, [users, searchTerm])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const response = await userService.getAllUsers()
      setUsers(response)
    } catch (error) {
      toast.error('Không thể tải danh sách người dùng')
    } finally {
      setLoading(false)
    }
  }

  const openAddDialog = () => {
    setForm({ username: '', email: '', password: '', role: 'employee' })
    setIsAddOpen(true)
  }

  const openEditDialog = (user: User) => {
    setEditingUser(user)
    setForm({ username: user.username, email: user.email, role: user.role })
    setIsEditOpen(true)
  }

  const handleCreate = async () => {
    try {
      if (!form.username || !form.email || !form.password) {
        toast.error('Vui lòng nhập đủ thông tin')
        return
      }
      const created = await userService.createUser({
        username: form.username,
        email: form.email,
        password: form.password!,
        role: form.role,
      })
      toast.success('Tạo người dùng thành công')
      setIsAddOpen(false)
      setUsers([created, ...users])
    } catch (e) {
      toast.error('Không thể tạo người dùng')
    }
  }

  const handleUpdate = async () => {
    if (!editingUser) return
    try {
      const updated = await userService.updateUser(editingUser._id, {
        username: form.username,
        email: form.email,
        role: form.role,
      } as any)
      toast.success('Cập nhật người dùng thành công')
      setIsEditOpen(false)
      setUsers(users.map(u => (u._id === updated._id ? updated : u)))
    } catch (e) {
      toast.error('Không thể cập nhật người dùng')
    }
  }

  const handleDeleteUser = async (userId: string, username: string) => {
    if (!window.confirm(`Bạn có chắc chắn muốn xóa người dùng "${username}"?`)) {
      return
    }

    try {
      await userService.deleteUser(userId)
      toast.success('Xóa người dùng thành công')
      fetchUsers()
    } catch (error) {
      toast.error('Không thể xóa người dùng')
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Quản lý người dùng</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Quản lý tất cả người dùng trong hệ thống
          </p>
        </div>
        <Button onClick={openAddDialog} className="mt-4 sm:mt-0">
          <Plus className="h-4 w-4 mr-2" /> Thêm người dùng
        </Button>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Tìm kiếm người dùng..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>Danh sách người dùng ({filteredUsers.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredUsers.length === 0 ? (
            <div className="text-center py-12">
              <UserIcon className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">Không có người dùng nào</h3>
              <p className="text-muted-foreground">
                {searchTerm ? 'Thử thay đổi từ khóa tìm kiếm' : 'Chưa có người dùng nào trong hệ thống'}
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Người dùng</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Vai trò</TableHead>
                  <TableHead>Ngày tạo</TableHead>
                  <TableHead className="text-right">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user._id}>
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <Avatar>
                          <AvatarFallback>
                            {user.username.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{user.username}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                        {user.role === 'admin' ? 'Quản trị viên' : 'Nhân viên'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        {format(new Date(user.createdAt), 'dd/MM/yyyy')}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button variant="outline" size="sm" onClick={() => openEditDialog(user)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeleteUser(user._id, user.username)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Add User Dialog */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Thêm người dùng</DialogTitle>
            <DialogDescription>Nhập thông tin người dùng mới</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <Input
              placeholder="Tên người dùng"
              value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
            />
            <Input
              type="email"
              placeholder="Email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
            <Input
              type="password"
              placeholder="Mật khẩu"
              value={form.password || ''}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
            <Select value={form.role} onValueChange={(v: 'admin' | 'employee') => setForm({ ...form, role: v })}>
              <SelectTrigger>
                <SelectValue placeholder="Chọn vai trò" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="employee">Nhân viên</SelectItem>
                <SelectItem value="admin">Quản trị viên</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setIsAddOpen(false)}>Hủy</Button>
            <Button onClick={handleCreate}>Tạo</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit User Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Chỉnh sửa người dùng</DialogTitle>
            <DialogDescription>Cập nhật thông tin người dùng</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <Input
              placeholder="Tên người dùng"
              value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
            />
            <Input
              type="email"
              placeholder="Email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
            <Select value={form.role} onValueChange={(v: 'admin' | 'employee') => setForm({ ...form, role: v })}>
              <SelectTrigger>
                <SelectValue placeholder="Chọn vai trò" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="employee">Nhân viên</SelectItem>
                <SelectItem value="admin">Quản trị viên</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setIsEditOpen(false)}>Hủy</Button>
            <Button onClick={handleUpdate}>Lưu</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

// Add Dialogs
// We append at end to keep structure simple
// Using same component file for brevity

