import { Link } from 'react-router-dom'
import styles from './Home.module.css'

export default function Home() {
  return (
    <div className={styles.page}>
      <section className={styles.hero}>
        <p className={styles.kicker}>Upskill with confidence</p>
        <h1>Learn anything, <span>anytime</span></h1>
        <p>Discover high-quality courses from top instructors and track your learning in one place.</p>
        <div className={styles.actions}>
          <Link to="/courses" className={styles.cta}>Browse Courses</Link>
          <Link to="/user/signup" className={styles.secondary}>Get Started</Link>
        </div>
      </section>
      <section className={styles.metrics}>
        <div><strong>500+</strong><span>Learners</span></div>
        <div><strong>120+</strong><span>Curated courses</span></div>
        <div><strong>24/7</strong><span>Anytime access</span></div>
      </section>
      <div className={styles.highlights}>
        <article className={styles.card}>
          <h3>Practical learning</h3>
          <p>Hands-on content focused on real-world outcomes and career growth.</p>
        </article>
        <article className={styles.card}>
          <h3>Clear progress</h3>
          <p>Your purchased courses are always available in one organized dashboard.</p>
        </article>
        <article className={styles.card}>
          <h3>Fast checkout</h3>
          <p>Purchase in seconds and immediately continue learning without friction.</p>
        </article>
      </div>
    </div>
  )
}
