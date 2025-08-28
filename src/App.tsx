import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth, AuthProvider } from './hooks/useAuth'
import Layout from './components/Layout'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import CreatePost from './pages/CreatePost'
import EditPost from './pages/EditPost'
import PostDetail from './pages/PostDetail'
import PostHistory from './pages/PostHistory'
import UserManagement from './pages/UserManagement'
import LoadingSpinner from './components/LoadingSpinner'

function AppContent() {
  const { user, loading } = useAuth()

  if (loading) {
    return <LoadingSpinner />
  }

  if (!user) {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        {/* Public view-only post route */}
        <Route path="/post/:postId" element={<PostDetail />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    )
  }

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/create-post" element={<CreatePost />} />
        <Route path="/edit-post/:postId" element={<EditPost />} />
        <Route path="/post/:postId" element={<PostDetail />} />
        <Route path="/post/:postId/history" element={<PostHistory />} />
        {user.role === 'admin' && (
          <Route path="/users" element={<UserManagement />} />
        )}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  )
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}

export default App
