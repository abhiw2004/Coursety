const { Purchase } = require("../db");

async function userHasCourseAccess(user, course) {
  if (!user || !course) return false;
  if (user.role === "admin") return true;
  if (String(course.creatorId) === user.id) return true;
  const purchase = await Purchase.findOne({ userId: user.id, courseId: course._id });
  return Boolean(purchase);
}

function countLessons(course) {
  return (course.sections || []).reduce((sum, section) => sum + (section.lessons?.length || 0), 0);
}

function sanitizeCurriculum(course, hasAccess) {
  const sections = (course.sections || [])
    .slice()
    .sort((a, b) => a.order - b.order)
    .map((section) => ({
      _id: section._id,
      title: section.title,
      order: section.order,
      lessons: (section.lessons || [])
        .slice()
        .sort((a, b) => a.order - b.order)
        .filter((lesson) => hasAccess || lesson.isPreview)
        .map((lesson) => ({
          _id: lesson._id,
          title: lesson.title,
          description: hasAccess ? lesson.description : undefined,
          duration: lesson.duration,
          order: lesson.order,
          isPreview: lesson.isPreview,
          hasVideo: Boolean(lesson.videoUrl),
          ...(hasAccess ? { videoUrl: lesson.videoUrl } : {}),
        })),
    }))
    .filter((section) => section.lessons.length > 0 || hasAccess);

  return sections;
}

function findLesson(course, lessonId) {
  for (const section of course.sections || []) {
    const lesson = (section.lessons || []).find((l) => String(l._id) === String(lessonId));
    if (lesson) return { section, lesson };
  }
  return null;
}

module.exports = {
  userHasCourseAccess,
  countLessons,
  sanitizeCurriculum,
  findLesson,
};
