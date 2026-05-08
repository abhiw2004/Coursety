import { Link, useNavigate } from 'react-router-dom'
import AuthForm from '../components/AuthForm'
import { signin } from '../api'
import { useAuth } from '../context/AuthContext'

export default function SignIn() {
  const navigate = useNavigate()
  const { signIn } = useAuth()

  const handleSubmit = async (email: string, password: string) => {
    const data = await signin(email, password)
    signIn(data.token, data.user)
    navigate('/courses')
  }

  return (
    <AuthForm
      title="Welcome back"
      submitLabel="Sign In"
      onSubmit={handleSubmit}
      footer={
        <>
          <span>New to CourseTy? </span>
          <Link to="/signup">Create an account</Link>
        </>
      }
    />
  )
}
