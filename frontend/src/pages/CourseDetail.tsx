import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { enrollCourse, getCourse, type Course } from '../api'
import { useAuth } from '../context/AuthContext'
import styles from './CourseDetail.module.css'

export default function CourseDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [course, setCourse] = useState<Course | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [enrolling, setEnrolling] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (!id) return
    getCourse(id)
      .then((data) => setCourse(data.course))
      .catch((e) => setError((e as Error).message))
      .finally(() => setLoading(false))
  }, [id])

  const handleEnroll = async () => {
    if (!user) {
      navigate('/signin')
      return
    }
    if (!id) return
    setEnrolling(true)
    setMessage('')
    try {
      await enrollCourse(id)
      setMessage('Enrolled. Find it under My Courses.')
    } catch (e) {
      setMessage((e as Error).message)
    } finally {
      setEnrolling(false)
    }
  }

  if (loading) return <div className={styles.center}>Loading...</div>
  if (error || !course) return <div className={styles.error}>{error || 'Course not found'}</div>

  return (
    <div className={styles.page}>
      <div className={styles.imgSection}>
        {course.imageUrl ? (
          <img src={course.imageUrl} alt={course.title} />
        ) : (
          <div className={styles.placeholder}>Course</div>
        )}
      </div>
      <div className={styles.content}>
        <h1>{course.title}</h1>
        <p className={styles.desc}>{course.description}</p>
        <div className={styles.footer}>
          <span className={styles.price}>${course.price}</span>
          <button onClick={handleEnroll} disabled={enrolling} className={styles.buyBtn}>
            {enrolling ? 'Enrolling...' : 'Enroll'}
          </button>
        </div>
        {message && (
          <p className={message.toLowerCase().includes('enrolled') ? styles.success : styles.err}>{message}</p>
        )}
      </div>
    </div>
  )
}
