import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getCourse, adminUpdateCourse } from '../api'
import styles from './AdminCreateCourse.module.css'

interface Course {
  _id: string
  title: string
  description: string
  price: number
  imageUrl?: string
}

export default function AdminEditCourse() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [course, setCourse] = useState<Course | null>(null)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [price, setPrice] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!id) return
    getCourse(id)
      .then((data) => {
        const c = data.course
        setCourse(c)
        setTitle(c.title)
        setDescription(c.description)
        setPrice(String(c.price))
        setImageUrl(c.imageUrl || '')
      })
      .catch((e) => setError(e.message))
  }, [id])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!id) return
    setError('')
    const p = parseFloat(price)
    if (isNaN(p) || p < 0) {
      setError('Invalid price')
      return
    }
    setLoading(true)
    try {
      await adminUpdateCourse(id, title, description, p, imageUrl || undefined)
      navigate('/admin')
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setLoading(false)
    }
  }

  if (!course && !error) return <div className={styles.error}>Loading...</div>
  if (error && !course) return <div className={styles.error}>{error}</div>

  return (
    <div className={styles.page}>
      <h1>Edit Course</h1>
      <form className={styles.form} onSubmit={handleSubmit}>
        <label>Title</label>
        <input value={title} onChange={(e) => setTitle(e.target.value)} required />
        <label>Description</label>
        <textarea value={description} onChange={(e) => setDescription(e.target.value)} required rows={5} />
        <label>Price ($)</label>
        <input type="number" step="0.01" min="0" value={price} onChange={(e) => setPrice(e.target.value)} required />
        <label>Image URL (optional)</label>
        <input value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} placeholder="https://..." />
        {error && <p className={styles.error}>{error}</p>}
        <button type="submit" disabled={loading}>{loading ? 'Saving...' : 'Save Changes'}</button>
      </form>
    </div>
  )
}
