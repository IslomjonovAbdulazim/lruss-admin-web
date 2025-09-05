import { createFileRoute } from '@tanstack/react-router'
import { PackDetail } from '@/features/education/pack-detail'

export const Route = createFileRoute('/_authenticated/education/$moduleId/$lessonId/$packId/')({
  component: PackDetail,
})