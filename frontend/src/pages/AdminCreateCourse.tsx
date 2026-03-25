import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { adminCreateCourse } from '../api'
import styles from './AdminCreateCourse.module.css'

export default function AdminCreateCourse() {
  const navigate = useNavigate()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [price, setPrice] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    const p = parseFloat(price)
    if (isNaN(p) || p < 0) {
      setError('Invalid price')
      return
    }
    setLoading(true)
    try {
      await adminCreateCourse(title, description, p, imageUrl || undefined)
      navigate('/admin')
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles.page}>
      <h1>Create Course</h1>
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
        <button type="submit" disabled={loading}>{loading ? 'Creating...' : 'Create Course'}</button>
      </form>
    </div>
  )
}
