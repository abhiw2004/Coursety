import { useState } from 'react'
import { Outlet, Link, NavLink } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import styles from './Layout.module.css'

export default function Layout() {
  const { userToken, adminToken, signOutUser, signOutAdmin } = useAuth()
  const [navOpen, setNavOpen] = useState(false)

  const closeNav = () => setNavOpen(false)

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
          <NavLink to="/" className={({ isActive }) => (isActive ? styles.activeLink : '')} onClick={closeNav}>Home</NavLink>
          <NavLink to="/courses" className={({ isActive }) => (isActive ? styles.activeLink : '')} onClick={closeNav}>Courses</NavLink>
          {userToken ? (
            <>
              <NavLink to="/purchases" className={({ isActive }) => (isActive ? styles.activeLink : '')} onClick={closeNav}>My Courses</NavLink>
              <button onClick={() => { signOutUser(); closeNav() }} className={styles.btnOutline}>Sign Out</button>
            </>
          ) : (
            <>
              <NavLink to="/user/signin" className={({ isActive }) => (isActive ? styles.activeLink : '')} onClick={closeNav}>Sign In</NavLink>
              <Link to="/user/signup" className={styles.btnPrimary} onClick={closeNav}>Sign Up</Link>
            </>
          )}
          {adminToken ? (
            <>
              <NavLink to="/admin" className={({ isActive }) => (isActive ? styles.activeLink : '')} onClick={closeNav}>Dashboard</NavLink>
              <button onClick={() => { signOutAdmin(); closeNav() }} className={styles.btnAdmin}>Admin Sign Out</button>
            </>
          ) : (
            <NavLink to="/admin/signin" className={({ isActive }) => `${styles.linkAdmin} ${isActive ? styles.activeLink : ''}`} onClick={closeNav}>Admin</NavLink>
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
