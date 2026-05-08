const API_BASE_URL = import.meta.env.VITE_API_BASE_URL?.trim() || '/api/v1'
const API = API_BASE_URL.endsWith('/') ? API_BASE_URL.slice(0, -1) : API_BASE_URL

export type Role = 'learner' | 'instructor' | 'admin'

export interface PublicUser {
  id: string
  email: string
  firstName?: string
  lastName?: string
  role: Role
}

export interface Course {
  _id: string
  title: string
  description: string
  price: number
  imageUrl?: string
  published?: boolean
  creatorId?: string | { _id: string; firstName?: string; lastName?: string }
  createdAt?: string
}

export interface InstructorRequestRecord {
  _id: string
  status: 'pending' | 'approved' | 'rejected'
  reason?: string
  userId?: string | { email: string; firstName?: string; lastName?: string; role: Role; _id: string }
  createdAt?: string
}

const TOKEN_KEY = 'coursety_token'

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY)
}
export function setToken(token: string | null) {
  if (token) localStorage.setItem(TOKEN_KEY, token)
  else localStorage.removeItem(TOKEN_KEY)
}

async function request<T>(path: string, init: RequestInit = {}, auth = false): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...((init.headers as Record<string, string>) || {}),
  }
  if (auth) {
    const token = getToken()
    if (!token) throw new Error('Not authenticated')
    headers['Authorization'] = `Bearer ${token}`
  }
  const res = await fetch(`${API}${path}`, { ...init, headers })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    const message = (data && (data.message || data.error)) || `Request failed (${res.status})`
    throw new Error(message)
  }
  return data as T
}

export async function signup(input: {
  email: string
  password: string
  firstName?: string
  lastName?: string
}): Promise<{ token: string; user: PublicUser }> {
  return request('/auth/signup', { method: 'POST', body: JSON.stringify(input) })
}

export async function signin(email: string, password: string): Promise<{ token: string; user: PublicUser }> {
  return request('/auth/signin', { method: 'POST', body: JSON.stringify({ email, password }) })
}

export async function me(): Promise<{ user: PublicUser }> {
  return request('/auth/me', {}, true)
}

export async function listCourses(): Promise<{ courses: Course[] }> {
  return request('/courses')
}

export async function getCourse(id: string): Promise<{ course: Course; creator?: { firstName?: string; lastName?: string } }> {
  const headers: Record<string, string> = {}
  const token = getToken()
  if (token) headers['Authorization'] = `Bearer ${token}`
  const res = await fetch(`${API}/courses/${id}`, { headers })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data.message || 'Course not found')
  return data
}

export async function enrollCourse(id: string): Promise<{ message: string }> {
  return request(`/courses/${id}/enroll`, { method: 'POST' }, true)
}

export async function getCourseAccess(id: string): Promise<{ access: boolean }> {
  return request(`/courses/${id}/access`, {}, true)
}

export async function listMyPurchases(): Promise<{ purchases: { _id: string; courseId: Course | null }[] }> {
  return request('/courses/me/purchases', {}, true)
}

export async function requestInstructor(reason?: string): Promise<{ request: InstructorRequestRecord }> {
  return request('/instructor/request', { method: 'POST', body: JSON.stringify({ reason }) }, true)
}

export async function getMyInstructorRequest(): Promise<{ request: InstructorRequestRecord | null }> {
  return request('/instructor/request', {}, true)
}

export async function listMyCourses(): Promise<{ courses: Course[] }> {
  return request('/instructor/courses', {}, true)
}

export async function createCourse(input: {
  title: string
  description: string
  price: number
  imageUrl?: string
  published?: boolean
}): Promise<{ course: Course }> {
  return request('/instructor/courses', { method: 'POST', body: JSON.stringify(input) }, true)
}

export async function updateCourse(
  id: string,
  input: Partial<{ title: string; description: string; price: number; imageUrl: string; published: boolean }>
): Promise<{ course: Course }> {
  return request(`/instructor/courses/${id}`, { method: 'PUT', body: JSON.stringify(input) }, true)
}

export async function deleteCourse(id: string): Promise<{ message: string }> {
  return request(`/instructor/courses/${id}`, { method: 'DELETE' }, true)
}

export async function adminListInstructorRequests(status: 'pending' | 'approved' | 'rejected' = 'pending'): Promise<{ requests: InstructorRequestRecord[] }> {
  return request(`/admin/instructor-requests?status=${status}`, {}, true)
}

export async function adminApproveRequest(id: string): Promise<{ request: InstructorRequestRecord }> {
  return request(`/admin/instructor-requests/${id}/approve`, { method: 'POST' }, true)
}

export async function adminRejectRequest(id: string): Promise<{ request: InstructorRequestRecord }> {
  return request(`/admin/instructor-requests/${id}/reject`, { method: 'POST' }, true)
}

export async function adminListUsers(): Promise<{ users: PublicUser[] }> {
  return request('/admin/users', {}, true)
}

export async function adminSetRole(userId: string, role: Role): Promise<{ user: PublicUser }> {
  return request(`/admin/users/${userId}/role`, { method: 'POST', body: JSON.stringify({ role }) }, true)
}
