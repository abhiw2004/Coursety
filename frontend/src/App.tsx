import { Routes, Route, Navigate } from 'react-router-dom'
import type { ReactNode } from 'react'
import { useAuth } from './context/AuthContext'
import type { Role } from './api'
import Layout from './components/Layout'
import Home from './pages/Home'
import Courses from './pages/Courses'
import CourseDetail from './pages/CourseDetail'
import SignIn from './pages/SignIn'
import SignUp from './pages/SignUp'
import Purchases from './pages/Purchases'
import BecomeInstructor from './pages/BecomeInstructor'
import InstructorDashboard from './pages/InstructorDashboard'
import InstructorCreateCourse from './pages/InstructorCreateCourse'
import InstructorEditCourse from './pages/InstructorEditCourse'
import AdminRequests from './pages/AdminRequests'
import AdminUsers from './pages/AdminUsers'

function RoleRoute({ children, roles }: { children: ReactNode; roles: Role[] }) {
  const { user, loading } = useAuth()
  if (loading) return null
  if (!user) return <Navigate to="/signin" replace />
  if (!roles.includes(user.role)) return <Navigate to="/" replace />
  return <>{children}</>
}

function AuthRoute({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth()
  if (loading) return null
  if (!user) return <Navigate to="/signin" replace />
  return <>{children}</>
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="courses" element={<Courses />} />
        <Route path="courses/:id" element={<CourseDetail />} />

        <Route path="signin" element={<SignIn />} />
        <Route path="signup" element={<SignUp />} />
        <Route path="user/signin" element={<Navigate to="/signin" replace />} />
        <Route path="user/signup" element={<Navigate to="/signup" replace />} />
        <Route path="admin/signin" element={<Navigate to="/signin" replace />} />
        <Route path="admin/signup" element={<Navigate to="/signin" replace />} />

        <Route
          path="purchases"
          element={
            <AuthRoute>
              <Purchases />
            </AuthRoute>
          }
        />
        <Route
          path="become-instructor"
          element={
            <AuthRoute>
              <BecomeInstructor />
            </AuthRoute>
          }
        />

        <Route
          path="instructor"
          element={
            <RoleRoute roles={['instructor', 'admin']}>
              <InstructorDashboard />
            </RoleRoute>
          }
        />
        <Route
          path="instructor/courses/new"
          element={
            <RoleRoute roles={['instructor', 'admin']}>
              <InstructorCreateCourse />
            </RoleRoute>
          }
        />
        <Route
          path="instructor/courses/:id/edit"
          element={
            <RoleRoute roles={['instructor', 'admin']}>
              <InstructorEditCourse />
            </RoleRoute>
          }
        />

        <Route
          path="admin/requests"
          element={
            <RoleRoute roles={['admin']}>
              <AdminRequests />
            </RoleRoute>
          }
        />
        <Route
          path="admin/users"
          element={
            <RoleRoute roles={['admin']}>
              <AdminUsers />
            </RoleRoute>
          }
        />

        <Route path="admin" element={<Navigate to="/instructor" replace />} />
        <Route path="admin/courses/new" element={<Navigate to="/instructor/courses/new" replace />} />
        <Route path="admin/courses/:id/edit" element={<Navigate to="/instructor" replace />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
