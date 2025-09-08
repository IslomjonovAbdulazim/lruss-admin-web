import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { educationApi, type Module, type Lesson, type Pack } from '@/lib/api'
import { toast } from 'sonner'
import { ArrowLeft, Package, ChevronRight, Plus, Edit, Trash2 } from 'lucide-react'
import { useNavigate, useParams } from '@tanstack/react-router'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'

console.log('📁 [LESSON FEATURE] WORKING PATTERN - File imported!')

export function LessonDetail() {
  console.log('🔥🔥🔥 [LESSON DETAIL] Component mounting - WORKING PATTERN!')
  const navigate = useNavigate()
  const { moduleId, lessonId } = useParams({ strict: false })
  console.log('🔥 [LESSON DETAIL] Route params:', { moduleId, lessonId })
  const [module, setModule] = useState<Module | null>(null)
  const [lesson, setLesson] = useState<Lesson | null>(null)
  const [packs, setPacks] = useState<Pack[]>([])
  const [loading, setLoading] = useState(true)
  
  // Form states
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingPack, setEditingPack] = useState<Pack | null>(null)
  const [formData, setFormData] = useState<any>({})

  useEffect(() => {
    console.log('🔥 [LESSON DETAIL] useEffect triggered')
    fetchLesson()
  }, [moduleId, lessonId])

  const fetchLesson = async () => {
    try {
      console.log('🔥 [LESSON DETAIL] fetchLesson() started')
      setLoading(true)
      const response = await educationApi.getLessonWithPacks(parseInt(lessonId as string))
      setLesson(response.data)
      setPacks(response.data.packs || [])
      console.log('🔥 [LESSON DETAIL] Packs fetched:', response.data.packs?.length)
      
      const moduleResponse = await educationApi.getModuleWithLessons(parseInt(moduleId as string))
      setModule(moduleResponse.data)
      console.log('🔥 [LESSON DETAIL] Data loaded successfully')
    } catch (error: any) {
      console.error('🔴 [LESSON DETAIL] Error:', error)
      toast.error(error.response?.data?.detail || 'Не удалось загрузить урок')
      navigate({ to: `/education/${moduleId}` })
    } finally {
      setLoading(false)
    }
  }

  const createPack = async () => {
    try {
      await educationApi.createPack({ ...formData, lesson_id: parseInt(lessonId as string) })
      toast.success('Пакет успешно создан')
      setIsCreateDialogOpen(false)
      setFormData({})
      fetchLesson()
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Не удалось создать пакет')
    }
  }

  const updatePack = async () => {
    try {
      await educationApi.updatePack(editingPack!.id, formData)
      toast.success('Пакет успешно обновлён')
      setIsEditDialogOpen(false)
      setEditingPack(null)
      setFormData({})
      fetchLesson()
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Не удалось обновить пакет')
    }
  }

  const deletePack = async (packId: number) => {
    try {
      await educationApi.deletePack(packId)
      toast.success('Пакет успешно удалён')
      fetchLesson()
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Не удалось удалить пакет')
    }
  }

  const openCreateDialog = () => {
    setFormData({ type: 'word', word_count: 0 })
    setIsCreateDialogOpen(true)
  }

  const openEditDialog = (pack: Pack) => {
    setEditingPack(pack)
    setFormData({
      title: pack.title,
      type: pack.type || 'word'
    })
    setIsEditDialogOpen(true)
  }

  console.log('🔥 [LESSON DETAIL] About to render, packs:', packs.length)

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
          <>
            <div className="mb-4 flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                Найдено {packs.length} пакетов в этом уроке
              </div>
              <Button onClick={openCreateDialog}>
                <Plus className="h-4 w-4 mr-2" />
                Добавить пакет
              </Button>
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {packs.map((pack) => (
                <Card key={pack.id} className="group relative hover:shadow-lg transition-shadow">
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                    <Button size="sm" variant="outline" onClick={(e) => { e.stopPropagation(); openEditDialog(pack) }}>
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
                          <AlertDialogTitle>Удалить пакет</AlertDialogTitle>
                          <AlertDialogDescription>
                            Вы уверены, что хотите удалить "{pack.title}"? Это также удалит все слова и грамматические вопросы в этом пакете.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Отмена</AlertDialogCancel>
                          <AlertDialogAction onClick={() => deletePack(pack.id)}>Удалить</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                  <div 
                    className="cursor-pointer"
                    onClick={() => {
                      console.log('🔥🔥🔥 [PACK CLICK] ==================================')
                      console.log('🔥🔥🔥 [PACK CLICK] Pack clicked!')
                      console.log('🔥🔥🔥 [PACK CLICK] - Pack ID:', pack.id)
                      console.log('🔥🔥🔥 [PACK CLICK] - Pack Title:', pack.title)
                      console.log('🔥🔥🔥 [PACK CLICK] - Module ID:', moduleId)
                      console.log('🔥🔥🔥 [PACK CLICK] - Lesson ID:', lessonId)
                      const targetUrl = `/education/${moduleId}/${lessonId}/${pack.id}`
                      console.log('🔥🔥🔥 [PACK CLICK] - Target URL:', targetUrl)
                      console.log('🔥🔥🔥 [PACK CLICK] - About to navigate...')
                      navigate({ 
                        to: '/education/$moduleId/$lessonId/$packId', 
                        params: { 
                          moduleId: (moduleId || '').toString(), 
                          lessonId: (lessonId || '').toString(), 
                          packId: pack.id.toString() 
                        } 
                      })
                      console.log('🔥🔥🔥 [PACK CLICK] - Navigation called!')
                      setTimeout(() => {
                        console.log('🔥🔥🔥 [PACK CLICK] - Post-nav URL:', window.location.href)
                      }, 100)
                      console.log('🔥🔥🔥 [PACK CLICK] ==================================')
                    }}
                  >
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        <div className="flex items-center">
                          <Package className="h-5 w-5 mr-2" />
                          {pack.title}
                        </div>
                        <ChevronRight className="h-4 w-4" />
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">Тип: {pack.type}</p>
                      {pack.type === 'word' && (
                        <p className="text-sm text-muted-foreground">Количество слов: {pack.word_count}</p>
                      )}
                    </CardContent>
                  </div>
                </Card>
              ))}
            </div>
          </>
        )}

        {/* Create Dialog */}
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Создать пакет</DialogTitle>
              <DialogDescription>
                Создать новый пакет в этом уроке
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
                <Label htmlFor="type" className="text-right">Тип</Label>
                <select
                  id="type"
                  value={formData.type || 'word'}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="col-span-3 px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="word">Слово</option>
                  <option value="grammar">Грамматика</option>
                </select>
              </div>
            </div>
            <DialogFooter>
              <Button onClick={createPack}>Создать</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Редактировать пакет</DialogTitle>
              <DialogDescription>
                Редактировать детали пакета
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
                <Label htmlFor="edit-type" className="text-right">Тип</Label>
                <select
                  id="edit-type"
                  value={formData.type || 'word'}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="col-span-3 px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="word">Слово</option>
                  <option value="grammar">Грамматика</option>
                </select>
              </div>
            </div>
            <DialogFooter>
              <Button onClick={updatePack}>Обновить</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
    </>
  )
}