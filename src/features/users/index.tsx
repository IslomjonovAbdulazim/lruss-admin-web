import { useEffect, useState, useMemo } from 'react'
import { ConfigDrawer } from '@/components/config-drawer'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { Card } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { adminApi, subscriptionApi, type UserWithSubscription } from '@/lib/api'
import { toast } from 'sonner'
import { Users as UsersIcon, Phone, Calendar, Search as SearchIcon, X, Crown, Star } from 'lucide-react'

const TelegramIcon = ({ className = "h-4 w-4" }: { className?: string }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.13-.31-1.09-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24-.01.37z"/>
  </svg>
)


export function Users() {
  const [users, setUsers] = useState<UserWithSubscription[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [showPremiumOnly, setShowPremiumOnly] = useState(false)

  // Filtered users based on search query and filters
  const filteredUsers = useMemo(() => {
    let filtered = users
    
    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(user => {
        const fullName = `${user.first_name} ${user.last_name}`.toLowerCase()
        const phone = user.phone_number.toLowerCase()
        return fullName.includes(query) || phone.includes(query)
      })
    }
    
    // Apply premium users filter
    if (showPremiumOnly) {
      filtered = filtered.filter(user => user.has_active_subscription)
    }
    
    // Sort by creation date (newest first)
    return filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
  }, [users, searchQuery, showPremiumOnly])

  useEffect(() => {
    async function fetchUsersWithSubscriptions() {
      try {
        // Fetch all users
        const usersResponse = await adminApi.getUsers()
        const users = usersResponse.data.users
        
        // Fetch all active subscriptions
        const subscriptionsResponse = await subscriptionApi.getPayments({ active_only: true })
        const activeSubscriptions = subscriptionsResponse.data
        
        // Create a map of user_id -> subscription for quick lookup
        const subscriptionMap = new Map()
        activeSubscriptions.forEach(sub => {
          if (sub.is_active && new Date(sub.end_date) > new Date()) {
            subscriptionMap.set(sub.user_id, sub)
          }
        })
        
        // Combine user data with subscription status
        const usersWithSubscriptions: UserWithSubscription[] = users.map(user => ({
          ...user,
          has_active_subscription: subscriptionMap.has(user.id),
          subscription_end_date: subscriptionMap.get(user.id)?.end_date
        }))
        
        setUsers(usersWithSubscriptions)
      } catch (error: any) {
        toast.error(error.response?.data?.detail || 'Не удалось загрузить пользователей')
      } finally {
        setLoading(false)
      }
    }
    fetchUsersWithSubscriptions()
  }, [])

  return (
    <>
      <Header fixed>
        <Search />
        <div className='ms-auto flex items-center space-x-4'>
          <ThemeSwitch />
          <ConfigDrawer />
        </div>
      </Header>

      <Main>
        <div className='mb-4'>
          <div className='flex flex-wrap items-center justify-between gap-4 mb-3'>
            <div>
              <h2 className='text-2xl font-bold tracking-tight flex items-center gap-2'>
                <UsersIcon className="h-6 w-6" />
                Пользователи
              </h2>
              <p className='text-muted-foreground text-sm'>
                {filteredUsers.length} из {users.length} пользователей
                {searchQuery && ` соответствующих "${searchQuery}"`}
              </p>
            </div>
            <div className='flex items-center gap-2'>
              <Button
                variant={showPremiumOnly ? 'default' : 'outline'}
                size='sm'
                onClick={() => setShowPremiumOnly(!showPremiumOnly)}
                className='h-8'
              >
                <Crown className='h-3 w-3 mr-1' />
                {showPremiumOnly ? 'Все пользователи' : 'Только Premium'}
              </Button>
            </div>
          </div>
          <div className='relative mb-2'>
            <SearchIcon className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground' />
            <Input
              placeholder='Поиск пользователей по имени или номеру телефона...'
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className='pl-9 pr-10 h-9'
            />
            {searchQuery && (
              <Button
                variant='ghost'
                size='sm'
                onClick={() => setSearchQuery('')}
                className='absolute right-1 top-1/2 h-7 w-7 p-0 -translate-y-1/2'
              >
                <X className='h-3 w-3' />
              </Button>
            )}
          </div>
        </div>
        <Card>
          {loading ? (
            <div className="flex justify-center p-8">
              <div className="flex items-center gap-2 text-muted-foreground">
                <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
                Загрузка пользователей...
              </div>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="w-12">Аватар</TableHead>
                  <TableHead>Имя</TableHead>
                  <TableHead className="hidden md:table-cell">
                    <div className="flex items-center gap-1">
                      <Phone className="h-3 w-3" />
                      Телефон
                    </div>
                  </TableHead>
                  <TableHead className="hidden lg:table-cell">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      Присоединился
                    </div>
                  </TableHead>
                  <TableHead className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Crown className="h-3 w-3" />
                      Premium
                    </div>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      <div className="flex flex-col items-center gap-2">
                        <UsersIcon className="h-8 w-8 opacity-50" />
                        <div>
                          {searchQuery || showPremiumOnly ? (
                            <>
                              <div className="font-medium">Нет пользователей, соответствующих фильтрам</div>
                              <div className="text-sm">Попробуйте скорректировать поиск или фильтры</div>
                            </>
                          ) : (
                            <>
                              <div className="font-medium">Пользователи не найдены</div>
                              <div className="text-sm">Пользователи появятся здесь после регистрации</div>
                            </>
                          )}
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredUsers.map((user) => {
                    const fullName = `${user.first_name} ${user.last_name}`.trim()
                    const initials = (user.first_name?.[0] || '') + (user.last_name?.[0] || '')
                    const joinDate = new Date(user.created_at)
                    const subscriptionEndDate = user.subscription_end_date ? new Date(user.subscription_end_date) : null
                    const isExpiringSoon = subscriptionEndDate && (subscriptionEndDate.getTime() - Date.now()) < 7 * 24 * 60 * 60 * 1000 // 7 days
                    
                    return (
                      <TableRow key={user.id} className="hover:bg-muted/30">
                        <TableCell className="py-2">
                          <Avatar className="h-8 w-8">
                            <AvatarImage 
                              src={user.avatar_url ? `${import.meta.env.VITE_API_BASE_URL}${user.avatar_url}` : undefined} 
                              alt={fullName}
                            />
                            <AvatarFallback className="text-xs font-medium bg-primary/10 text-primary">
                              {initials || '?'}
                            </AvatarFallback>
                          </Avatar>
                        </TableCell>
                        <TableCell className="py-2">
                          <div>
                            <div className="font-medium text-sm flex items-center gap-2">
                              {fullName || 'Неизвестно'}
                              {user.has_active_subscription && (
                                <Crown className="h-3 w-3 text-amber-500" />
                              )}
                            </div>
                            <div className="text-xs text-muted-foreground md:hidden flex items-center gap-1">
                              <span>{user.phone_number}</span>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-4 w-4 p-0 hover:bg-blue-100 hover:text-blue-600"
                                onClick={() => window.open(`https://t.me/${user.phone_number}`, '_blank')}
                                title="Открыть в Telegram"
                              >
                                <TelegramIcon className="h-2.5 w-2.5" />
                              </Button>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="py-2 hidden md:table-cell">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-mono">{user.phone_number}</span>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0 hover:bg-blue-100 hover:text-blue-600"
                              onClick={() => window.open(`https://t.me/${user.phone_number}`, '_blank')}
                              title="Открыть в Telegram"
                            >
                              <TelegramIcon className="h-3 w-3" />
                            </Button>
                          </div>
                        </TableCell>
                        <TableCell className="py-2 hidden lg:table-cell">
                          <div className="text-xs text-muted-foreground">
                            <div>{joinDate.toLocaleDateString('en-US', { 
                              month: 'short', 
                              day: 'numeric', 
                              year: 'numeric' 
                            })}</div>
                            <div>{joinDate.toLocaleTimeString('en-US', { 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })}</div>
                          </div>
                        </TableCell>
                        <TableCell className="py-2 text-right">
                          {user.has_active_subscription ? (
                            <div className="flex flex-col items-end gap-1">
                              <Badge variant="default" className="text-xs bg-amber-500 hover:bg-amber-600">
                                <Star className="h-3 w-3 mr-1" />
                                Premium
                              </Badge>
                              {subscriptionEndDate && (
                                <span className={`text-xs ${
                                  isExpiringSoon ? 'text-amber-600 font-medium' : 'text-muted-foreground'
                                }`}>
                                  До {subscriptionEndDate.toLocaleDateString('ru-RU', { 
                                    month: 'short', 
                                    day: 'numeric' 
                                  })}
                                </span>
                              )}
                            </div>
                          ) : (
                            <Badge variant="secondary" className="text-xs">
                              Бесплатно
                            </Badge>
                          )}
                        </TableCell>
                      </TableRow>
                    )
                  })
                )}
              </TableBody>
            </Table>
          )}
        </Card>
      </Main>
    </>
  )
}
