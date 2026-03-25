import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getCourse, purchaseCourse } from '../api'
import { useAuth } from '../context/AuthContext'
import styles from './CourseDetail.module.css'

interface Course {
  _id: string
  title: string
  description: string
  price: number
  imageUrl?: string
}

export default function CourseDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { userToken } = useAuth()
  const [course, setCourse] = useState<Course | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [purchasing, setPurchasing] = useState(false)
  const [purchaseMsg, setPurchaseMsg] = useState('')

  useEffect(() => {
    if (!id) return
    getCourse(id)
      .then((data) => setCourse(data.course))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [id])

  const handlePurchase = async () => {
    if (!userToken) {
      navigate('/user/signin')
      return
    }
    if (!id) return
    setPurchasing(true)
    setPurchaseMsg('')
    try {
      await purchaseCourse(id)
      setPurchaseMsg('Purchase successful! Check My Courses.')
    } catch (e) {
      setPurchaseMsg((e as Error).message)
    } finally {
      setPurchasing(false)
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
          <button onClick={handlePurchase} disabled={purchasing} className={styles.buyBtn}>
            {purchasing ? 'Processing...' : 'Purchase'}
          </button>
        </div>
        {purchaseMsg && <p className={purchaseMsg.includes('Error') ? styles.err : styles.success}>{purchaseMsg}</p>}
      </div>
    </div>
  )
}
