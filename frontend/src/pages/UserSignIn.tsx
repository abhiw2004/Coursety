import { Link, useNavigate } from 'react-router-dom'
import AuthForm from '../components/AuthForm'
import { userSignin } from '../api'
import { useAuth } from '../context/AuthContext'

export default function UserSignIn() {
  const navigate = useNavigate()
  const { setUserToken } = useAuth()

  const handleSubmit = async (email: string, password: string) => {
    const data = await userSignin(email, password)
    setUserToken(data.token)
    navigate('/courses')
  }

  return (
    <AuthForm
      title="Sign In"
      submitLabel="Sign In"
      onSubmit={handleSubmit}
      footer={<><span>Don't have an account? </span><Link to="/user/signup">Sign up</Link></>}
    />
  )
}
