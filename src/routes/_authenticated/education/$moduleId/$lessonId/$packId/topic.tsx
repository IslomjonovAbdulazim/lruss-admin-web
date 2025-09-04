import { createFileRoute } from '@tanstack/react-router'
import { GrammarTopicPage } from '@/features/education/grammar-topic'

export const Route = createFileRoute('/_authenticated/education/$moduleId/$lessonId/$packId/topic')({
  component: GrammarTopicPage,
})