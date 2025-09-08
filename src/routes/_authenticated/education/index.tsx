import { createFileRoute } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { educationApi, type Module } from '@/lib/api'
import { toast } from 'sonner'
import { ChevronRight, BookOpen, Plus, Edit, Trash2 } from 'lucide-react'
import { useNavigate } from '@tanstack/react-router'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'

function EducationModules() {
  const navigate = useNavigate()
  const [modules, setModules] = useState<Module[]>([])
  const [loading, setLoading] = useState(true)
  
  // Form states
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingModule, setEditingModule] = useState<Module | null>(null)
  const [formData, setFormData] = useState<any>({})

  useEffect(() => {
    fetchModules()
  }, [])

  const fetchModules = async () => {
    try {
      setLoading(true)
      const response = await educationApi.getModules()
      setModules(response.data)
    } catch (error: any) {
      const errorMessage = typeof error.response?.data?.detail === 'string' 
        ? error.response.data.detail 
        : 'Failed to fetch modules'
      toast.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const createModule = async () => {
    try {
      await educationApi.createModule(formData)
      toast.success('Module created successfully')
      setIsCreateDialogOpen(false)
      setFormData({})
      fetchModules()
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Failed to create module')
    }
  }

  const updateModule = async () => {
    try {
      await educationApi.updateModule(editingModule!.id, formData)
      toast.success('Module updated successfully')
      setIsEditDialogOpen(false)
      setEditingModule(null)
      setFormData({})
      fetchModules()
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Failed to update module')
    }
  }

  const deleteModule = async (moduleId: number) => {
    try {
      await educationApi.deleteModule(moduleId)
      toast.success('Module deleted successfully')
      fetchModules()
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Failed to delete module')
    }
  }

  const openCreateDialog = () => {
    setFormData({})
    setIsCreateDialogOpen(true)
  }

  const openEditDialog = (module: Module) => {
    setEditingModule(module)
    setFormData({
      title: module.title,
      order: module.order || 0
    })
    setIsEditDialogOpen(true)
  }

  return (
    <>
      <div className='mb-4 flex items-center justify-between'>
        <div>
          <h1 className='text-2xl font-bold tracking-tight'>Управление образованием</h1>
          <p className='text-muted-foreground'>Модули</p>
        </div>
        <Button onClick={openCreateDialog}>
          <Plus className="h-4 w-4 mr-2" />
          Добавить модуль
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center p-8">Загрузка...</div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {modules.map((module) => (
            <Card key={module.id} className="group relative hover:shadow-lg transition-shadow">
              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                <Button size="sm" variant="outline" onClick={(e) => { e.stopPropagation(); openEditDialog(module) }}>
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
                      <AlertDialogTitle>Удалить модуль</AlertDialogTitle>
                      <AlertDialogDescription>
                        Вы уверены, что хотите удалить "{module.title}"? Это также удалит все уроки и пакеты в этом модуле.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Отмена</AlertDialogCancel>
                      <AlertDialogAction onClick={() => deleteModule(module.id)}>Удалить</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
              <div className="cursor-pointer" onClick={() => navigate({ to: `/education/${module.id}` })}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center">
                      <BookOpen className="h-5 w-5 mr-2" />
                      {module.title}
                    </div>
                    <ChevronRight className="h-4 w-4" />
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">Порядок: {module.order}</p>
                  <p className="text-xs text-muted-foreground mt-2">
                    Создан: {new Date(module.created_at).toLocaleDateString()}
                  </p>
                </CardContent>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Create Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Создать модуль</DialogTitle>
            <DialogDescription>
              Создать новый модуль
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
            <Button onClick={createModule}>Создать</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Редактировать модуль</DialogTitle>
            <DialogDescription>
              Редактировать детали модуля
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
            <Button onClick={updateModule}>Обновить</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

export const Route = createFileRoute('/_authenticated/education/')({
  component: EducationModules,
})