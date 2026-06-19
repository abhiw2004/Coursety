import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import {
  getCourse,
  getCourseCurriculum,
  getLesson,
  markLessonComplete,
  type Course,
  type CourseProgress,
  type Lesson,
  type Section,
} from '../api'
import { formatDuration } from '../utils/format'
import { parseVideoUrl } from '../utils/video'
import styles from './CourseLearn.module.css'

export default function CourseLearn() {
  const { id } = useParams<{ id: string }>()
  const [searchParams, setSearchParams] = useSearchParams()
  const navigate = useNavigate()
  const lessonParam = searchParams.get('lesson')

  const [course, setCourse] = useState<Course | null>(null)
  const [sections, setSections] = useState<Section[]>([])
  const [progress, setProgress] = useState<CourseProgress | null>(null)
  const [activeLesson, setActiveLesson] = useState<Lesson | null>(null)
  const [completed, setCompleted] = useState(false)
  const [loading, setLoading] = useState(true)
  const [lessonLoading, setLessonLoading] = useState(false)
  const [error, setError] = useState('')
  const [marking, setMarking] = useState(false)

  useEffect(() => {
    if (!id) return
    setLoading(true)
    Promise.all([getCourse(id), getCourseCurriculum(id)])
      .then(([courseData, curriculumData]) => {
        setCourse(courseData.course)
        setSections(curriculumData.sections)
        setProgress(curriculumData.progress)

        if (!curriculumData.hasAccess && !curriculumData.sections.some((s) => s.lessons.some((l) => l.isPreview))) {
          setError('Purchase this course to access the content.')
          return
        }

        const allLessons = curriculumData.sections.flatMap((s) => s.lessons)
        const target = lessonParam
          ? allLessons.find((l) => l._id === lessonParam)
          : allLessons.find((l) => l.hasVideo) || allLessons[0]

        if (target) loadLesson(target._id)
      })
      .catch((e) => setError((e as Error).message))
      .finally(() => setLoading(false))
  }, [id])

  const loadLesson = async (lessonId: string) => {
    if (!id) return
    setLessonLoading(true)
    setError('')
    try {
      const data = await getLesson(id, lessonId)
      setActiveLesson(data.lesson)
      setCompleted(data.completed)
      setSearchParams({ lesson: lessonId }, { replace: true })
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setLessonLoading(false)
    }
  }

  const handleMarkComplete = async () => {
    if (!id || !activeLesson) return
    setMarking(true)
    try {
      const result = await markLessonComplete(id, activeLesson._id)
      setCompleted(true)
      setProgress((prev) =>
        prev
          ? {
              ...result.progress,
              completedLessonIds: [...new Set([...prev.completedLessonIds, activeLesson._id])],
            }
          : { ...result.progress, completedLessonIds: [activeLesson._id] }
      )
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setMarking(false)
    }
  }

  const getNextLesson = (): Lesson | null => {
    const flat = sections.flatMap((s) => s.lessons)
    if (!activeLesson) return flat[0] || null
    const idx = flat.findIndex((l) => l._id === activeLesson._id)
    return idx >= 0 && idx < flat.length - 1 ? flat[idx + 1] : null
  }

  const videoInfo = activeLesson?.videoUrl ? parseVideoUrl(activeLesson.videoUrl) : null

  if (loading) return <div className={styles.center}>Loading course...</div>
  if (error && !course) return <div className={styles.center}>{error}</div>

  return (
    <div className={styles.page}>
      <header className={styles.topBar}>
        <div>
          <Link to={`/courses/${id}`} className={styles.backLink}>
            ← Back to course
          </Link>
          <h1>{course?.title}</h1>
        </div>
        {progress && (
          <div className={styles.progressWrap}>
            <span>{progress.percent}% complete</span>
            <div className={styles.progressBar}>
              <div className={styles.progressFill} style={{ width: `${progress.percent}%` }} />
            </div>
          </div>
        )}
      </header>

      <div className={styles.layout}>
        <aside className={styles.sidebar}>
          <h2>Curriculum</h2>
          {sections.length === 0 ? (
            <p className={styles.empty}>No lessons added yet.</p>
          ) : (
            sections.map((section) => (
              <div key={section._id} className={styles.section}>
                <h3>{section.title}</h3>
                <ul>
                  {section.lessons.map((lesson) => {
                    const isActive = activeLesson?._id === lesson._id
                    const isDone = progress?.completedLessonIds.includes(lesson._id)
                    return (
                      <li key={lesson._id}>
                        <button
                          type="button"
                          className={`${styles.lessonBtn} ${isActive ? styles.activeLesson : ''}`}
                          onClick={() => loadLesson(lesson._id)}
                        >
                          <span className={styles.lessonTitle}>
                            {isDone ? '✓ ' : ''}
                            {lesson.title}
                          </span>
                          {lesson.isPreview && <span className={styles.previewBadge}>Preview</span>}
                          {lesson.duration ? (
                            <span className={styles.lessonMeta}>{formatDuration(lesson.duration)}</span>
                          ) : null}
                        </button>
                      </li>
                    )
                  })}
                </ul>
              </div>
            ))
          )}
        </aside>

        <main className={styles.playerArea}>
          {lessonLoading ? (
            <div className={styles.center}>Loading lesson...</div>
          ) : activeLesson ? (
            <>
              <div className={styles.videoWrap}>
                {videoInfo?.type === 'youtube' || videoInfo?.type === 'vimeo' ? (
                  <iframe
                    src={videoInfo.embedUrl}
                    title={activeLesson.title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                ) : videoInfo?.type === 'direct' && videoInfo.src ? (
                  <video src={videoInfo.src} controls playsInline />
                ) : (
                  <div className={styles.noVideo}>
                    <p>No video URL set for this lesson.</p>
                    <p className={styles.hint}>Instructors can add YouTube, Vimeo, or direct MP4 links.</p>
                  </div>
                )}
              </div>

              <div className={styles.lessonInfo}>
                <h2>{activeLesson.title}</h2>
                {activeLesson.description && <p>{activeLesson.description}</p>}
                <div className={styles.lessonActions}>
                  {!completed ? (
                    <button type="button" onClick={handleMarkComplete} disabled={marking} className={styles.completeBtn}>
                      {marking ? 'Saving...' : 'Mark as complete'}
                    </button>
                  ) : (
                    <span className={styles.completedLabel}>✓ Completed</span>
                  )}
                  {getNextLesson() && (
                    <button
                      type="button"
                      className={styles.nextBtn}
                      onClick={() => {
                        const next = getNextLesson()
                        if (next) loadLesson(next._id)
                      }}
                    >
                      Next lesson →
                    </button>
                  )}
                </div>
              </div>
            </>
          ) : (
            <div className={styles.center}>
              {error || 'Select a lesson to start learning.'}
              {error?.includes('Purchase') && (
                <button type="button" className={styles.buyLink} onClick={() => navigate(`/courses/${id}`)}>
                  Go to course page
                </button>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
