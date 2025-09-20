import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { educationApi, quizApi, grammarTopicsApi, type Pack, type Word, type Grammar, type GrammarTopic } from '@/lib/api'
import { toast } from 'sonner'
import { ArrowLeft, Plus, Edit, Trash2, Upload } from 'lucide-react'
import { useNavigate, useParams } from '@tanstack/react-router'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'

export function PackDetail() {
  const navigate = useNavigate()
  const { moduleId, lessonId, packId } = useParams({ strict: false })
  const [pack, setPack] = useState<Pack | null>(null)
  const [words, setWords] = useState<Word[]>([])
  const [grammarTopic, setGrammarTopic] = useState<GrammarTopic | null>(null)
  const [grammarQuestions, setGrammarQuestions] = useState<Grammar[]>([])
  const [loading, setLoading] = useState(true)
  
  // Form states
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isAudioDialogOpen, setIsAudioDialogOpen] = useState(false)
  const [isCreateTopicDialogOpen, setIsCreateTopicDialogOpen] = useState(false)
  const [isQuestionDialogOpen, setIsQuestionDialogOpen] = useState(false)
  const [isEditQuestionDialogOpen, setIsEditQuestionDialogOpen] = useState(false)
  const [editingWord, setEditingWord] = useState<Word | null>(null)
  const [editingGrammarQuestion, setEditingGrammarQuestion] = useState<Grammar | null>(null)
  const [audioUploadWord, setAudioUploadWord] = useState<Word | null>(null)
  const [formData, setFormData] = useState<any>({})
  const [audioFile, setAudioFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [creatingTopic, setCreatingTopic] = useState(false)

  useEffect(() => {
    fetchPackDetail()
  }, [packId])

  const fetchPackDetail = async () => {
    try {
      setLoading(true)
      const packResponse = await educationApi.getPack(parseInt(packId as string))
      setPack(packResponse.data)
      
      if (packResponse.data.type === 'word') {
        try {
          const wordsResponse = await quizApi.getWordsByPack(packResponse.data.id)
          setWords(wordsResponse.data)
        } catch (wordsError: any) {
          if (wordsError.response?.status === 404) {
            setWords([])
          } else {
            throw wordsError
          }
        }
      } else if (packResponse.data.type === 'grammar') {
        try {
          const topicResponse = await grammarTopicsApi.getByPack(packResponse.data.id)
          setGrammarTopic(topicResponse.data)
        } catch (topicError: any) {
          if (topicError.response?.status === 404) {
            setGrammarTopic(null)
          } else {
            setGrammarTopic(null)
          }
        }
        
        try {
          const questionsResponse = await quizApi.getGrammarByPack(packResponse.data.id)
          setGrammarQuestions(questionsResponse.data)
        } catch (questionsError: any) {
          if (questionsError.response?.status === 404) {
            setGrammarQuestions([])
          }
        }
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.detail || error.response?.data?.message || 'Failed to fetch pack details'
      toast.error(typeof errorMessage === 'string' ? errorMessage : 'Не удалось загрузить детали пакета')
      navigate({ to: `/education/${moduleId}/${lessonId}` })
    } finally {
      setLoading(false)
    }
  }

  const createWord = async () => {
    try {
      const requestData = {
        pack_id: parseInt(packId as string),
        ru_text: formData.ru_text,
        uz_text: formData.uz_text
      }
      console.log('💾 [CREATE WORD] Request data:', requestData)
      
      const response = await quizApi.createWord(requestData)
      console.log('💾 [CREATE WORD] Response:', response.data)
      
      toast.success('Слово успешно создано')
      setIsCreateDialogOpen(false)
      setFormData({})
      fetchPackDetail()
    } catch (error: any) {
      console.error('🔴 [CREATE WORD] Full error:', error)
      console.error('🔴 [CREATE WORD] Error response:', error.response)
      console.error('🔴 [CREATE WORD] Error data:', error.response?.data)
      console.error('🔴 [CREATE WORD] Status code:', error.response?.status)
      
      let errorMessage = 'Не удалось создать слово'
      if (error.response?.data) {
        if (typeof error.response.data === 'string') {
          errorMessage = error.response.data
        } else if (error.response.data.detail) {
          errorMessage = Array.isArray(error.response.data.detail) 
            ? error.response.data.detail.map((d: any) => d.msg || d).join(', ')
            : error.response.data.detail
        } else if (error.response.data.message) {
          errorMessage = error.response.data.message
        }
      }
      
      toast.error(errorMessage)
    }
  }

  const updateWord = async () => {
    try {
      await quizApi.updateWord(editingWord!.id, {
        ru_text: formData.ru_text,
        uz_text: formData.uz_text
      })
      
      toast.success('Слово успешно обновлено')
      setIsEditDialogOpen(false)
      setEditingWord(null)
      setFormData({})
      fetchPackDetail()
    } catch (error: any) {
      const errorMessage = error.response?.data?.detail || error.response?.data?.message || 'Failed to update word'
      toast.error(typeof errorMessage === 'string' ? errorMessage : 'Не удалось обновить слово')
    }
  }

  const deleteWord = async (wordId: number) => {
    try {
      await quizApi.deleteWord(wordId)
      toast.success('Слово успешно удалено')
      fetchPackDetail()
    } catch (error: any) {
      const errorMessage = error.response?.data?.detail || error.response?.data?.message || 'Failed to delete word'
      toast.error(typeof errorMessage === 'string' ? errorMessage : 'Не удалось удалить слово')
    }
  }


  const uploadWordAudio = async () => {
    try {
      setUploading(true)
      await quizApi.uploadWordAudio(audioUploadWord!.id, audioFile!)
      toast.success('Аудио успешно загружено')
      setIsAudioDialogOpen(false)
      setAudioUploadWord(null)
      setAudioFile(null)
      fetchPackDetail()
    } catch (error: any) {
      const errorMessage = error.response?.data?.detail || error.response?.data?.message || 'Failed to upload audio'
      toast.error(typeof errorMessage === 'string' ? errorMessage : 'Не удалось загрузить аудио')
    } finally {
      setUploading(false)
    }
  }

  const openCreateDialog = () => {
    setFormData({})
    setIsCreateDialogOpen(true)
  }

  const openEditDialog = (word: Word) => {
    setEditingWord(word)
    setFormData({
      ru_text: word.ru_text,
      uz_text: word.uz_text
    })
    setIsEditDialogOpen(true)
  }

  const openAudioDialog = (word: Word) => {
    setAudioUploadWord(word)
    setAudioFile(null)
    setIsAudioDialogOpen(true)
  }


  const openEditQuestionDialog = (question: Grammar) => {
    setEditingGrammarQuestion(question)
    const formFields: any = {
      type: question.type
    }
    
    if (question.type === 'fill') {
      formFields.correct_option = question.correct_option?.toString()
      // Set individual option fields
      if (question.options) {
        formFields.option_0 = question.options[0] || ''
        formFields.option_1 = question.options[1] || ''
        formFields.option_2 = question.options[2] || ''
        formFields.option_3 = question.options[3] || ''
      }
      
      // Split question text at ___
      const questionText = question.question_text || ''
      const parts = questionText.split('___')
      formFields.text_before = parts[0]?.trim() || ''
      formFields.text_after = parts[1]?.trim() || ''
    } else {
      formFields.sentence = question.sentence
    }
    
    setFormData(formFields)
    setIsEditQuestionDialogOpen(true)
  }

  const createGrammarTopicWithUrl = async () => {
    try {
      setCreatingTopic(true)
      const requestData = {
        pack_id: parseInt(packId as string),
        video_url: formData.video_url,
        markdown_text: ''
      }
      console.log('🔥 [GRAMMAR TOPIC CREATE] Request data:', requestData)
      
      const response = await grammarTopicsApi.create(requestData)
      console.log('🔥 [GRAMMAR TOPIC CREATE] Response:', response.data)
      
      toast.success('Тема по грамматике создана! Переходим к редактору...')
      setIsCreateTopicDialogOpen(false)
      setFormData({})
      
      // Navigate to the topic editor after creation
      console.log('✅ [GRAMMAR TOPIC CREATE] Topic created successfully, navigating to editor...')
      console.log('✅ [GRAMMAR TOPIC CREATE] Navigation URL:', `/education/${moduleId}/${lessonId}/${packId}/topic`)
      setTimeout(() => {
        console.log('🚀 [GRAMMAR TOPIC CREATE] Executing navigation...')
        navigate({ to: `/education/${moduleId}/${lessonId}/${packId}/topic` })
      }, 500)
    } catch (error: any) {
      console.error('🔴 [GRAMMAR TOPIC CREATE] Full error:', error)
      console.error('🔴 [GRAMMAR TOPIC CREATE] Error response:', error.response)
      console.error('🔴 [GRAMMAR TOPIC CREATE] Error data:', error.response?.data)
      console.error('🔴 [GRAMMAR TOPIC CREATE] Status code:', error.response?.status)
      
      const errorMessage = error.response?.data?.detail || error.response?.data?.message || 'Не удалось создать тему'
      toast.error(typeof errorMessage === 'string' ? errorMessage : 'Failed to create topic')
    } finally {
      setCreatingTopic(false)
    }
  }

  const validateTelegramUrl = (url: string): boolean => {
    const telegramPatterns = [
      /^https?:\/\/t\.me\//,
      /^https?:\/\/telegram\.me\//,
      /^https?:\/\/.*telegram.*\//
    ]
    return telegramPatterns.some(pattern => pattern.test(url))
  }


  const createGrammarQuestion = async () => {
    try {
      const questionData: any = {
        pack_id: parseInt(packId as string),
        type: formData.type
      }
      
      if (formData.type === 'fill') {
        const options = [
          formData.option_0 || '',
          formData.option_1 || '',
          formData.option_2 || '',
          formData.option_3 || ''
        ].filter(option => option.trim() !== '')
        
        const correctOptionIndex = parseInt(formData.correct_option || '0')
        const textBefore = formData.text_before || ''
        const textAfter = formData.text_after || ''
        
        // Create question by combining text_before + ___ + text_after
        const questionText = `${textBefore} ___ ${textAfter}`.trim()
        
        questionData.question_text = questionText
        questionData.options = options
        questionData.correct_option = correctOptionIndex
      } else {
        questionData.sentence = formData.sentence
      }
      
      await quizApi.createGrammar(questionData)
      toast.success('Вопрос по грамматике успешно создан')
      setIsQuestionDialogOpen(false)
      setFormData({})
      fetchPackDetail()
    } catch (error: any) {
      const errorMessage = error.response?.data?.detail || error.response?.data?.message || 'Не удалось создать вопрос'
      toast.error(typeof errorMessage === 'string' ? errorMessage : 'Failed to create question')
    }
  }

  const updateGrammarQuestion = async () => {
    try {
      const questionData: any = {
        type: formData.type
      }
      
      if (formData.type === 'fill') {
        const options = [
          formData.option_0 || '',
          formData.option_1 || '',
          formData.option_2 || '',
          formData.option_3 || ''
        ].filter(option => option.trim() !== '')
        
        const correctOptionIndex = parseInt(formData.correct_option || '0')
        const textBefore = formData.text_before || ''
        const textAfter = formData.text_after || ''
        
        // Create question by combining text_before + ___ + text_after
        const questionText = `${textBefore} ___ ${textAfter}`.trim()
        
        questionData.question_text = questionText
        questionData.options = options
        questionData.correct_option = correctOptionIndex
      } else {
        questionData.sentence = formData.sentence
      }
      
      await quizApi.updateGrammar(editingGrammarQuestion!.id, questionData)
      toast.success('Вопрос по грамматике успешно обновлён')
      setIsEditQuestionDialogOpen(false)
      setEditingGrammarQuestion(null)
      setFormData({})
      fetchPackDetail()
    } catch (error: any) {
      const errorMessage = error.response?.data?.detail || error.response?.data?.message || 'Не удалось обновить вопрос'
      toast.error(typeof errorMessage === 'string' ? errorMessage : 'Failed to update question')
    }
  }

  const deleteGrammarQuestion = async (questionId: number) => {
    try {
      await quizApi.deleteGrammar(questionId)
      toast.success('Вопрос по грамматике успешно удалён')
      fetchPackDetail()
    } catch (error: any) {
      const errorMessage = error.response?.data?.detail || error.response?.data?.message || 'Не удалось удалить вопрос'
      toast.error(typeof errorMessage === 'string' ? errorMessage : 'Failed to delete question')
    }
  }

  const handleAudioFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 1024 * 1024) {
        toast.error('Аудиофайл должен быть меньше 1МБ')
        return
      }
      const allowedTypes = ['audio/mp3', 'audio/wav', 'audio/ogg', 'audio/m4a', 'audio/mpeg']
      const fileName = file.name.toLowerCase()
      const hasValidExtension = ['.mp3', '.wav', '.ogg', '.m4a'].some(ext => fileName.endsWith(ext))
      
      if (!allowedTypes.includes(file.type) && !hasValidExtension) {
        toast.error('Поддерживаются только файлы MP3, WAV, OGG, M4A')
        return
      }
      setAudioFile(file)
    }
  }

  if (loading) {
    return <div className="flex justify-center p-8">Загрузка деталей пакета...</div>
  }

  if (!pack) {
    return <div className="text-center p-8">Пакет не найден</div>
  }

  if (pack.type === 'grammar') {
    return (
      <>
        <div className='mb-4 flex items-center justify-between'>
          <div>
            <h1 className='text-2xl font-bold tracking-tight'>{pack.title}</h1>
            <p className='text-muted-foreground'>Пакет грамматики • {grammarQuestions.length} вопросов</p>
          </div>
          <Button variant="outline" onClick={() => navigate({ to: `/education/${moduleId}/${lessonId}` })}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Назад к пакетам
          </Button>
        </div>

        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-medium">Тема грамматики</h3>
            {!grammarTopic && (
              <Button size="sm" onClick={() => {
                setFormData({ video_url: '' })
                setIsCreateTopicDialogOpen(true)
              }}>
                <Plus className="h-4 w-4 mr-1" />
                Создать тему
              </Button>
            )}
          </div>
          
          <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-3">
            {grammarTopic ? (
              <Card className="p-3">
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">Образовательный контент</span>
                      <span className="text-xs bg-green-50 text-green-700 px-2 py-1 rounded">
                        {grammarTopic.video_url?.includes('t.me') ? 'Видео Telegram' : 'Видео'}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1 truncate">
                      {grammarTopic.markdown_text ? `${grammarTopic.markdown_text.slice(0, 60)}...` : 'Контент ещё не добавлен'}
                    </p>
                  </div>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={() => {
                      console.log('🚀 [PACK DETAIL] Attempting to navigate to topic:', `/education/${moduleId}/${lessonId}/${packId}/topic`)
                      console.log('🚀 [PACK DETAIL] Current params:', { moduleId, lessonId, packId })
                      navigate({ to: `/education/${moduleId}/${lessonId}/${packId}/topic` })
                    }}
                  >
                    <Edit className="h-3 w-3" />
                  </Button>
                </div>
              </Card>
            ) : (
              <Card className="p-3 border-dashed">
                <div className="text-center text-muted-foreground">
                  <Plus className="h-6 w-6 mx-auto mb-1 opacity-50" />
                  <p className="text-sm">Тема грамматики ещё не создана</p>
                  <p className="text-xs">Добавьте образовательный контент с видео и объяснениями</p>
                </div>
              </Card>
            )}
          </div>
        </div>

        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="font-medium text-lg">Вопросы по грамматике</h3>
            <p className="text-sm text-muted-foreground">
              {grammarQuestions.length} вопросов • Упражнения на заполнение пропусков и составление предложений
            </p>
          </div>
          <Button onClick={() => {
            setFormData({ 
              type: 'fill', 
              text_before: '', 
              text_after: '', 
              correct_option: '0', 
              sentence: '',
              option_0: '',
              option_1: '',
              option_2: '',
              option_3: ''
            })
            setIsQuestionDialogOpen(true)
          }}>
            <Plus className="h-4 w-4 mr-2" />
            Добавить вопрос
          </Button>
        </div>

        {grammarQuestions.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {grammarQuestions.map((question) => (
              <Card key={question.id} className="p-2 w-full">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center rounded bg-blue-50 px-1.5 py-0.5 text-xs font-medium text-blue-700">
                      {question.type.toUpperCase()}
                    </span>
                    <div className="flex gap-1">
                      <Button size="sm" variant="ghost" onClick={() => openEditQuestionDialog(question)} className="h-6 w-6 p-0">
                        <Edit className="h-3 w-3" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button size="sm" variant="ghost" className="h-6 w-6 p-0">
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Удалить вопрос по грамматике</AlertDialogTitle>
                            <AlertDialogDescription>
                              Вы уверены, что хотите удалить этот вопрос по грамматике?
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Отмена</AlertDialogCancel>
                            <AlertDialogAction onClick={() => deleteGrammarQuestion(question.id)}>Удалить</AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                  
                  {question.type === 'fill' ? (
                    <div className="min-h-0">
                      <p className="font-medium text-xs mb-1 line-clamp-2">{question.question_text}</p>
                      <p className="text-xs text-muted-foreground truncate">
                        {question.options?.join(', ')}
                      </p>
                      <p className="text-xs text-green-600 font-medium">
                        ✓ {question.options?.[question.correct_option || 0]}
                      </p>
                    </div>
                  ) : (
                    <div className="min-h-0">
                      <p className="font-medium text-xs line-clamp-3">{question.sentence}</p>
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-3">
            <Card className="p-3 text-center border-dashed">
              <div className="text-muted-foreground">
                <Plus className="h-4 w-4 mx-auto mb-1 opacity-50" />
                <p className="text-xs">Пока нет вопросов</p>
                <p className="text-xs opacity-75">Создайте упражнения</p>
              </div>
            </Card>
          </div>
        )}

        {/* Grammar Question Create Dialog */}
        <Dialog open={isQuestionDialogOpen} onOpenChange={setIsQuestionDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Добавить вопрос по грамматике</DialogTitle>
              <DialogDescription>
                Создать новое грамматическое упражнение
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="type" className="text-right">Тип</Label>
                <select
                  id="type"
                  value={formData.type || 'fill'}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="col-span-3 px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="fill">Заполнение (выбор варианта)</option>
                  <option value="build">Составление (предложение)</option>
                </select>
              </div>
              
              {formData.type === 'fill' ? (
                <>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="text_before" className="text-right">Текст до ___</Label>
                    <Input
                      id="text_before"
                      value={formData.text_before || ''}
                      onChange={(e) => {
                        const value = e.target.value
                        const validPattern = /^[a-zA-Zа-яёА-ЯЁ0-9\s.,?_-]*$/
                        if (validPattern.test(value)) {
                          setFormData({ ...formData, text_before: value })
                        }
                      }}
                      className="col-span-3"
                      placeholder="I"
                      autoComplete="off"
                      autoCorrect="off"
                      autoCapitalize="off"
                      spellCheck="false"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="text_after" className="text-right">Текст после ___</Label>
                    <Input
                      id="text_after"
                      value={formData.text_after || ''}
                      onChange={(e) => {
                        const value = e.target.value
                        const validPattern = /^[a-zA-Zа-яёА-ЯЁ0-9\s.,?_-]*$/
                        if (validPattern.test(value)) {
                          setFormData({ ...formData, text_after: value })
                        }
                      }}
                      className="col-span-3"
                      placeholder="a student."
                      autoComplete="off"
                      autoCorrect="off"
                      autoCapitalize="off"
                      spellCheck="false"
                    />
                  </div>
                  
                  <div className="space-y-3">
                    <Label className="text-sm font-medium">Варианты (выберите правильный ответ)</Label>
                    <div className="space-y-2">
                      {[0, 1, 2, 3].map((index) => (
                        <div key={index} className="flex items-center gap-3">
                          <input
                            type="radio"
                            id={`option_${index}`}
                            name="correct_option"
                            checked={parseInt(formData.correct_option || '0') === index}
                            onChange={() => setFormData({ ...formData, correct_option: index.toString() })}
                            className="h-4 w-4"
                          />
                          <Input
                            value={formData[`option_${index}`] || ''}
                            onChange={(e) => {
                              const value = e.target.value
                              const validPattern = /^[a-zA-Zа-яёА-ЯЁ0-9\s.,?-]*$/
                              if (validPattern.test(value)) {
                                setFormData({ ...formData, [`option_${index}`]: value })
                              }
                            }}
                            placeholder={`Вариант ${index + 1}`}
                            className="flex-1"
                            autoComplete="off"
                            autoCorrect="off"
                            autoCapitalize="off"
                            spellCheck="false"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              ) : (
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="sentence" className="text-right">Предложение</Label>
                  <Input
                    id="sentence"
                    value={formData.sentence || ''}
                    onChange={(e) => {
                      const value = e.target.value
                      const validPattern = /^[a-zA-Zа-яёА-ЯЁ0-9\s.,?-]*$/
                      if (validPattern.test(value)) {
                        setFormData({ ...formData, sentence: value })
                      }
                    }}
                    className="col-span-3"
                    placeholder="I go to school every day"
                    autoComplete="off"
                    autoCorrect="off"
                    autoCapitalize="off"
                    spellCheck="false"
                  />
                </div>
              )}
            </div>
            <DialogFooter>
              <Button onClick={createGrammarQuestion}>Создать вопрос</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Grammar Question Edit Dialog */}
        <Dialog open={isEditQuestionDialogOpen} onOpenChange={setIsEditQuestionDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Редактировать вопрос по грамматике</DialogTitle>
              <DialogDescription>
                Обновить это грамматическое упражнение
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit_type" className="text-right">Тип</Label>
                <select
                  id="edit_type"
                  value={formData.type || 'fill'}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="col-span-3 px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="fill">Заполнение (выбор варианта)</option>
                  <option value="build">Составление (предложение)</option>
                </select>
              </div>
              
              {formData.type === 'fill' ? (
                <>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="edit_text_before" className="text-right">Текст до ___</Label>
                    <Input
                      id="edit_text_before"
                      value={formData.text_before || ''}
                      onChange={(e) => {
                        const value = e.target.value
                        const validPattern = /^[a-zA-Zа-яёА-ЯЁ0-9\s.,?_-]*$/
                        if (validPattern.test(value)) {
                          setFormData({ ...formData, text_before: value })
                        }
                      }}
                      className="col-span-3"
                      placeholder="I"
                      autoComplete="off"
                      autoCorrect="off"
                      autoCapitalize="off"
                      spellCheck="false"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="edit_text_after" className="text-right">Текст после ___</Label>
                    <Input
                      id="edit_text_after"
                      value={formData.text_after || ''}
                      onChange={(e) => {
                        const value = e.target.value
                        const validPattern = /^[a-zA-Zа-яёА-ЯЁ0-9\s.,?_-]*$/
                        if (validPattern.test(value)) {
                          setFormData({ ...formData, text_after: value })
                        }
                      }}
                      className="col-span-3"
                      placeholder="a student."
                      autoComplete="off"
                      autoCorrect="off"
                      autoCapitalize="off"
                      spellCheck="false"
                    />
                  </div>
                  
                  <div className="space-y-3">
                    <Label className="text-sm font-medium">Варианты (выберите правильный ответ)</Label>
                    <div className="space-y-2">
                      {[0, 1, 2, 3].map((index) => (
                        <div key={index} className="flex items-center gap-3">
                          <input
                            type="radio"
                            id={`edit_option_${index}`}
                            name="edit_correct_option"
                            checked={parseInt(formData.correct_option || '0') === index}
                            onChange={() => setFormData({ ...formData, correct_option: index.toString() })}
                            className="h-4 w-4"
                          />
                          <Input
                            value={formData[`option_${index}`] || ''}
                            onChange={(e) => {
                              const value = e.target.value
                              const validPattern = /^[a-zA-Zа-яёА-ЯЁ0-9\s.,?-]*$/
                              if (validPattern.test(value)) {
                                setFormData({ ...formData, [`option_${index}`]: value })
                              }
                            }}
                            placeholder={`Вариант ${index + 1}`}
                            className="flex-1"
                            autoComplete="off"
                            autoCorrect="off"
                            autoCapitalize="off"
                            spellCheck="false"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              ) : (
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit_sentence" className="text-right">Предложение</Label>
                  <Input
                    id="edit_sentence"
                    value={formData.sentence || ''}
                    onChange={(e) => {
                      const value = e.target.value
                      const validPattern = /^[a-zA-Zа-яёА-ЯЁ0-9\s.,?-]*$/
                      if (validPattern.test(value)) {
                        setFormData({ ...formData, sentence: value })
                      }
                    }}
                    className="col-span-3"
                    placeholder="I go to school every day"
                    autoComplete="off"
                    autoCorrect="off"
                    autoCapitalize="off"
                    spellCheck="false"
                  />
                </div>
              )}
            </div>
            <DialogFooter>
              <Button onClick={updateGrammarQuestion}>Обновить вопрос</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Create Topic Dialog */}
        <Dialog open={isCreateTopicDialogOpen} onOpenChange={setIsCreateTopicDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Создать тему по грамматике</DialogTitle>
              <DialogDescription>
                Добавьте URL видео Telegram. Контент Markdown будет пустым изначально.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-3">
              <div className="space-y-2">
                <Label htmlFor="topic_video_url">URL видео Telegram</Label>
                <Input
                  id="topic_video_url"
                  value={formData.video_url || ''}
                  onChange={(e) => setFormData({ ...formData, video_url: e.target.value })}
                  placeholder="https://t.me/channel/video_file_id"
                  className={!validateTelegramUrl(formData.video_url || '') && formData.video_url ? 'border-red-300' : ''}
                />
                {formData.video_url && !validateTelegramUrl(formData.video_url) && (
                  <p className="text-xs text-red-600">Введите действительный URL Telegram</p>
                )}
              </div>
            </div>
            <DialogFooter className="gap-2">
              <Button variant="outline" onClick={() => setIsCreateTopicDialogOpen(false)}>
                Отмена
              </Button>
              <Button 
                onClick={createGrammarTopicWithUrl}
                disabled={!formData.video_url || !validateTelegramUrl(formData.video_url) || creatingTopic}
              >
                {creatingTopic ? 'Создание...' : 'Создать и редактировать'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </>
    )
  }

  return (
    <>
      <div className='mb-4 flex items-center justify-between'>
        <div>
          <h1 className='text-2xl font-bold tracking-tight'>{pack.title}</h1>
          <p className='text-muted-foreground'>Словарный пакет • {words.length} слов</p>
        </div>
        <Button variant="outline" onClick={() => navigate({ to: `/education/${moduleId}/${lessonId}` })}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Назад к пакетам
        </Button>
      </div>

      <div className="mb-4 flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          {words.length} слов в этом пакете
        </div>
        <Button onClick={openCreateDialog}>
          <Plus className="h-4 w-4 mr-2" />
          Добавить слово
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {words.map((word) => (
          <Card key={word.id} className="p-3">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <span className="font-medium">{word.ru_text}</span>
                <span className="mx-2 text-muted-foreground">-</span>
                <span className="text-muted-foreground">{word.uz_text}</span>
              </div>
              <div className="flex gap-1">
                <Button size="sm" variant="outline" onClick={() => openEditDialog(word)}>
                  <Edit className="h-3 w-3" />
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button size="sm" variant="outline">
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Удалить слово</AlertDialogTitle>
                      <AlertDialogDescription>
                        Вы уверены, что хотите удалить слово "{word.ru_text}"?
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Отмена</AlertDialogCancel>
                      <AlertDialogAction onClick={() => deleteWord(word.id)}>Удалить</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {word.audio_url ? (
                <audio controls className="flex-1 h-8">
                  <source src={`${import.meta.env.VITE_API_BASE_URL || 'https://lrussrubackend-production.up.railway.app'}${word.audio_url}`} type="audio/mpeg" />
                </audio>
              ) : (
                <div className="flex-1 text-xs text-muted-foreground">Нет аудио</div>
              )}
              <Button size="sm" variant="outline" onClick={() => openAudioDialog(word)}>
                <Upload className="h-3 w-3" />
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {/* Create Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Добавить слово</DialogTitle>
            <DialogDescription>
              Добавить новое слово в этот пакет
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="ru_text" className="text-right">Русский</Label>
              <Input
                id="ru_text"
                value={formData.ru_text || ''}
                onChange={(e) => setFormData({ ...formData, ru_text: e.target.value })}
                className="col-span-3"
                placeholder="Привет"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="uz_text" className="text-right">Узбекский</Label>
              <Input
                id="uz_text"
                value={formData.uz_text || ''}
                onChange={(e) => setFormData({ ...formData, uz_text: e.target.value })}
                className="col-span-3"
                placeholder="Salom"
              />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={createWord}>
              Создать
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Редактировать слово</DialogTitle>
            <DialogDescription>
              Редактировать детали слова
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-ru_text" className="text-right">Русский</Label>
              <Input
                id="edit-ru_text"
                value={formData.ru_text || ''}
                onChange={(e) => setFormData({ ...formData, ru_text: e.target.value })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-uz_text" className="text-right">Узбекский</Label>
              <Input
                id="edit-uz_text"
                value={formData.uz_text || ''}
                onChange={(e) => setFormData({ ...formData, uz_text: e.target.value })}
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={updateWord}>
              Обновить
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Audio Upload Dialog */}
      <Dialog open={isAudioDialogOpen} onOpenChange={setIsAudioDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Загрузить аудио</DialogTitle>
            <DialogDescription>
              Загрузить аудио для "{audioUploadWord?.ru_text}"
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="audio-upload" className="text-right">Аудио</Label>
              <div className="col-span-3">
                <Input
                  id="audio-upload"
                  type="file"
                  accept="audio/mp3,audio/wav,audio/ogg,audio/m4a"
                  onChange={handleAudioFileChange}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Макс 1МБ. Поддерживаемые форматы: MP3, WAV, OGG, M4A.
                </p>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={uploadWordAudio} disabled={!audioFile || uploading}>
              {uploading ? 'Загрузка...' : 'Загрузить аудио'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </>
  )
}