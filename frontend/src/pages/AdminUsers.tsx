import { useEffect, useState } from 'react'
import { adminListUsers, adminSetRole, type PublicUser, type Role } from '../api'
import { useAuth } from '../context/AuthContext'
import styles from './AdminDashboard.module.css'

const ROLES: Role[] = ['learner', 'instructor', 'admin']

export default function AdminUsers() {
  const { user: currentUser } = useAuth()
  const [users, setUsers] = useState<PublicUser[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [savingId, setSavingId] = useState<string | null>(null)

  const load = async () => {
    setLoading(true)
    setError('')
    try {
      const data = await adminListUsers()
      setUsers(data.users)
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const handleChange = async (id: string, role: Role) => {
    setSavingId(id)
    setError('')
    try {
      await adminSetRole(id, role)
      await load()
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setSavingId(null)
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1>Users</h1>
      </div>
      {error && <p className={styles.error}>{error}</p>}
      {loading ? (
        <p className={styles.empty}>Loading...</p>
      ) : (
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => {
                const isSelf = currentUser?.id === u.id
                return (
                  <tr key={u.id}>
                    <td>
                      {(u.firstName || '') + ' ' + (u.lastName || '')}
                      {isSelf && <span className={styles.muted}> (you)</span>}
                    </td>
                    <td>{u.email}</td>
                    <td>
                      <select
                        value={u.role}
                        disabled={savingId === u.id || isSelf}
                        onChange={(e) => handleChange(u.id, e.target.value as Role)}
                      >
                        {ROLES.map((r) => (
                          <option key={r} value={r}>
                            {r}
                          </option>
                        ))}
                      </select>
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
