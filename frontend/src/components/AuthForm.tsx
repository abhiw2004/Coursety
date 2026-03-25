import { useState, FormEvent, ReactNode } from 'react'
import styles from './AuthForm.module.css'

interface AuthFormProps {
  title: string
  submitLabel: string
  onSubmit: (email: string, password: string, extra?: Record<string, string>) => Promise<void>
  footer: ReactNode
  extraFields?: { name: string; label: string; type?: string }[]
}

export default function AuthForm({ title, submitLabel, onSubmit, footer, extraFields }: AuthFormProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [extra, setExtra] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await onSubmit(email, password, Object.keys(extra).length ? extra : undefined)
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles.wrapper}>
      <form className={styles.form} onSubmit={handleSubmit}>
        <h1>{title}</h1>
        <label htmlFor="email">Email</label>
        <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" />
        <label htmlFor="password">Password</label>
        <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} autoComplete="current-password" />
        {extraFields?.map((f) => (
          <div key={f.name}>
            <label htmlFor={f.name}>{f.label}</label>
            <input
              id={f.name}
              type={f.type || 'text'}
              value={extra[f.name] || ''}
              onChange={(e) => setExtra((prev) => ({ ...prev, [f.name]: e.target.value }))}
            />
          </div>
        ))}
        {error && <p className={styles.error}>{error}</p>}
        <button type="submit" disabled={loading}>
          {loading ? 'Please wait...' : submitLabel}
        </button>
        <div className={styles.footer}>{footer}</div>
      </form>
    </div>
  )
}
