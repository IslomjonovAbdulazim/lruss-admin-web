import { createFileRoute } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { educationApi, type Lesson } from '@/lib/api'
import { toast } from 'sonner'
import { FileText, ChevronRight, Plus, Edit, Trash2 } from 'lucide-react'
import { useNavigate } from '@tanstack/react-router'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'

function ModuleDetail() {
  const navigate = useNavigate()
  const { moduleId } = Route.useParams()
  const [lessons, setLessons] = useState<Lesson[]>([])
  const [loading, setLoading] = useState(true)
  
  // Form states
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null)
  const [formData, setFormData] = useState<any>({})

  useEffect(() => {
    fetchLessons()
  }, [moduleId])

  const fetchLessons = async () => {
    try {
      setLoading(true)
      const response = await educationApi.getModuleWithLessons(parseInt(moduleId))
      setLessons(response.data.lessons || [])
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Не удалось загрузить уроки')
    } finally {
      setLoading(false)
    }
  }

  const createLesson = async () => {
    try {
      await educationApi.createLesson({ ...formData, module_id: parseInt(moduleId) })
      toast.success('Урок успешно создан')
      setIsCreateDialogOpen(false)
      setFormData({})
      fetchLessons()
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Не удалось создать урок')
    }
  }

  const updateLesson = async () => {
    try {
      await educationApi.updateLesson(editingLesson!.id, formData)
      toast.success('Урок успешно обновлён')
      setIsEditDialogOpen(false)
      setEditingLesson(null)
      setFormData({})
      fetchLessons()
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Не удалось обновить урок')
    }
  }

  const deleteLesson = async (lessonId: number) => {
    try {
      await educationApi.deleteLesson(lessonId)
      toast.success('Урок успешно удалён')
      fetchLessons()
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Не удалось удалить урок')
    }
  }

  const openCreateDialog = () => {
    setFormData({})
    setIsCreateDialogOpen(true)
  }

  const openEditDialog = (lesson: Lesson) => {
    setEditingLesson(lesson)
    setFormData({
      title: lesson.title,
      description: lesson.description || '',
      order: lesson.order || 0
    })
    setIsEditDialogOpen(true)
  }

  if (loading) {
    return <div className="flex justify-center p-8">Загрузка уроков...</div>
  }

  return (
    <>
      <div className="mb-4 flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          Найдено {lessons.length} уроков в этом модуле
        </div>
        <Button onClick={openCreateDialog}>
          <Plus className="h-4 w-4 mr-2" />
          Добавить урок
        </Button>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {lessons.map((lesson) => (
          <Card key={lesson.id} className="group relative hover:shadow-lg transition-shadow">
            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
              <Button size="sm" variant="outline" onClick={(e) => { e.stopPropagation(); openEditDialog(lesson) }}>
                <Edit className="h-3 w-3" />
              </Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button size="sm" variant="outline" onClick={(e) => e.stopPropagation()}>
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Удалить урок</AlertDialogTitle>
                    <AlertDialogDescription>
                      Вы уверены, что хотите удалить "{lesson.title}"? Это также удалит все пакеты в этом уроке.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Отмена</AlertDialogCancel>
                    <AlertDialogAction onClick={() => deleteLesson(lesson.id)}>Удалить</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
            <div 
              className="cursor-pointer"
              onClick={() => {
                console.log('🚀 [MODULE->LESSON] ====================================')
                console.log('🚀 [MODULE->LESSON] Lesson clicked with NEW CODE!')
                console.log('🚀 [MODULE->LESSON] - Lesson ID:', lesson.id)
                console.log('🚀 [MODULE->LESSON] - Lesson Title:', lesson.title)
                console.log('🚀 [MODULE->LESSON] - Current Module ID:', moduleId)
                const newUrl = `/education/${moduleId}/${lesson.id}`
                console.log('🚀 [MODULE->LESSON] - NEW Target URL:', newUrl)
                console.log('🚀 [MODULE->LESSON] - About to navigate to lesson route...')
                navigate({ 
                  to: '/education/$moduleId/$lessonId', 
                  params: { moduleId: moduleId.toString(), lessonId: lesson.id.toString() } 
                })
                console.log('🚀 [MODULE->LESSON] - Navigation called! Should load LESSON LAYOUT + PACK LIST')
                
                setTimeout(() => {
                  console.log('🚀 [MODULE->LESSON] - Post-navigation check:')
                  console.log('🚀 [MODULE->LESSON] - Current URL after nav:', window.location.href)
                  console.log('🚀 [MODULE->LESSON] - Current pathname:', window.location.pathname)
                }, 100)
                console.log('🚀 [MODULE->LESSON] ====================================')
              }}
            >
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center">
                    <FileText className="h-5 w-5 mr-2" />
                    {lesson.title}
                  </div>
                  <ChevronRight className="h-4 w-4" />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm mb-2">{lesson.description}</p>
                <p className="text-sm text-muted-foreground">Порядок: {lesson.order}</p>
              </CardContent>
            </div>
          </Card>
        ))}
      </div>

      {/* Create Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Создать урок</DialogTitle>
            <DialogDescription>
              Создать новый урок в этом модуле
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="title" className="text-right">Заголовок</Label>
              <Input
                id="title"
                value={formData.title || ''}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="description" className="text-right">Описание</Label>
              <Textarea
                id="description"
                value={formData.description || ''}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="order" className="text-right">Порядок</Label>
              <Input
                id="order"
                type="number"
                value={formData.order || ''}
                onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={createLesson}>Создать</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Редактировать урок</DialogTitle>
            <DialogDescription>
              Редактировать детали урока
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-title" className="text-right">Заголовок</Label>
              <Input
                id="edit-title"
                value={formData.title || ''}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-description" className="text-right">Описание</Label>
              <Textarea
                id="edit-description"
                value={formData.description || ''}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-order" className="text-right">Порядок</Label>
              <Input
                id="edit-order"
                type="number"
                value={formData.order || ''}
                onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={updateLesson}>Обновить</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

export const Route = createFileRoute('/_authenticated/education/$moduleId/')({
  component: ModuleDetail,
})