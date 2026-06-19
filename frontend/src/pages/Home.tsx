import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { listCourses, type Course } from '../api'
import { formatPrice } from '../utils/format'
import styles from './Home.module.css'

export default function Home() {
  const [featured, setFeatured] = useState<Course[]>([])

  useEffect(() => {
    listCourses()
      .then((data) => setFeatured(data.courses.slice(0, 3)))
      .catch(() => setFeatured([]))
  }, [])

  return (
    <div className={styles.page}>
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <p className={styles.kicker}>Learn. Build. Grow.</p>
          <h1>
            We've amazing skills for <span>Teaching</span>
          </h1>
          <p>
            Practical, career-focused courses from top instructors with clear roadmaps,
            guided projects, and lifetime access.
          </p>
          <div className={styles.actions}>
            <Link to="/courses" className={styles.cta}>Explore Courses</Link>
            <Link to="/signup" className={styles.secondary}>Start Free</Link>
          </div>
          <div className={styles.heroStats}>
            <span><strong>50,000+</strong> Students</span>
            <span><strong>1,500+</strong> Online Courses</span>
            <span><strong>200+</strong> Tutors</span>
          </div>
        </div>
        <div className={styles.heroArt} aria-hidden>
          <div className={styles.heroBlob} />
          <div className={styles.heroPerson} />
          <div className={styles.floatingCard}>1500+ Online Courses</div>
          <div className={styles.floatingCardAlt}>200+ Tutors</div>
        </div>
      </section>

      <section className={styles.why}>
        <h2>Why Choose Us</h2>
        <p>High-quality, affordable education designed for every learner.</p>
        <div className={styles.highlights}>
          <article className={styles.card}>
            <h3>Learn Anything</h3>
            <p>Explore tracks across design, development, business, and AI with project-first lessons.</p>
          </article>
          <article className={styles.card}>
            <h3>Affordable Pricing</h3>
            <p>Simple one-time pricing so students can keep learning without subscription pressure.</p>
          </article>
          <article className={styles.card}>
            <h3>Certificates</h3>
            <p>Earn completion certificates to showcase your progress and growth as a professional.</p>
          </article>
        </div>
      </section>

      <section className={styles.latest}>
        <div className={styles.sectionHeader}>
          <h2>Our Latest Courses</h2>
          <Link to="/courses" className={styles.inlineCta}>Explore All Courses</Link>
        </div>
        <div className={styles.courseGrid}>
          {featured.length === 0 ? (
            <p className={styles.empty}>No published courses yet. Check back soon.</p>
          ) : (
            featured.map((course) => (
              <Link key={course._id} to={`/courses/${course._id}`} className={styles.courseCard}>
                <div className={styles.courseThumb}>
                  {course.imageUrl ? <img src={course.imageUrl} alt={course.title} /> : null}
                </div>
                <div className={styles.courseBody}>
                  <p className={styles.courseCategory}>Course</p>
                  <h3>{course.title}</h3>
                  <div className={styles.courseMeta}>
                    <span>{course.description?.slice(0, 60) || 'Practical, hands-on learning'}</span>
                    <strong>{formatPrice(course.price)}</strong>
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>
      </section>

      <section className={styles.testimonial}>
        <h2>What Our Students Say</h2>
        <p>
          "The course flow and practical projects helped me switch careers in under six months.
          The platform feels clean and easy to navigate."
        </p>
        <span>- Anusha, Front-End Developer</span>
      </section>
    </div>
  )
}
