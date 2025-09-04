import { createFileRoute, Outlet } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { educationApi, type Module } from '@/lib/api'
import { toast } from 'sonner'
import { ArrowLeft } from 'lucide-react'
import { useNavigate } from '@tanstack/react-router'

function ModuleLayout() {
  const navigate = useNavigate()
  const { moduleId } = Route.useParams()
  const [module, setModule] = useState<Module | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchModule()
  }, [moduleId])

  const fetchModule = async () => {
    try {
      setLoading(true)
      const response = await educationApi.getModuleWithLessons(parseInt(moduleId))
      setModule(response.data)
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Failed to fetch module')
      navigate({ to: '/education' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <div className='mb-4 flex items-center justify-between'>
        <div>
          <h1 className='text-2xl font-bold tracking-tight'>{module?.title || 'Module'}</h1>
          <p className='text-muted-foreground'>Module &gt; {module?.title}</p>
        </div>
        <Button variant="outline" onClick={() => navigate({ to: '/education' })}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Modules
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center p-8">Loading...</div>
      ) : (
        <Outlet />
      )}
    </>
  )
}

export const Route = createFileRoute('/_authenticated/education/$moduleId')({
  component: ModuleLayout,
})