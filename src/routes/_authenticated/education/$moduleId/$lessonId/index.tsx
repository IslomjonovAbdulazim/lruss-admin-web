import { createFileRoute } from '@tanstack/react-router'
import { LessonDetail } from '@/features/education/lesson-detail'

export const Route = createFileRoute('/_authenticated/education/$moduleId/$lessonId/')({
  component: LessonDetail,
})