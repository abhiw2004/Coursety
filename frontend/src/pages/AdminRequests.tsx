import { useEffect, useState } from 'react'
import {
  adminApproveRequest,
  adminListInstructorRequests,
  adminRejectRequest,
  type InstructorRequestRecord,
} from '../api'
import styles from './AdminDashboard.module.css'

type Filter = 'pending' | 'approved' | 'rejected'

export default function AdminRequests() {
  const [filter, setFilter] = useState<Filter>('pending')
  const [requests, setRequests] = useState<InstructorRequestRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [actingOn, setActingOn] = useState<string | null>(null)

  const load = async (status: Filter) => {
    setLoading(true)
    setError('')
    try {
      const data = await adminListInstructorRequests(status)
      setRequests(data.requests)
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load(filter)
  }, [filter])

  const handleApprove = async (id: string) => {
    setActingOn(id)
    try {
      await adminApproveRequest(id)
      await load(filter)
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setActingOn(null)
    }
  }

  const handleReject = async (id: string) => {
    setActingOn(id)
    try {
      await adminRejectRequest(id)
      await load(filter)
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setActingOn(null)
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1>Instructor Requests</h1>
        <div className={styles.filters}>
          {(['pending', 'approved', 'rejected'] as Filter[]).map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFilter(f)}
              className={f === filter ? styles.filterActive : styles.filter}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {error && <p className={styles.error}>{error}</p>}
      {loading ? (
        <p className={styles.empty}>Loading...</p>
      ) : requests.length === 0 ? (
        <p className={styles.empty}>No {filter} requests.</p>
      ) : (
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>User</th>
                <th>Reason</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {requests.map((r) => {
                const u = typeof r.userId === 'object' ? r.userId : null
                return (
                  <tr key={r._id}>
                    <td>
                      {u ? (
                        <>
                          <div>{u.firstName || ''} {u.lastName || ''}</div>
                          <div className={styles.muted}>{u.email}</div>
                        </>
                      ) : (
                        '—'
                      )}
                    </td>
                    <td>{r.reason || <span className={styles.muted}>(no reason given)</span>}</td>
                    <td>{r.status}</td>
                    <td>
                      {r.status === 'pending' ? (
                        <div className={styles.rowActions}>
                          <button
                            type="button"
                            onClick={() => handleApprove(r._id)}
                            disabled={actingOn === r._id}
                            className={styles.approve}
                          >
                            Approve
                          </button>
                          <button
                            type="button"
                            onClick={() => handleReject(r._id)}
                            disabled={actingOn === r._id}
                            className={styles.danger}
                          >
                            Reject
                          </button>
                        </div>
                      ) : (
                        <span className={styles.muted}>—</span>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
