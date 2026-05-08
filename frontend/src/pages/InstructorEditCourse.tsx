import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { getCourse, updateCourse, deleteCourse } from '../api'
import styles from './AdminCreateCourse.module.css'

export default function InstructorEditCourse() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [price, setPrice] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [published, setPublished] = useState(false)
  const [loading, setLoading] = useState(false)
  const [loadingPage, setLoadingPage] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!id) return
    getCourse(id)
      .then((data) => {
        const c = data.course
        setTitle(c.title)
        setDescription(c.description)
        setPrice(String(c.price))
        setImageUrl(c.imageUrl || '')
        setPublished(Boolean(c.published))
      })
      .catch((e) => setError((e as Error).message))
      .finally(() => setLoadingPage(false))
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
      await updateCourse(id, {
        title,
        description,
        price: p,
        imageUrl: imageUrl || '',
        published,
      })
      navigate('/instructor')
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!id) return
    if (!confirm('Delete this course? This cannot be undone.')) return
    try {
      await deleteCourse(id)
      navigate('/instructor')
    } catch (err) {
      setError((err as Error).message)
    }
  }

  if (loadingPage) return <div className={styles.page}>Loading...</div>
  if (error && !title) return <div className={styles.page}>{error}</div>

  return (
    <div className={styles.page}>
      <h1>Edit Course</h1>
      <form className={styles.form} onSubmit={handleSubmit}>
        <label>Title</label>
        <input value={title} onChange={(e) => setTitle(e.target.value)} required maxLength={200} />
        <label>Description</label>
        <textarea value={description} onChange={(e) => setDescription(e.target.value)} required rows={5} maxLength={5000} />
        <label>Price ($)</label>
        <input type="number" step="0.01" min="0" value={price} onChange={(e) => setPrice(e.target.value)} required />
        <label>Thumbnail URL (optional)</label>
        <input value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} placeholder="https://..." />
        <label className={styles.checkbox}>
          <input type="checkbox" checked={published} onChange={(e) => setPublished(e.target.checked)} />
          Published
        </label>
        {error && <p className={styles.error}>{error}</p>}
        <div className={styles.actions}>
          <button type="submit" disabled={loading}>{loading ? 'Saving...' : 'Save Changes'}</button>
          <button type="button" onClick={handleDelete} className={styles.danger}>Delete</button>
        </div>
      </form>
    </div>
  )
}
