import { Link, useNavigate } from 'react-router-dom'
import AuthForm from '../components/AuthForm'
import { signup } from '../api'
import { useAuth } from '../context/AuthContext'

export default function SignUp() {
  const navigate = useNavigate()
  const { signIn } = useAuth()

  const handleSubmit = async (email: string, password: string, extra?: Record<string, string>) => {
    const data = await signup({
      email,
      password,
      firstName: extra?.firstName,
      lastName: extra?.lastName,
    })
    signIn(data.token, data.user)
    navigate('/courses')
  }

  return (
    <AuthForm
      title="Create your account"
      submitLabel="Sign Up"
      onSubmit={handleSubmit}
      extraFields={[
        { name: 'firstName', label: 'First Name' },
        { name: 'lastName', label: 'Last Name' },
      ]}
      footer={
        <>
          <span>Already have an account? </span>
          <Link to="/signin">Sign in</Link>
        </>
      }
    />
  )
}
