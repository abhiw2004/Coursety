import { useState } from 'react'
import type { Lesson, Section } from '../api'
import styles from './CurriculumBuilder.module.css'

interface Props {
  sections: Section[]
  onChange: (sections: Section[]) => void
  onSave: () => Promise<void>
  saving: boolean
}

function newId() {
  return `tmp_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
}

export default function CurriculumBuilder({ sections, onChange, onSave, saving }: Props) {
  const [error, setError] = useState('')

  const updateSections = (next: Section[]) => onChange(next)

  const addSection = () => {
    updateSections([
      ...sections,
      { _id: newId(), title: 'New Section', order: sections.length, lessons: [] },
    ])
  }

  const updateSection = (idx: number, title: string) => {
    const next = [...sections]
    next[idx] = { ...next[idx], title }
    updateSections(next)
  }

  const removeSection = (idx: number) => {
    if (!confirm('Remove this section and all its lessons?')) return
    updateSections(sections.filter((_, i) => i !== idx))
  }

  const addLesson = (sectionIdx: number) => {
    const next = [...sections]
    const lessons = [...next[sectionIdx].lessons]
    lessons.push({
      _id: newId(),
      title: 'New Lesson',
      description: '',
      videoUrl: '',
      duration: 0,
      order: lessons.length,
      isPreview: false,
    })
    next[sectionIdx] = { ...next[sectionIdx], lessons }
    updateSections(next)
  }

  const updateLesson = (sectionIdx: number, lessonIdx: number, patch: Partial<Lesson>) => {
    const next = [...sections]
    const lessons = [...next[sectionIdx].lessons]
    lessons[lessonIdx] = { ...lessons[lessonIdx], ...patch }
    next[sectionIdx] = { ...next[sectionIdx], lessons }
    updateSections(next)
  }

  const removeLesson = (sectionIdx: number, lessonIdx: number) => {
    const next = [...sections]
    next[sectionIdx] = {
      ...next[sectionIdx],
      lessons: next[sectionIdx].lessons.filter((_, i) => i !== lessonIdx),
    }
    updateSections(next)
  }

  const handleSave = async () => {
    setError('')
    for (const section of sections) {
      if (!section.title.trim()) {
        setError('Every section needs a title')
        return
      }
      for (const lesson of section.lessons) {
        if (!lesson.title.trim()) {
          setError('Every lesson needs a title')
          return
        }
      }
    }
    try {
      await onSave()
    } catch (e) {
      setError((e as Error).message)
    }
  }

  return (
    <div className={styles.wrap}>
      <div className={styles.header}>
        <h2>Curriculum</h2>
        <button type="button" onClick={addSection} className={styles.addBtn}>
          + Add section
        </button>
      </div>

      {sections.length === 0 ? (
        <p className={styles.empty}>No sections yet. Add sections and lessons with video URLs (YouTube, Vimeo, or MP4).</p>
      ) : (
        sections.map((section, sIdx) => (
          <div key={section._id} className={styles.section}>
            <div className={styles.sectionHead}>
              <input
                value={section.title}
                onChange={(e) => updateSection(sIdx, e.target.value)}
                placeholder="Section title"
                className={styles.sectionInput}
              />
              <button type="button" onClick={() => removeSection(sIdx)} className={styles.removeBtn}>
                Remove
              </button>
            </div>

            {section.lessons.map((lesson, lIdx) => (
              <div key={lesson._id} className={styles.lesson}>
                <input
                  value={lesson.title}
                  onChange={(e) => updateLesson(sIdx, lIdx, { title: e.target.value })}
                  placeholder="Lesson title"
                />
                <input
                  value={lesson.videoUrl || ''}
                  onChange={(e) => updateLesson(sIdx, lIdx, { videoUrl: e.target.value })}
                  placeholder="Video URL (YouTube, Vimeo, or MP4)"
                />
                <textarea
                  value={lesson.description || ''}
                  onChange={(e) => updateLesson(sIdx, lIdx, { description: e.target.value })}
                  placeholder="Lesson description (optional)"
                  rows={2}
                />
                <div className={styles.lessonRow}>
                  <label>
                    Duration (min)
                    <input
                      type="number"
                      min="0"
                      value={lesson.duration || 0}
                      onChange={(e) => updateLesson(sIdx, lIdx, { duration: Number(e.target.value) || 0 })}
                    />
                  </label>
                  <label className={styles.checkbox}>
                    <input
                      type="checkbox"
                      checked={Boolean(lesson.isPreview)}
                      onChange={(e) => updateLesson(sIdx, lIdx, { isPreview: e.target.checked })}
                    />
                    Free preview
                  </label>
                  <button type="button" onClick={() => removeLesson(sIdx, lIdx)} className={styles.removeBtn}>
                    Remove
                  </button>
                </div>
              </div>
            ))}

            <button type="button" onClick={() => addLesson(sIdx)} className={styles.addLessonBtn}>
              + Add lesson
            </button>
          </div>
        ))
      )}

      {error && <p className={styles.error}>{error}</p>}
      <button type="button" onClick={handleSave} disabled={saving} className={styles.saveBtn}>
        {saving ? 'Saving curriculum...' : 'Save curriculum'}
      </button>
    </div>
  )
}
