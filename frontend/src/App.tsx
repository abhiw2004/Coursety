import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import Layout from './components/Layout'
import Home from './pages/Home'
import Courses from './pages/Courses'
import CourseDetail from './pages/CourseDetail'
import UserSignIn from './pages/UserSignIn'
import UserSignUp from './pages/UserSignUp'
import AdminSignIn from './pages/AdminSignIn'
import AdminSignUp from './pages/AdminSignUp'
import Purchases from './pages/Purchases'
import AdminDashboard from './pages/AdminDashboard'
import AdminCreateCourse from './pages/AdminCreateCourse'
import AdminEditCourse from './pages/AdminEditCourse'

function ProtectedRoute({ children, require }: { children: React.ReactNode; require: 'user' | 'admin' }) {
  const { userToken, adminToken } = useAuth()
  const hasAccess = require === 'user' ? userToken : adminToken
  if (!hasAccess) return <Navigate to={require === 'user' ? '/user/signin' : '/admin/signin'} replace />
  return <>{children}</>
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="courses" element={<Courses />} />
        <Route path="courses/:id" element={<CourseDetail />} />
        <Route path="user/signin" element={<UserSignIn />} />
        <Route path="user/signup" element={<UserSignUp />} />
        <Route path="admin/signin" element={<AdminSignIn />} />
        <Route path="admin/signup" element={<AdminSignUp />} />
        <Route path="purchases" element={<ProtectedRoute require="user"><Purchases /></ProtectedRoute>} />
        <Route path="admin" element={<ProtectedRoute require="admin"><AdminDashboard /></ProtectedRoute>} />
        <Route path="admin/courses/new" element={<ProtectedRoute require="admin"><AdminCreateCourse /></ProtectedRoute>} />
        <Route path="admin/courses/:id/edit" element={<ProtectedRoute require="admin"><AdminEditCourse /></ProtectedRoute>} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
