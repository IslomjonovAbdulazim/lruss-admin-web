import { useEffect, useState } from 'react'
import { ConfigDrawer } from '@/components/config-drawer'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { adminApi, type User } from '@/lib/api'
import { toast } from 'sonner'


export function Users() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchUsers() {
      try {
        const response = await adminApi.getUsers()
        setUsers(response.data.users)
      } catch (error: any) {
        toast.error(error.response?.data?.detail || 'Failed to fetch users')
      } finally {
        setLoading(false)
      }
    }
    fetchUsers()
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
        <div className='mb-2 flex flex-wrap items-center justify-between space-y-2'>
          <div>
            <h2 className='text-2xl font-bold tracking-tight'>User List</h2>
            <p className='text-muted-foreground'>
              Manage your users and their information here.
            </p>
          </div>
        </div>
        {loading ? (
          <div className="flex justify-center p-8">Loading users...</div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {users.map((user) => (
              <Card key={user.id}>
                <CardHeader>
                  <CardTitle className="flex justify-between items-center">
                    <span>{user.first_name} {user.last_name}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm"><strong>Phone:</strong> {user.phone_number}</p>
                  <p className="text-sm"><strong>Telegram ID:</strong> {user.telegram_id}</p>
                  {user.avatar_url && (
                    <img src={`${import.meta.env.VITE_API_BASE_URL}${user.avatar_url}`} alt="Avatar" className="w-12 h-12 rounded-full mt-2" />
                  )}
                  <p className="text-xs text-muted-foreground mt-2">
                    Created: {new Date(user.created_at).toLocaleDateString()}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </Main>
    </>
  )
}
