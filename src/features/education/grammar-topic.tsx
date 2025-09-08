import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { MarkdownEditor } from '@/components/markdown-editor'
import { educationApi, grammarTopicsApi, type Pack, type GrammarTopic } from '@/lib/api'
import { toast } from 'sonner'
import { ArrowLeft, Save, Edit, Trash2, Eye, FileText } from 'lucide-react'
import { useNavigate, useParams } from '@tanstack/react-router'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

export function GrammarTopicPage() {
  const navigate = useNavigate()
  const { moduleId, lessonId, packId } = useParams({ strict: false })
  const [pack, setPack] = useState<Pack | null>(null)
  const [topic, setTopic] = useState<GrammarTopic | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    video_url: '',
    markdown_text: ''
  })

  useEffect(() => {
    console.log('🚀 [GRAMMAR TOPIC] Component mounted with params:', { moduleId, lessonId, packId })
    console.log('🚀 [GRAMMAR TOPIC] Current route:', window.location.pathname)
    fetchData()
  }, [packId])

  const fetchData = async () => {
    try {
      console.log('🔍 [GRAMMAR TOPIC] Fetching data for pack:', packId)
      setLoading(true)
      const packResponse = await educationApi.getPack(parseInt(packId as string))
      console.log('✅ [GRAMMAR TOPIC] Pack data fetched:', packResponse.data)
      setPack(packResponse.data)
      
      try {
        const topicResponse = await grammarTopicsApi.getByPack(packResponse.data.id)
        setTopic(topicResponse.data)
        setFormData({
          video_url: topicResponse.data.video_url,
          markdown_text: topicResponse.data.markdown_text
        })
        
        // If the topic has no content, start in edit mode
        if (!topicResponse.data.markdown_text) {
          setIsEditing(true)
        }
      } catch (error: any) {
        if (error.response?.status === 404) {
          setTopic(null)
          setIsEditing(true)
          setFormData({ video_url: '', markdown_text: '' })
        } else {
          throw error
        }
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.detail || error.response?.data?.message || 'Не удалось загрузить данные'
      toast.error(typeof errorMessage === 'string' ? errorMessage : 'Не удалось загрузить данные')
      navigate({ to: `/education/${moduleId}/${lessonId}/${packId}` })
    } finally {
      setLoading(false)
    }
  }

  const createTopic = async () => {
    try {
      setSaving(true)
      const response = await grammarTopicsApi.create({
        pack_id: parseInt(packId as string),
        video_url: formData.video_url,
        markdown_text: formData.markdown_text
      })
      setTopic(response.data)
      setIsEditing(false)
      toast.success('Тема по грамматике успешно создана')
    } catch (error: any) {
      const errorMessage = error.response?.data?.detail || error.response?.data?.message || 'Не удалось создать тему'
      toast.error(typeof errorMessage === 'string' ? errorMessage : 'Не удалось создать тему')
    } finally {
      setSaving(false)
    }
  }

  const updateTopic = async () => {
    try {
      setSaving(true)
      const response = await grammarTopicsApi.update(topic!.id, {
        video_url: formData.video_url,
        markdown_text: formData.markdown_text
      })
      setTopic(response.data)
      setIsEditing(false)
      toast.success('Тема по грамматике успешно обновлена')
    } catch (error: any) {
      const errorMessage = error.response?.data?.detail || error.response?.data?.message || 'Не удалось обновить тему'
      toast.error(typeof errorMessage === 'string' ? errorMessage : 'Не удалось обновить тему')
    } finally {
      setSaving(false)
    }
  }

  const deleteTopic = async () => {
    try {
      await grammarTopicsApi.delete(topic!.id)
      toast.success('Тема по грамматике успешно удалена')
      navigate({ to: `/education/${moduleId}/${lessonId}/${packId}` })
    } catch (error: any) {
      const errorMessage = error.response?.data?.detail || error.response?.data?.message || 'Не удалось удалить тему'
      toast.error(typeof errorMessage === 'string' ? errorMessage : 'Не удалось удалить тему')
    }
  }

  const handleSave = () => {
    if (topic) {
      updateTopic()
    } else {
      createTopic()
    }
  }

  const handleCancel = () => {
    if (topic) {
      setFormData({
        video_url: topic.video_url,
        markdown_text: topic.markdown_text
      })
      setIsEditing(false)
    } else {
      navigate({ to: `/education/${moduleId}/${lessonId}/${packId}` })
    }
  }

  if (loading) {
    return <div className="flex justify-center p-8">Загрузка темы по грамматике...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            {topic ? 'Редактировать' : 'Создать'} тему по грамматике
          </h1>
          <p className="text-muted-foreground">
            {pack?.title} • Educational Content
          </p>
        </div>
        <div className="flex items-center gap-2">
          {topic && !isEditing && (
            <Button variant="outline" onClick={() => setIsEditing(true)}>
              <Edit className="h-4 w-4 mr-2" />
              Редактировать
            </Button>
          )}
          {topic && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Удалить
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Удалить тему по грамматике</AlertDialogTitle>
                  <AlertDialogDescription>
                    Вы уверены, что хотите удалить эту тему по грамматике? Это действие невозможно отменить.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Отмена</AlertDialogCancel>
                  <AlertDialogAction onClick={deleteTopic}>Удалить</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
          <Button variant="outline" onClick={() => navigate({ to: `/education/${moduleId}/${lessonId}/${packId}` })}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Назад к пакету
          </Button>
        </div>
      </div>

      {isEditing || !topic ? (
        <div className="space-y-6">
          <Card className="p-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="video_url">URL видео</Label>
                <Input
                  id="video_url"
                  value={formData.video_url}
                  onChange={(e) => setFormData({ ...formData, video_url: e.target.value })}
                  placeholder="https://t.me/channel/video_file_id"
                />
                <p className="text-xs text-muted-foreground">
                  URL видеофайла Telegram для образовательного контента
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="markdown_content">Образовательный контент</Label>
                <MarkdownEditor
                  value={formData.markdown_text}
                  onChange={(value) => setFormData({ ...formData, markdown_text: value })}
                  placeholder={`# ${pack?.title || 'Grammar Topic'}

## Overview
Explain the main grammar rule here...

## Examples
1. **Simple example**: This is how you use it
2. **Complex example**: Here's a more advanced usage

## Practice Tips
- Remember to...
- Pay attention to...
- Common mistakes to avoid...

## Summary
Key takeaways from this lesson`}
                  height={500}
                  preview="live"
                />
              </div>
            </div>
          </Card>

          <div className="flex items-center justify-between">
            <Button variant="outline" onClick={handleCancel}>
              Отмена
            </Button>
            <Button onClick={handleSave} disabled={saving || !formData.video_url || !formData.markdown_text.trim()}>
              <Save className="h-4 w-4 mr-2" />
              {saving ? 'Сохранение...' : topic ? 'Обновить тему' : 'Создать тему'}
            </Button>
          </div>
        </div>
      ) : (
        <Tabs defaultValue="preview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="preview" className="flex items-center gap-2">
              <Eye className="h-4 w-4" />
              Предпросмотр
            </TabsTrigger>
            <TabsTrigger value="raw" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Исходный контент
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="preview" className="space-y-6">
            <Card className="p-6">
              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium">URL видео</Label>
                  <p className="mt-1 text-sm text-muted-foreground break-all">{topic.video_url}</p>
                </div>
                
                <div>
                  <Label className="text-sm font-medium">Образовательный контент</Label>
                  <div className="mt-2 border rounded-md p-6 bg-background">
                    {topic.markdown_text ? (
                      <div className="prose prose-sm max-w-none dark:prose-invert prose-headings:text-foreground prose-p:text-foreground prose-strong:text-foreground prose-ul:text-foreground prose-ol:text-foreground prose-li:text-foreground prose-blockquote:text-muted-foreground prose-code:text-foreground prose-pre:text-foreground">
                        <ReactMarkdown remarkPlugins={[remarkGfm]} components={{
                          h1: ({children}) => <h1 className="text-2xl font-bold mb-4 text-foreground border-b border-border pb-2">{children}</h1>,
                          h2: ({children}) => <h2 className="text-xl font-semibold mb-3 mt-6 text-foreground">{children}</h2>,
                          h3: ({children}) => <h3 className="text-lg font-semibold mb-2 mt-4 text-foreground">{children}</h3>,
                          h4: ({children}) => <h4 className="text-base font-semibold mb-2 mt-3 text-foreground">{children}</h4>,
                          p: ({children}) => <p className="mb-3 text-foreground leading-relaxed">{children}</p>,
                          ul: ({children}) => <ul className="mb-4 ml-4 space-y-1 text-foreground list-disc">{children}</ul>,
                          ol: ({children}) => <ol className="mb-4 ml-4 space-y-1 text-foreground list-decimal">{children}</ol>,
                          li: ({children}) => <li className="text-foreground leading-relaxed ml-1">{children}</li>,
                          strong: ({children}) => <strong className="font-bold text-foreground">{children}</strong>,
                          em: ({children}) => <em className="italic text-foreground">{children}</em>,
                          code: ({children}) => <code className="bg-muted px-2 py-1 rounded text-sm font-mono text-foreground border border-border">{children}</code>,
                          pre: ({children}) => <pre className="bg-muted border border-border p-4 rounded-md overflow-x-auto mb-4 text-sm text-foreground">{children}</pre>,
                          blockquote: ({children}) => <blockquote className="border-l-4 border-primary pl-4 italic text-muted-foreground mb-4 bg-muted/30 py-2">{children}</blockquote>,
                          table: ({children}) => <div className="overflow-x-auto mb-4"><table className="min-w-full border border-border">{children}</table></div>,
                          thead: ({children}) => <thead className="bg-muted">{children}</thead>,
                          tbody: ({children}) => <tbody>{children}</tbody>,
                          tr: ({children}) => <tr className="border-b border-border">{children}</tr>,
                          th: ({children}) => <th className="border border-border px-4 py-2 text-left font-semibold text-foreground">{children}</th>,
                          td: ({children}) => <td className="border border-border px-4 py-2 text-foreground">{children}</td>,
                          hr: () => <hr className="my-6 border-t border-border" />
                        }}>
                          {topic.markdown_text}
                        </ReactMarkdown>
                      </div>
                    ) : (
                      <p className="text-muted-foreground italic text-center py-8">Контент ещё не добавлен</p>
                    )}
                  </div>
                </div>

                <div className="text-xs text-muted-foreground pt-4 border-t">
                  <div className="flex items-center justify-between">
                    <span>Создан: {new Date(topic.created_at).toLocaleString()}</span>
                    {topic.updated_at !== topic.created_at && (
                      <span>Обновлён: {new Date(topic.updated_at).toLocaleString()}</span>
                    )}
                  </div>
                  <div className="flex items-center gap-4 mt-2">
                    <span>{topic.markdown_text?.length || 0} символов</span>
                    <span>{(topic.markdown_text?.split(/\s+/).filter(word => word.length > 0).length || 0)} слов</span>
                  </div>
                </div>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="raw" className="space-y-6">
            <Card className="p-6">
              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium">URL видео</Label>
                  <p className="mt-1 text-sm text-muted-foreground break-all">{topic.video_url}</p>
                </div>
                
                <div>
                  <Label className="text-sm font-medium">Исходный Markdown контент</Label>
                  <div className="mt-2 border rounded-md p-4 bg-muted/30 max-h-96 overflow-y-auto">
                    {topic.markdown_text ? (
                      <pre className="whitespace-pre-wrap font-mono text-sm">{topic.markdown_text}</pre>
                    ) : (
                      <p className="text-muted-foreground italic text-center py-8">Контент ещё не добавлен</p>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  )
}