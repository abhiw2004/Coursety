const API_BASE_URL = import.meta.env.VITE_API_BASE_URL?.trim() || '/api/v1';
const API = API_BASE_URL.endsWith('/') ? API_BASE_URL.slice(0, -1) : API_BASE_URL;

function getToken(type: 'user' | 'admin'): string | null {
  return localStorage.getItem(`${type}Token`);
}

export async function userSignup(email: string, password: string, firstName?: string, lastName?: string) {
  const res = await fetch(`${API}/user/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, firstName, lastName }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || 'Signup failed');
  return data;
}

export async function userSignin(email: string, password: string) {
  const res = await fetch(`${API}/user/signin`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || 'Sign in failed');
  return data;
}

export async function adminSignup(email: string, password: string) {
  const res = await fetch(`${API}/admin/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || 'Admin signup failed');
  return data;
}

export async function adminSignin(email: string, password: string) {
  const res = await fetch(`${API}/admin/signin`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || 'Admin sign in failed');
  return data;
}

export async function getCourses() {
  const res = await fetch(`${API}/course/preview`);
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || 'Failed to fetch courses');
  return data;
}

export async function getCourse(id: string) {
  const res = await fetch(`${API}/course/${id}`);
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || 'Course not found');
  return data;
}

export async function purchaseCourse(courseId: string) {
  const token = getToken('user');
  if (!token) throw new Error('You must be signed in to purchase');
  const res = await fetch(`${API}/course/purchase`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      'token': token,
    },
    body: JSON.stringify({ courseId }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || 'Purchase failed');
  return data;
}

export async function getUserPurchases() {
  const token = getToken('user');
  if (!token) throw new Error('Not signed in');
  const res = await fetch(`${API}/user/purchases`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'token': token,
    },
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || 'Failed to fetch purchases');
  return data;
}

export async function adminCreateCourse(title: string, description: string, price: number, imageUrl?: string) {
  const token = getToken('admin');
  if (!token) throw new Error('Admin not signed in');
  const res = await fetch(`${API}/admin/course`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      'token': token,
    },
    body: JSON.stringify({ title, description, price, imageUrl }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || 'Failed to create course');
  return data;
}

export async function adminUpdateCourse(courseId: string, title: string, description: string, price: number, imageUrl?: string) {
  const token = getToken('admin');
  if (!token) throw new Error('Admin not signed in');
  const res = await fetch(`${API}/admin/course`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      'token': token,
    },
    body: JSON.stringify({ courseId, title, description, price, imageUrl }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || 'Failed to update course');
  return data;
}

export async function adminGetCourses() {
  const token = getToken('admin');
  if (!token) throw new Error('Admin not signed in');
  const res = await fetch(`${API}/admin/course/bulk`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'token': token,
    },
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || 'Failed to fetch courses');
  return data;
}
