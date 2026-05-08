import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getMyInstructorRequest, requestInstructor, type InstructorRequestRecord } from '../api'
import { useAuth } from '../context/AuthContext'
import styles from './AdminCreateCourse.module.css'

export default function BecomeInstructor() {
  const { user, isInstructor } = useAuth()
  const [reason, setReason] = useState('')
  const [request, setRequest] = useState<InstructorRequestRecord | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    getMyInstructorRequest()
      .then((data) => setRequest(data.request))
      .catch((e) => setError((e as Error).message))
      .finally(() => setLoading(false))
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError('')
    try {
      const data = await requestInstructor(reason)
      setRequest(data.request)
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return <div className={styles.page}>Loading...</div>

  if (isInstructor) {
    return (
      <div className={styles.page}>
        <h1>You are already an instructor</h1>
        <p>Head over to your <Link to="/instructor">instructor dashboard</Link> to manage your courses.</p>
      </div>
    )
  }

  if (request && request.status === 'pending') {
    return (
      <div className={styles.page}>
        <h1>Request submitted</h1>
        <p>Hi {user?.firstName || user?.email}, your instructor request is pending review by an admin. We'll update your account once a decision has been made.</p>
      </div>
    )
  }

  if (request && request.status === 'rejected') {
    return (
      <div className={styles.page}>
        <h1>Request rejected</h1>
        <p>Your previous request was rejected. You can submit a new one with more detail below.</p>
        <RequestForm reason={reason} setReason={setReason} onSubmit={handleSubmit} submitting={submitting} error={error} />
      </div>
    )
  }

  return (
    <div className={styles.page}>
      <h1>Become an instructor</h1>
      <p>Tell us a bit about why you want to teach on CourseTy. Once approved, you can publish courses and manage their content.</p>
      <RequestForm reason={reason} setReason={setReason} onSubmit={handleSubmit} submitting={submitting} error={error} />
    </div>
  )
}

function RequestForm(props: {
  reason: string
  setReason: (v: string) => void
  onSubmit: (e: React.FormEvent) => void
  submitting: boolean
  error: string
}) {
  return (
    <form className={styles.form} onSubmit={props.onSubmit}>
      <label htmlFor="reason">Why do you want to teach?</label>
      <textarea
        id="reason"
        rows={5}
        value={props.reason}
        onChange={(e) => props.setReason(e.target.value)}
        placeholder="Briefly describe your background and what you want to teach..."
      />
      {props.error && <p className={styles.error}>{props.error}</p>}
      <button type="submit" disabled={props.submitting}>
        {props.submitting ? 'Submitting...' : 'Submit Request'}
      </button>
    </form>
  )
}
