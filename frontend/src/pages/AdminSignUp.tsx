import { Link, useNavigate } from 'react-router-dom'
import AuthForm from '../components/AuthForm'
import { adminSignup } from '../api'
import { useAuth } from '../context/AuthContext'

export default function AdminSignUp() {
  const navigate = useNavigate()
  const { setAdminToken } = useAuth()

  const handleSubmit = async (email: string, password: string) => {
    await adminSignup(email, password)
    const { adminSignin } = await import('../api')
    const data = await adminSignin(email, password)
    setAdminToken(data.token)
    navigate('/admin')
  }

  return (
    <AuthForm
      title="Admin Sign Up"
      submitLabel="Create Admin Account"
      onSubmit={handleSubmit}
      footer={<><span>Already have admin access? </span><Link to="/admin/signin">Sign in</Link></>}
    />
  )
}
