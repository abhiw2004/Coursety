import { Link, useNavigate } from 'react-router-dom'
import AuthForm from '../components/AuthForm'
import { adminSignin } from '../api'
import { useAuth } from '../context/AuthContext'

export default function AdminSignIn() {
  const navigate = useNavigate()
  const { setAdminToken } = useAuth()

  const handleSubmit = async (email: string, password: string) => {
    const data = await adminSignin(email, password)
    setAdminToken(data.token)
    navigate('/admin')
  }

  return (
    <AuthForm
      title="Admin Sign In"
      submitLabel="Sign In"
      onSubmit={handleSubmit}
      footer={<><span>New admin? </span><Link to="/admin/signup">Sign up</Link></>}
    />
  )
}
