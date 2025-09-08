import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { subscriptionApi, type BusinessConfig } from '@/lib/api'

const businessFormSchema = z.object({
  company_name: z.string().min(1, 'Название компании обязательно'),
  telegram_url: z.string().optional().refine((url) => {
    if (!url || url.trim() === '') return true
    return url.startsWith('https://t.me/') || url.startsWith('https://telegram.me/')
  }, 'URL должен начинаться с https://t.me/ или https://telegram.me/'),
  instagram_url: z.string().optional().refine((url) => {
    if (!url || url.trim() === '') return true
    return url.startsWith('https://instagram.com/') || url.startsWith('https://www.instagram.com/')
  }, 'URL должен начинаться с https://instagram.com/ или https://www.instagram.com/'),
  website_url: z.string().optional().refine((url) => {
    if (!url || url.trim() === '') return true
    try {
      new URL(url)
      return true
    } catch {
      return false
    }
  }, 'Введите корректный URL'),
  support_email: z.string().email('Введите корректный email адрес').optional().or(z.literal('')),
  required_app_version: z.string().regex(/^\d+\.\d+\.\d+$/, 'Версия должна быть в формате X.Y.Z (например, 1.2.3)'),
})

type BusinessFormValues = z.infer<typeof businessFormSchema>

export function BusinessForm() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [businessProfile, setBusinessProfile] = useState<BusinessConfig | null>(null)

  const form = useForm<BusinessFormValues>({
    resolver: zodResolver(businessFormSchema),
    defaultValues: {
      company_name: '',
      telegram_url: '',
      instagram_url: '',
      website_url: '',
      support_email: '',
      required_app_version: '1.0.0',
    },
  })

  useEffect(() => {
    fetchBusinessProfile()
  }, [])

  const fetchBusinessProfile = async () => {
    try {
      const response = await subscriptionApi.getBusiness()
      const profile = response.data
      setBusinessProfile(profile)
      
      form.reset({
        company_name: profile.company_name || '',
        telegram_url: profile.telegram_url || '',
        instagram_url: profile.instagram_url || '',
        website_url: profile.website_url || '',
        support_email: profile.support_email || '',
        required_app_version: profile.required_app_version || '1.0.0',
      })
    } catch (error: any) {
      toast.error('Не удалось загрузить бизнес-профиль')
      console.error('Failed to fetch business profile:', error)
    } finally {
      setLoading(false)
    }
  }

  const onSubmit = async (data: BusinessFormValues) => {
    try {
      setSaving(true)
      
      const updateData = {
        company_name: data.company_name,
        telegram_url: data.telegram_url || undefined,
        instagram_url: data.instagram_url || undefined,
        website_url: data.website_url || undefined,
        support_email: data.support_email || undefined,
        required_app_version: data.required_app_version,
      }

      await subscriptionApi.updateBusiness(updateData)
      toast.success('Бизнес-профиль успешно обновлен')
      
      fetchBusinessProfile()
    } catch (error: any) {
      console.error('Business profile update error:', error)
      const errorMessage = error.response?.data?.detail || 'Не удалось обновить бизнес-профиль'
      toast.error(errorMessage)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin" />
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Информация о компании</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="company_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Название компании *</FormLabel>
                    <FormControl>
                      <Input placeholder="Введите название компании" {...field} />
                    </FormControl>
                    <FormDescription>
                      Официальное название вашей компании
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="support_email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email для поддержки</FormLabel>
                    <FormControl>
                      <Input 
                        type="email" 
                        placeholder="support@company.com" 
                        {...field} 
                        value={field.value || ''} 
                      />
                    </FormControl>
                    <FormDescription>
                      Email адрес для обращений пользователей в службу поддержки
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="required_app_version"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Требуемая версия приложения *</FormLabel>
                    <FormControl>
                      <Input placeholder="1.0.0" {...field} />
                    </FormControl>
                    <FormDescription>
                      Минимальная версия приложения для доступа к премиум функциям (формат: X.Y.Z)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </form>
          </Form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Социальные сети и контакты</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="telegram_url"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Telegram канал/группа</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="https://t.me/yourchannel" 
                        {...field} 
                        value={field.value || ''} 
                      />
                    </FormControl>
                    <FormDescription>
                      Ссылка на ваш Telegram канал или группу
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="instagram_url"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Instagram профиль</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="https://instagram.com/yourprofile" 
                        {...field} 
                        value={field.value || ''} 
                      />
                    </FormControl>
                    <FormDescription>
                      Ссылка на ваш Instagram профиль
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="website_url"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Официальный сайт</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="https://yourwebsite.com" 
                        {...field} 
                        value={field.value || ''} 
                      />
                    </FormControl>
                    <FormDescription>
                      Ссылка на официальный сайт компании
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </form>
          </Form>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button 
          type="submit" 
          onClick={form.handleSubmit(onSubmit)}
          disabled={saving}
          className="min-w-[120px]"
        >
          {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {saving ? 'Сохранение...' : 'Сохранить'}
        </Button>
      </div>

      {businessProfile && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Информация о профиле</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm text-muted-foreground">
              <div className="flex justify-between">
                <span>ID профиля:</span>
                <span>{businessProfile.id}</span>
              </div>
              <div className="flex justify-between">
                <span>Создан:</span>
                <span>{new Date(businessProfile.created_at).toLocaleDateString('ru-RU')}</span>
              </div>
              <div className="flex justify-between">
                <span>Последнее обновление:</span>
                <span>{new Date(businessProfile.updated_at).toLocaleDateString('ru-RU')}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}