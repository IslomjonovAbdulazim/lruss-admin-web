import { useEffect, useState, useMemo } from 'react'
import { ConfigDrawer } from '@/components/config-drawer'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
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
        toast.error(error.response?.data?.detail || 'Failed to fetch users')
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
          <ProfileDropdown />
        </div>
      </Header>

      <Main>
        <div className='mb-4'>
          <div className='flex flex-wrap items-center justify-between gap-4 mb-3'>
            <div>
              <h2 className='text-2xl font-bold tracking-tight flex items-center gap-2'>
                <UsersIcon className="h-6 w-6" />
                Users
              </h2>
              <p className='text-muted-foreground text-sm'>
                {filteredUsers.length} of {users.length} users
                {searchQuery && ` matching "${searchQuery}"`}
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
                {showPremiumOnly ? 'All Users' : 'Premium Only'}
              </Button>
            </div>
          </div>
          <div className='relative mb-2'>
            <SearchIcon className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground' />
            <Input
              placeholder='Search users by name or phone number...'
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
                Loading users...
              </div>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="w-12">Avatar</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead className="hidden md:table-cell">
                    <div className="flex items-center gap-1">
                      <Phone className="h-3 w-3" />
                      Phone
                    </div>
                  </TableHead>
                  <TableHead className="hidden lg:table-cell">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      Joined
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
                              <div className="font-medium">No users match your filters</div>
                              <div className="text-sm">Try adjusting your search or filters</div>
                            </>
                          ) : (
                            <>
                              <div className="font-medium">No users found</div>
                              <div className="text-sm">Users will appear here once they register</div>
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
                              {fullName || 'Unknown'}
                              {user.has_active_subscription && (
                                <Crown className="h-3 w-3 text-amber-500" />
                              )}
                            </div>
                            <div className="text-xs text-muted-foreground md:hidden">
                              {user.phone_number}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="py-2 hidden md:table-cell">
                          <span className="text-sm font-mono">{user.phone_number}</span>
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
                                  Until {subscriptionEndDate.toLocaleDateString('en-US', { 
                                    month: 'short', 
                                    day: 'numeric' 
                                  })}
                                </span>
                              )}
                            </div>
                          ) : (
                            <Badge variant="secondary" className="text-xs">
                              Free
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
