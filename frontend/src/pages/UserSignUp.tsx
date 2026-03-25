import { Link, useNavigate } from 'react-router-dom'
import AuthForm from '../components/AuthForm'
import { userSignup } from '../api'
import { useAuth } from '../context/AuthContext'

export default function UserSignUp() {
  const navigate = useNavigate()
  const { setUserToken } = useAuth()

  const handleSubmit = async (email: string, password: string, extra?: Record<string, string>) => {
    await userSignup(email, password, extra?.firstName, extra?.lastName)
    const { userSignin } = await import('../api')
    const data = await userSignin(email, password)
    setUserToken(data.token)
    navigate('/courses')
  }

  return (
    <AuthForm
      title="Sign Up"
      submitLabel="Create Account"
      onSubmit={handleSubmit}
      extraFields={[
        { name: 'firstName', label: 'First Name' },
        { name: 'lastName', label: 'Last Name' },
      ]}
      footer={<><span>Already have an account? </span><Link to="/user/signin">Sign in</Link></>}
    />
  )
}
