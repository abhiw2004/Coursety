import { useState } from 'react'
import { Outlet, Link, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import styles from './Layout.module.css'

export default function Layout() {
  const { user, isInstructor, isAdmin, signOut } = useAuth()
  const [navOpen, setNavOpen] = useState(false)
  const navigate = useNavigate()

  const closeNav = () => setNavOpen(false)
  const handleSignOut = () => {
    signOut()
    closeNav()
    navigate('/')
  }

  return (
    <div className={styles.wrapper}>
      <header className={styles.header}>
        <Link to="/" className={styles.logo} onClick={closeNav}>CourseTy</Link>
        <button
          className={styles.menuToggle}
          type="button"
          onClick={() => setNavOpen((prev) => !prev)}
          aria-expanded={navOpen}
          aria-controls="main-navigation"
          aria-label={navOpen ? 'Close menu' : 'Open menu'}
        >
          {navOpen ? 'Close' : 'Menu'}
        </button>
        <nav id="main-navigation" className={`${styles.nav} ${navOpen ? styles.navOpen : ''}`}>
          <NavLink to="/" end className={({ isActive }) => (isActive ? styles.activeLink : '')} onClick={closeNav}>
            Home
          </NavLink>
          <NavLink to="/courses" className={({ isActive }) => (isActive ? styles.activeLink : '')} onClick={closeNav}>
            Courses
          </NavLink>

          {user && (
            <NavLink to="/purchases" className={({ isActive }) => (isActive ? styles.activeLink : '')} onClick={closeNav}>
              My Courses
            </NavLink>
          )}

          {isInstructor && (
            <NavLink to="/instructor" className={({ isActive }) => (isActive ? styles.activeLink : '')} onClick={closeNav}>
              Instructor
            </NavLink>
          )}

          {isAdmin && (
            <NavLink to="/admin/requests" className={({ isActive }) => (isActive ? styles.activeLink : '')} onClick={closeNav}>
              Admin
            </NavLink>
          )}

          {!user && (
            <>
              <NavLink to="/signin" className={({ isActive }) => (isActive ? styles.activeLink : '')} onClick={closeNav}>
                Sign In
              </NavLink>
              <Link to="/signup" className={styles.btnPrimary} onClick={closeNav}>
                Sign Up
              </Link>
            </>
          )}

          {user && !isInstructor && (
            <Link to="/become-instructor" className={styles.btnOutline} onClick={closeNav}>
              Teach
            </Link>
          )}

          {user && (
            <button onClick={handleSignOut} className={styles.btnOutline}>
              Sign Out
            </button>
          )}
        </nav>
      </header>
      <main className={styles.main}>
        <Outlet />
      </main>
      <footer className={styles.footer}>
        <span>© CourseTy – Learn anything, anytime.</span>
      </footer>
    </div>
  )
}
