import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import {
  createPaymentOrder,
  enrollCourse,
  getCourse,
  getCourseCurriculum,
  openRazorpayCheckout,
  verifyPayment,
  type Course,
  type Section,
} from '../api'
import { useAuth } from '../context/AuthContext'
import { formatDuration, formatPrice } from '../utils/format'
import styles from './CourseDetail.module.css'

export default function CourseDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [course, setCourse] = useState<Course | null>(null)
  const [sections, setSections] = useState<Section[]>([])
  const [enrolled, setEnrolled] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [processing, setProcessing] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (!id) return
    Promise.all([getCourse(id), getCourseCurriculum(id).catch(() => null)])
      .then(([courseData, curriculumData]) => {
        setCourse(courseData.course)
        setEnrolled(Boolean(courseData.enrolled))
        if (curriculumData) setSections(curriculumData.sections)
      })
      .catch((e) => setError((e as Error).message))
      .finally(() => setLoading(false))
  }, [id])

  const handleFreeEnroll = async () => {
    if (!user) {
      navigate('/signin')
      return
    }
    if (!id) return
    setProcessing(true)
    setMessage('')
    try {
      await enrollCourse(id)
      setEnrolled(true)
      setMessage('Enrolled! Start learning now.')
    } catch (e) {
      setMessage((e as Error).message)
    } finally {
      setProcessing(false)
    }
  }

  const handleBuy = async () => {
    if (!user) {
      navigate('/signin')
      return
    }
    if (!id || !course) return
    setProcessing(true)
    setMessage('')
    try {
      const order = await createPaymentOrder(id)
      await openRazorpayCheckout(
        order,
        user,
        async (response) => {
          try {
            await verifyPayment(response)
            setEnrolled(true)
            setMessage('Payment successful! You are now enrolled.')
          } catch (e) {
            setMessage((e as Error).message)
          } finally {
            setProcessing(false)
          }
        },
        () => setProcessing(false)
      )
    } catch (e) {
      setMessage((e as Error).message)
      setProcessing(false)
    }
  }

  const handleAction = () => {
    if (enrolled) {
      navigate(`/courses/${id}/learn`)
      return
    }
    if (!course) return
    if (course.price <= 0) handleFreeEnroll()
    else handleBuy()
  }

  if (loading) return <div className={styles.center}>Loading...</div>
  if (error || !course) return <div className={styles.error}>{error || 'Course not found'}</div>

  const lessonCount = course.lessonCount ?? sections.reduce((n, s) => n + s.lessons.length, 0)
  const isFree = course.price <= 0

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

        {lessonCount > 0 && (
          <p className={styles.meta}>
            {lessonCount} lesson{lessonCount !== 1 ? 's' : ''}
            {course.sectionCount ? ` · ${course.sectionCount} section${course.sectionCount !== 1 ? 's' : ''}` : ''}
          </p>
        )}

        <div className={styles.footer}>
          <span className={styles.price}>{formatPrice(course.price)}</span>
          <button onClick={handleAction} disabled={processing} className={styles.buyBtn}>
            {processing
              ? 'Processing...'
              : enrolled
                ? 'Go to course'
                : isFree
                  ? 'Enroll for free'
                  : 'Buy now'}
          </button>
        </div>

        {message && (
          <p className={message.toLowerCase().includes('success') || message.toLowerCase().includes('enrolled') ? styles.success : styles.err}>
            {message}
          </p>
        )}

        {sections.length > 0 && (
          <div className={styles.curriculum}>
            <h2>Course content</h2>
            {sections.map((section) => (
              <div key={section._id} className={styles.section}>
                <h3>{section.title}</h3>
                <ul>
                  {section.lessons.map((lesson) => (
                    <li key={lesson._id}>
                      {lesson.isPreview && user ? (
                        <Link to={`/courses/${id}/learn?lesson=${lesson._id}`} className={styles.lessonLink}>
                          {lesson.title}
                        </Link>
                      ) : (
                        <span>{lesson.title}</span>
                      )}
                      <span className={styles.lessonMeta}>
                        {lesson.isPreview && <span className={styles.previewTag}>Preview</span>}
                        {lesson.duration ? formatDuration(lesson.duration) : ''}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
            {!enrolled && !isFree && (
              <p className={styles.previewNote}>Enroll to unlock all lessons. Preview lessons are free to watch.</p>
            )}
            {enrolled && (
              <Link to={`/courses/${id}/learn`} className={styles.learnLink}>
                Start learning →
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
