import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://lrussrubackend-production.up.railway.app'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('access_token')
      window.location.href = '/sign-in'
    }
    return Promise.reject(error)
  }
)

export interface AuthResponse {
  access_token: string
  refresh_token: string
}

export interface LoginRequest {
  phone_number: string
  password: string
}

export interface StatsResponse {
  total_users: number
  total_modules: number
  total_lessons: number
  total_packs: number
  total_words: number
  total_grammar_questions: number
  total_translations: number
  active_users_last_7_days: number
}

export interface User {
  id: number
  telegram_id: number
  phone_number: string
  first_name: string
  last_name: string
  avatar_url: string
  created_at: string
  updated_at: string
}

export interface Module {
  id: number
  title: string
  order: number
  lessons?: Lesson[]
  created_at: string
  updated_at: string
}

export interface Lesson {
  id: number
  title: string
  description: string
  module_id: number
  order: number
  packs?: Pack[]
  created_at: string
  updated_at: string
}

export interface Pack {
  id: number
  title: string
  lesson_id: number
  type: string
  word_count: number
  created_at: string
  updated_at: string
}

export interface Word {
  id: number
  pack_id: number
  audio_url: string
  ru_text: string
  uz_text: string
  created_at: string
  updated_at: string
}

export interface Grammar {
  id: number
  pack_id: number
  type: 'fill' | 'build'
  question_text?: string
  options?: string[]
  correct_option?: number
  sentence?: string
  created_at: string
  updated_at: string
}

export interface GrammarTopic {
  id: number
  pack_id: number
  video_url: string
  markdown_text: string
  created_at: string
  updated_at: string
}

export interface Subscription {
  id: number
  user_id: number
  start_date: string
  end_date: string
  amount: number
  currency: string
  is_active: boolean
  created_by_admin_id: number
  notes: string
  created_at: string
  updated_at: string
}

export interface SubscriptionStats {
  total_revenue: number
  monthly_revenue: number
  yearly_revenue: number
  active_subscriptions: number
  total_paid_subscriptions: number
  average_subscription_value: number
  revenue_by_month: Array<{
    month: string
    revenue: number
    count: number
  }>
}

export interface BusinessConfig {
  id: number
  telegram_url: string
  instagram_url: string
  website_url: string
  support_email: string
  required_app_version: string
  company_name: string
  created_at: string
  updated_at: string
}

export const authApi = {
  login: (data: LoginRequest) => api.post<AuthResponse>('/api/admin/login', data),
}

export const adminApi = {
  getStats: () => api.get<StatsResponse>('/api/admin/stats'),
  getUsers: () => api.get<{ users: User[] }>('/api/admin/users'),
}

export const educationApi = {
  // Modules
  getModules: () => api.get<Module[]>('/api/education/modules'),
  getModuleWithLessons: (moduleId: number) => api.get<Module>(`/api/education/modules/${moduleId}`),
  createModule: (data: { title: string; order: number }) =>
    api.post<Module>('/api/education/modules', data),
  updateModule: (id: number, data: { title?: string; order?: number }) =>
    api.put<Module>(`/api/education/modules/${id}`, data),
  deleteModule: (id: number) => api.delete(`/api/education/modules/${id}`),

  // Lessons
  getLessonWithPacks: (lessonId: number) => api.get<Lesson>(`/api/education/lessons/${lessonId}`),
  createLesson: (data: { title: string; description: string; module_id: number; order: number }) =>
    api.post<Lesson>('/api/education/lessons', data),
  updateLesson: (id: number, data: { title?: string; description?: string }) =>
    api.put<Lesson>(`/api/education/lessons/${id}`, data),
  deleteLesson: (id: number) => api.delete(`/api/education/lessons/${id}`),

  // Packs
  getPack: (packId: number) => api.get<Pack>(`/api/education/packs/${packId}`),
  createPack: (data: { title: string; lesson_id: number; type: string; word_count: number }) =>
    api.post<Pack>('/api/education/packs', data),
  updatePack: (id: number, data: { title?: string; type?: string; word_count?: number }) =>
    api.put<Pack>(`/api/education/packs/${id}`, data),
  deletePack: (id: number) => api.delete(`/api/education/packs/${id}`),
}

export const quizApi = {
  // Words
  getWordsByPack: (packId: number) => api.get<Word[]>(`/api/quiz/words?pack_id=${packId}`),
  createWord: (data: { pack_id: number; ru_text: string; uz_text: string }) =>
    api.post<Word>('/api/quiz/words', data),
  updateWord: (id: number, data: { ru_text?: string; uz_text?: string }) =>
    api.put<Word>(`/api/quiz/words/${id}`, data),
  uploadWordAudio: (wordId: number, audioFile: File) => {
    const formData = new FormData()
    formData.append('audio', audioFile)
    return api.post<Word>(`/api/quiz/words/${wordId}/audio`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
  },
  deleteWord: (id: number) => api.delete(`/api/quiz/words/${id}`),

  // Grammar
  getGrammarByPack: (packId: number) => api.get<Grammar[]>(`/api/quiz/grammars?pack_id=${packId}`),
  createGrammar: (data: any) => api.post<Grammar>('/api/quiz/grammars', data),
  updateGrammar: (id: number, data: any) => api.put<Grammar>(`/api/quiz/grammars/${id}`, data),
  deleteGrammar: (id: number) => api.delete(`/api/quiz/grammars/${id}`),
}

export const grammarTopicsApi = {
  getAll: () => api.get<GrammarTopic[]>('/api/grammar/topics'),
  getByPack: (packId: number) => api.get<GrammarTopic>(`/api/grammar/topics?pack_id=${packId}`),
  create: (data: { pack_id: number; video_url: string; markdown_text: string }) =>
    api.post<GrammarTopic>('/api/grammar/topics', data),
  update: (id: number, data: { video_url?: string; markdown_text?: string }) =>
    api.put<GrammarTopic>(`/api/grammar/topics/${id}`, data),
  delete: (id: number) => api.delete(`/api/grammar/topics/${id}`),
}

export const subscriptionApi = {
  createPayment: (data: {
    user_id: number
    start_date: string
    end_date: string
    amount: number
    currency: string
    notes: string
  }) => api.post<Subscription>('/api/subscription/admin/payment', data),
  
  getPayments: (params?: {
    skip?: number
    limit?: number
    user_id?: number
    active_only?: boolean
  }) => api.get<Subscription[]>('/api/subscription/admin/payment', { params }),
  
  updatePayment: (id: number, data: { start_date?: string; end_date?: string; notes?: string; amount?: number }) =>
    api.put<Subscription>(`/api/subscription/admin/payment/${id}`, data),
  
  deletePayment: (id: number) => api.delete(`/api/subscription/admin/payment/${id}`),
  
  getStats: () => api.get<SubscriptionStats>('/api/subscription/admin/payment/stats'),
  
  getBusiness: () => api.get<BusinessConfig>('/api/subscription/admin/business'),
  
  updateBusiness: (data: {
    telegram_url?: string
    instagram_url?: string
    website_url?: string
    support_email?: string
    required_app_version?: string
    company_name?: string
  }) => api.put<BusinessConfig>('/api/subscription/admin/business', data),
}

export default api