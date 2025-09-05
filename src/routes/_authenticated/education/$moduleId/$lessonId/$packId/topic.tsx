import { createFileRoute } from '@tanstack/react-router'
import { GrammarTopicPage } from '@/features/education/grammar-topic'

function TopicRouteComponent() {
  console.log('🎉 [TOPIC ROUTE] Route component loaded successfully!')
  console.log('🎉 [TOPIC ROUTE] Current URL:', window.location.href)
  console.log('🎉 [TOPIC ROUTE] Pathname:', window.location.pathname)
  console.log('🎉 [TOPIC ROUTE] Search params:', window.location.search)
  
  try {
    return <GrammarTopicPage />
  } catch (error) {
    console.error('🔴 [TOPIC ROUTE] Error rendering GrammarTopicPage:', error)
    throw error
  }
}

export const Route = createFileRoute('/_authenticated/education/$moduleId/$lessonId/$packId/topic')({
  component: TopicRouteComponent,
  onError: (error) => {
    console.error('🔴 [TOPIC ROUTE] Route error:', error)
  },
  beforeLoad: ({ params }) => {
    console.log('🚀 [TOPIC ROUTE] Before load with params:', params)
    console.log('🚀 [TOPIC ROUTE] moduleId:', params.moduleId, 'lessonId:', params.lessonId, 'packId:', params.packId)
  },
})