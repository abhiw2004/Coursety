import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getUserPurchases } from '../api'
import styles from './Courses.module.css'

interface Course {
  _id: string
  title: string
  description: string
  price: number
  imageUrl?: string
}

interface Purchase {
  _id: string
  courseId: Course
}

export default function Purchases() {
  const [purchases, setPurchases] = useState<Purchase[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    getUserPurchases()
      .then((data) => setPurchases(data.purchases || []))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div className={styles.center}>Loading your courses...</div>
  if (error) return <div className={styles.error}>Error: {error}</div>
  if (!purchases.length) return <div className={styles.center}>You haven't purchased any courses yet. <Link to="/courses">Browse courses</Link></div>

  const courses = purchases.map((p) => p.courseId).filter(Boolean)

  return (
    <div className={styles.page}>
      <h1>My Courses</h1>
      <div className={styles.grid}>
        {courses.map((c) => (
          <Link key={c._id} to={`/courses/${c._id}`} className={styles.card}>
            <div className={styles.imgWrap}>
              {c.imageUrl ? (
                <img src={c.imageUrl} alt={c.title} />
              ) : (
                <div className={styles.placeholder}>Course</div>
              )}
            </div>
            <div className={styles.content}>
              <h3>{c.title}</h3>
              <p>{c.description?.slice(0, 100)}{c.description?.length > 100 ? '...' : ''}</p>
              <span className={styles.price}>View course →</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
