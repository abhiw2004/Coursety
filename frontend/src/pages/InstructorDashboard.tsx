import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { listMyCourses, type Course } from '../api'
import styles from './AdminDashboard.module.css'

export default function InstructorDashboard() {
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    listMyCourses()
      .then((data) => setCourses(data.courses))
      .catch((e) => setError((e as Error).message))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div className={styles.center}>Loading...</div>
  if (error) return <div className={styles.error}>Error: {error}</div>

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1>Instructor Dashboard</h1>
        <Link to="/instructor/courses/new" className={styles.addBtn}>+ New Course</Link>
      </div>
      {courses.length === 0 ? (
        <p className={styles.empty}>No courses yet. Create your first course.</p>
      ) : (
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Title</th>
                <th>Price</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {courses.map((c) => (
                <tr key={c._id}>
                  <td>{c.title}</td>
                  <td>${c.price}</td>
                  <td>{c.published ? 'Published' : 'Draft'}</td>
                  <td>
                    <Link to={`/instructor/courses/${c._id}/edit`} className={styles.edit}>Edit</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
