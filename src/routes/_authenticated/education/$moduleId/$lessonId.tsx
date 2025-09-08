import { createFileRoute, Outlet } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { educationApi, type Module, type Lesson } from '@/lib/api'
import { toast } from 'sonner'
import { ArrowLeft } from 'lucide-react'
import { useNavigate } from '@tanstack/react-router'

function LessonLayout() {
  const navigate = useNavigate()
  const { moduleId, lessonId } = Route.useParams()
  const [module, setModule] = useState<Module | null>(null)
  const [lesson, setLesson] = useState<Lesson | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    console.log('🏛️ [LESSON LAYOUT] Component mounted with params:', { moduleId, lessonId })
    console.log('🏛️ [LESSON LAYOUT] Current route:', window.location.pathname)
    fetchLesson()
  }, [moduleId, lessonId])

  const fetchLesson = async () => {
    try {
      console.log('🔍 [LESSON LAYOUT] Fetching lesson data for:', lessonId)
      setLoading(true)
      const response = await educationApi.getLessonWithPacks(parseInt(lessonId as string))
      console.log('✅ [LESSON LAYOUT] Lesson data fetched:', response.data)
      setLesson(response.data)
      
      const moduleResponse = await educationApi.getModuleWithLessons(parseInt(moduleId as string))
      setModule(moduleResponse.data)
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Не удалось загрузить урок')
      navigate({ to: `/education/${moduleId}` })
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <div className='mb-4 flex items-center justify-between'>
        <div>
          <h1 className='text-2xl font-bold tracking-tight'>{lesson?.title || 'Урок'}</h1>
          <p className='text-muted-foreground'>{module?.title} &gt; {lesson?.title}</p>
        </div>
        <Button variant="outline" onClick={() => navigate({ to: `/education/${moduleId}` })}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Назад к урокам
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center p-8">Загрузка...</div>
      ) : (
        <Outlet />
      )}
    </>
  )
}

export const Route = createFileRoute('/_authenticated/education/$moduleId/$lessonId')({
  component: LessonLayout,
})