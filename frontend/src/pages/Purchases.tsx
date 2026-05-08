import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { listMyPurchases, type Course } from '../api'
import styles from './Courses.module.css'

export default function Purchases() {
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    listMyPurchases()
      .then((data) => {
        const valid = data.purchases.map((p) => p.courseId).filter((c): c is Course => Boolean(c))
        setCourses(valid)
      })
      .catch((e) => setError((e as Error).message))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div className={styles.center}>Loading your courses...</div>
  if (error) return <div className={styles.error}>Error: {error}</div>
  if (!courses.length) {
    return (
      <div className={styles.center}>
        You haven't enrolled in any courses yet. <Link to="/courses">Browse courses</Link>
      </div>
    )
  }

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
              <p>
                {c.description?.slice(0, 100)}
                {c.description && c.description.length > 100 ? '...' : ''}
              </p>
              <span className={styles.price}>View course →</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
