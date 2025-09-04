import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ConfigDrawer } from '@/components/config-drawer'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { educationApi, quizApi, type Module, type Lesson, type Pack, type Word, type Grammar } from '@/lib/api'
import { toast } from 'sonner'
import { ChevronRight, ArrowLeft, BookOpen, FileText, Package, Type, Brain, Plus, Edit, Trash2 } from 'lucide-react'
import { useNavigate } from '@tanstack/react-router'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'

type NavigationLevel = 'modules' | 'lessons' | 'packs' | 'content'

export function Education() {
  const navigate = useNavigate()
  const [currentLevel, setCurrentLevel] = useState<NavigationLevel>('modules')
  const [selectedModule, setSelectedModule] = useState<Module | null>(null)
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null)
  const [selectedPack, setSelectedPack] = useState<Pack | null>(null)
  
  const [modules, setModules] = useState<Module[]>([])
  const [lessons, setLessons] = useState<Lesson[]>([])
  const [packs, setPacks] = useState<Pack[]>([])
  const [words, setWords] = useState<Word[]>([])
  const [grammar, setGrammar] = useState<Grammar[]>([])
  const [loading, setLoading] = useState(true)
  
  // Form states
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<any>(null)
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

  const selectModule = async (module: Module) => {
    setSelectedModule(module)
    setLoading(true)
    try {
      const response = await educationApi.getModuleWithLessons(module.id)
      setLessons(response.data.lessons || [])
      setCurrentLevel('lessons')
    } catch (error: any) {
      const errorMessage = typeof error.response?.data?.detail === 'string' 
        ? error.response.data.detail 
        : 'Failed to fetch lessons'
      toast.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const selectLesson = async (lesson: Lesson) => {
    setSelectedLesson(lesson)
    setLoading(true)
    try {
      const response = await educationApi.getLessonWithPacks(lesson.id)
      setPacks(response.data.packs || [])
      setCurrentLevel('packs')
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Failed to fetch packs')
    } finally {
      setLoading(false)
    }
  }

  const selectPack = async (pack: Pack) => {
    setSelectedPack(pack)
    setLoading(true)
    try {
      if (pack.type === 'word') {
        const response = await quizApi.getWordsByPack(pack.id)
        setWords(response.data)
        setGrammar([])
      } else if (pack.type === 'grammar') {
        setGrammar([])
        setWords([])
        toast.info('Grammar viewing not available - no backend endpoint')
      }
      setCurrentLevel('content')
    } catch (error: any) {
      const errorMessage = typeof error.response?.data?.detail === 'string' 
        ? error.response.data.detail 
        : 'Failed to fetch content'
      toast.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const goBack = () => {
    if (currentLevel === 'content') {
      setCurrentLevel('packs')
      setSelectedPack(null)
    } else if (currentLevel === 'packs') {
      setCurrentLevel('lessons')
      setSelectedLesson(null)
    } else if (currentLevel === 'lessons') {
      setCurrentLevel('modules')
      setSelectedModule(null)
    }
  }

  const getBreadcrumb = () => {
    const parts = ['Modules']
    if (selectedModule) parts.push(selectedModule.title)
    if (selectedLesson) parts.push(selectedLesson.title)
    if (selectedPack) parts.push(selectedPack.title)
    return parts.join(' > ')
  }

  // CRUD Functions
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
      await educationApi.updateModule(editingItem.id, formData)
      toast.success('Module updated successfully')
      setIsEditDialogOpen(false)
      setEditingItem(null)
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

  const createLesson = async () => {
    try {
      await educationApi.createLesson({ ...formData, module_id: selectedModule!.id })
      toast.success('Lesson created successfully')
      setIsCreateDialogOpen(false)
      setFormData({})
      if (selectedModule) selectModule(selectedModule)
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Failed to create lesson')
    }
  }

  const updateLesson = async () => {
    try {
      await educationApi.updateLesson(editingItem.id, formData)
      toast.success('Lesson updated successfully')
      setIsEditDialogOpen(false)
      setEditingItem(null)
      setFormData({})
      if (selectedModule) selectModule(selectedModule)
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Failed to update lesson')
    }
  }

  const deleteLesson = async (lessonId: number) => {
    try {
      await educationApi.deleteLesson(lessonId)
      toast.success('Lesson deleted successfully')
      if (selectedModule) selectModule(selectedModule)
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Failed to delete lesson')
    }
  }

  const createPack = async () => {
    try {
      await educationApi.createPack({ ...formData, lesson_id: selectedLesson!.id })
      toast.success('Pack created successfully')
      setIsCreateDialogOpen(false)
      setFormData({})
      if (selectedLesson) selectLesson(selectedLesson)
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Failed to create pack')
    }
  }

  const updatePack = async () => {
    try {
      await educationApi.updatePack(editingItem.id, formData)
      toast.success('Pack updated successfully')
      setIsEditDialogOpen(false)
      setEditingItem(null)
      setFormData({})
      if (selectedLesson) selectLesson(selectedLesson)
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Failed to update pack')
    }
  }

  const deletePack = async (packId: number) => {
    try {
      await educationApi.deletePack(packId)
      toast.success('Pack deleted successfully')
      if (selectedLesson) selectLesson(selectedLesson)
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Failed to delete pack')
    }
  }

  const openCreateDialog = () => {
    setFormData({})
    setIsCreateDialogOpen(true)
  }

  const openEditDialog = (item: any) => {
    setEditingItem(item)
    setFormData({
      title: item.title,
      description: item.description || '',
      order: item.order || 0,
      type: item.type || 'word',
      word_count: item.word_count || 0
    })
    setIsEditDialogOpen(true)
  }

  const getCreateTitle = () => {
    if (currentLevel === 'modules') return 'Create Module'
    if (currentLevel === 'lessons') return 'Create Lesson'
    if (currentLevel === 'packs') return 'Create Pack'
    return 'Create Item'
  }

  const getEditTitle = () => {
    if (currentLevel === 'modules') return 'Edit Module'
    if (currentLevel === 'lessons') return 'Edit Lesson'
    if (currentLevel === 'packs') return 'Edit Pack'
    return 'Edit Item'
  }

  const handleCreate = () => {
    if (currentLevel === 'modules') createModule()
    else if (currentLevel === 'lessons') createLesson()
    else if (currentLevel === 'packs') createPack()
  }

  const handleUpdate = () => {
    if (currentLevel === 'modules') updateModule()
    else if (currentLevel === 'lessons') updateLesson()
    else if (currentLevel === 'packs') updatePack()
  }

  const handleDelete = (id: number) => {
    if (currentLevel === 'modules') deleteModule(id)
    else if (currentLevel === 'lessons') deleteLesson(id)
    else if (currentLevel === 'packs') deletePack(id)
  }

  return (
    <>
      <Header>
        <Search />
        <div className='ms-auto flex items-center space-x-4'>
          <ThemeSwitch />
          <ConfigDrawer />
          <ProfileDropdown />
        </div>
      </Header>

      <Main>
        <div className='mb-4 flex items-center justify-between'>
          <div>
            <h1 className='text-2xl font-bold tracking-tight'>Education Management</h1>
            <p className='text-muted-foreground'>{getBreadcrumb()}</p>
          </div>
          <div className="flex items-center gap-2">
            {currentLevel !== 'content' && (
              <Button onClick={openCreateDialog}>
                <Plus className="h-4 w-4 mr-2" />
                Add {currentLevel === 'modules' ? 'Module' : currentLevel === 'lessons' ? 'Lesson' : 'Pack'}
              </Button>
            )}
            {currentLevel !== 'modules' && (
              <Button variant="outline" onClick={goBack}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
            )}
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center p-8">Loading...</div>
        ) : (
          <>
            {currentLevel === 'modules' && (
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
                            <AlertDialogTitle>Delete Module</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete "{module.title}"? This will also delete all lessons and packs within this module.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDelete(module.id)}>Delete</AlertDialogAction>
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
                        <p className="text-sm text-muted-foreground">Order: {module.order}</p>
                        <p className="text-xs text-muted-foreground mt-2">
                          Created: {new Date(module.created_at).toLocaleDateString()}
                        </p>
                      </CardContent>
                    </div>
                  </Card>
                ))}
              </div>
            )}

            {currentLevel === 'lessons' && (
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
                            <AlertDialogTitle>Delete Lesson</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete "{lesson.title}"? This will also delete all packs within this lesson.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDelete(lesson.id)}>Delete</AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                    <div className="cursor-pointer" onClick={() => selectLesson(lesson)}>
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
                        <p className="text-sm text-muted-foreground">Order: {lesson.order}</p>
                      </CardContent>
                    </div>
                  </Card>
                ))}
              </div>
            )}

            {currentLevel === 'packs' && (
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
                            <AlertDialogTitle>Delete Pack</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete "{pack.title}"? This will also delete all words and grammar questions within this pack.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDelete(pack.id)}>Delete</AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                    <div className="cursor-pointer" onClick={() => selectPack(pack)}>
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
                        <p className="text-sm text-muted-foreground">Type: {pack.type}</p>
                        <p className="text-sm text-muted-foreground">Word Count: {pack.word_count}</p>
                      </CardContent>
                    </div>
                  </Card>
                ))}
              </div>
            )}

            {currentLevel === 'content' && selectedPack && (
              <div className="space-y-4">
                <div className="flex items-center mb-4">
                  {selectedPack.type === 'word' ? (
                    <Type className="h-5 w-5 mr-2" />
                  ) : (
                    <Brain className="h-5 w-5 mr-2" />
                  )}
                  <h2 className="text-xl font-semibold">
                    {selectedPack.type === 'word' ? 'Words' : 'Grammar Questions'}
                  </h2>
                </div>

                {selectedPack.type === 'word' ? (
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {words.map((word) => (
                      <Card key={word.id}>
                        <CardHeader>
                          <CardTitle className="text-lg">{word.ru_text}</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm"><strong>Uzbek:</strong> {word.uz_text}</p>
                          {word.audio_url && (
                            <p className="text-xs text-muted-foreground mt-2">
                              Audio: {word.audio_url}
                            </p>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-2">
                    {grammar.map((item) => (
                      <Card key={item.id}>
                        <CardHeader>
                          <CardTitle className="text-sm">
                            {item.type.toUpperCase()} Question
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          {item.type === 'fill' ? (
                            <>
                              <p className="text-sm mb-2"><strong>Question:</strong> {item.question_text}</p>
                              <p className="text-sm mb-2"><strong>Options:</strong> {item.options?.join(', ')}</p>
                              <p className="text-sm"><strong>Correct:</strong> {item.correct_option}</p>
                            </>
                          ) : (
                            <p className="text-sm"><strong>Sentence:</strong> {item.sentence}</p>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            )}
          </>
        )}

        {/* Create Dialog */}
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{getCreateTitle()}</DialogTitle>
              <DialogDescription>
                Create a new {currentLevel === 'modules' ? 'module' : currentLevel === 'lessons' ? 'lesson' : 'pack'}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="title" className="text-right">Title</Label>
                <Input
                  id="title"
                  value={formData.title || ''}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="col-span-3"
                />
              </div>
              {currentLevel === 'lessons' && (
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="description" className="text-right">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description || ''}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="col-span-3"
                  />
                </div>
              )}
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="order" className="text-right">Order</Label>
                <Input
                  id="order"
                  type="number"
                  value={formData.order || ''}
                  onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
                  className="col-span-3"
                />
              </div>
              {currentLevel === 'packs' && (
                <>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="type" className="text-right">Type</Label>
                    <select
                      id="type"
                      value={formData.type || 'word'}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                      className="col-span-3 px-3 py-2 border border-gray-300 rounded-md"
                    >
                      <option value="word">Word</option>
                      <option value="grammar">Grammar</option>
                    </select>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="word_count" className="text-right">Word Count</Label>
                    <Input
                      id="word_count"
                      type="number"
                      value={formData.word_count || ''}
                      onChange={(e) => setFormData({ ...formData, word_count: parseInt(e.target.value) || 0 })}
                      className="col-span-3"
                    />
                  </div>
                </>
              )}
            </div>
            <DialogFooter>
              <Button onClick={handleCreate}>Create</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{getEditTitle()}</DialogTitle>
              <DialogDescription>
                Edit {currentLevel === 'modules' ? 'module' : currentLevel === 'lessons' ? 'lesson' : 'pack'} details
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-title" className="text-right">Title</Label>
                <Input
                  id="edit-title"
                  value={formData.title || ''}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="col-span-3"
                />
              </div>
              {currentLevel === 'lessons' && (
                <>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="edit-description" className="text-right">Description</Label>
                    <Textarea
                      id="edit-description"
                      value={formData.description || ''}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="edit-lesson-order" className="text-right">Order</Label>
                    <Input
                      id="edit-lesson-order"
                      type="number"
                      value={formData.order || ''}
                      onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
                      className="col-span-3"
                    />
                  </div>
                </>
              )}
              {currentLevel === 'modules' && (
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-order" className="text-right">Order</Label>
                  <Input
                    id="edit-order"
                    type="number"
                    value={formData.order || ''}
                    onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
                    className="col-span-3"
                  />
                </div>
              )}
              {currentLevel === 'packs' && (
                <>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="edit-type" className="text-right">Type</Label>
                    <select
                      id="edit-type"
                      value={formData.type || 'word'}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                      className="col-span-3 px-3 py-2 border border-gray-300 rounded-md"
                    >
                      <option value="word">Word</option>
                      <option value="grammar">Grammar</option>
                    </select>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="edit-word_count" className="text-right">Word Count</Label>
                    <Input
                      id="edit-word_count"
                      type="number"
                      value={formData.word_count || ''}
                      onChange={(e) => setFormData({ ...formData, word_count: parseInt(e.target.value) || 0 })}
                      className="col-span-3"
                    />
                  </div>
                </>
              )}
            </div>
            <DialogFooter>
              <Button onClick={handleUpdate}>Update</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </Main>
    </>
  )
}