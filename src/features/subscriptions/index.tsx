import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { cn } from '@/lib/utils'
import { ConfigDrawer } from '@/components/config-drawer'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { subscriptionApi, adminApi, type Subscription, type SubscriptionStats, type User } from '@/lib/api'
import { toast } from 'sonner'
import { Plus, Edit, Trash2, Check, ChevronsUpDown, Eye } from 'lucide-react'

export function Subscriptions() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([])
  const [stats, setStats] = useState<SubscriptionStats | null>(null)
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [newSubscription, setNewSubscription] = useState({
    user_id: 0,
    start_date: '',
    end_date: '',
    amount: 0,
    currency: 'UZS',
    notes: ''
  })
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [userSearchOpen, setUserSearchOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [selectedSubscription, setSelectedSubscription] = useState<Subscription | null>(null)
  const [editSubscription, setEditSubscription] = useState({
    start_date: '',
    end_date: '',
    notes: '',
    amount: 0
  })
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [subscriptionToDelete, setSubscriptionToDelete] = useState<Subscription | null>(null)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [subscriptionsRes, statsRes, usersRes] = await Promise.all([
        subscriptionApi.getPayments(),
        subscriptionApi.getStats(),
        adminApi.getUsers()
      ])
      setSubscriptions(subscriptionsRes.data)
      setStats(statsRes.data)
      setUsers(usersRes.data.users)
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Failed to fetch data')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateSubscription = async () => {
    if (!selectedUser || !newSubscription.start_date || !newSubscription.end_date) {
      toast.error('Please select a user and fill all required fields')
      return
    }
    
    try {
      setLoading(true)
      const response = await subscriptionApi.createPayment({
        ...newSubscription,
        user_id: selectedUser.id,
        currency: 'UZS',
        start_date: newSubscription.start_date + 'T00:00:00Z',
        end_date: newSubscription.end_date + 'T00:00:00Z'
      })
      setSubscriptions(prev => [...prev, response.data])
      setNewSubscription({
        user_id: 0,
        start_date: '',
        end_date: '',
        amount: 0,
        currency: 'UZS',
        notes: ''
      })
      setSelectedUser(null)
      setIsDialogOpen(false)
      toast.success('Subscription created successfully')
      fetchData() // Refresh stats
    } catch (error: any) {
      console.error('Subscription creation error:', error)
      const errorMessage = error.response?.data?.detail || error.message || 'Failed to create subscription'
      toast.error(typeof errorMessage === 'string' ? errorMessage : 'Failed to create subscription')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteSubscription = async () => {
    if (!subscriptionToDelete) return
    
    try {
      setLoading(true)
      await subscriptionApi.deletePayment(subscriptionToDelete.id)
      setSubscriptions(prev => prev.filter(s => s.id !== subscriptionToDelete.id))
      setDeleteDialogOpen(false)
      setSubscriptionToDelete(null)
      toast.success('Subscription deleted successfully')
      fetchData() // Refresh stats
    } catch (error: any) {
      console.error('Subscription delete error:', error)
      const errorMessage = error.response?.data?.detail || error.message || 'Failed to delete subscription'
      toast.error(typeof errorMessage === 'string' ? errorMessage : 'Failed to delete subscription')
    } finally {
      setLoading(false)
    }
  }

  const handleEditSubscription = async () => {
    if (!selectedSubscription || !editSubscription.start_date || !editSubscription.end_date || !editSubscription.amount) {
      toast.error('Please fill required fields')
      return
    }
    
    try {
      setLoading(true)
      const response = await subscriptionApi.updatePayment(selectedSubscription.id, {
        start_date: editSubscription.start_date + 'T00:00:00Z',
        end_date: editSubscription.end_date + 'T00:00:00Z',
        notes: editSubscription.notes,
        amount: editSubscription.amount
      })
      setSubscriptions(prev => prev.map(s => s.id === selectedSubscription.id ? response.data : s))
      setEditDialogOpen(false)
      toast.success('Subscription updated successfully')
      fetchData()
    } catch (error: any) {
      console.error('Subscription update error:', error)
      const errorMessage = error.response?.data?.detail || error.message || 'Failed to update subscription'
      toast.error(typeof errorMessage === 'string' ? errorMessage : 'Failed to update subscription')
    } finally {
      setLoading(false)
    }
  }

  const getUserById = (userId: number) => {
    return users.find(user => user.id === userId)
  }

  const filteredSubscriptions = subscriptions.filter(subscription => {
    const user = getUserById(subscription.user_id)
    const userName = user ? `${user.first_name} ${user.last_name}` : ''
    const searchLower = searchQuery.toLowerCase()
    
    return (
      userName.toLowerCase().includes(searchLower) ||
      subscription.amount.toString().includes(searchLower) ||
      subscription.notes.toLowerCase().includes(searchLower)
    )
  })

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
        <div className='mb-2 flex items-center justify-between space-y-2'>
          <h1 className='text-2xl font-bold tracking-tight'>Subscription Management</h1>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Subscription
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Create New Subscription</DialogTitle>
              </DialogHeader>
              <div className="space-y-3">
                <div>
                  <Label htmlFor="user_search">Select User</Label>
                    <Popover open={userSearchOpen} onOpenChange={setUserSearchOpen}>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          role="combobox"
                          aria-expanded={userSearchOpen}
                          className="w-full justify-between h-8"
                        >
                          {selectedUser
                            ? `${selectedUser.first_name} ${selectedUser.last_name}`
                            : "Select user..."}
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-full p-0">
                        <Command>
                          <CommandInput placeholder="Search by name or phone..." />
                          <CommandList>
                            <CommandEmpty>No users found.</CommandEmpty>
                            <CommandGroup>
                              {users.map((user) => (
                                <CommandItem
                                  key={user.id}
                                  value={`${user.first_name} ${user.last_name} ${user.phone_number}`}
                                  onSelect={() => {
                                    setSelectedUser(user)
                                    setUserSearchOpen(false)
                                  }}
                                >
                                  <Check
                                    className={cn(
                                      "mr-2 h-3 w-3",
                                      selectedUser?.id === user.id ? "opacity-100" : "opacity-0"
                                    )}
                                  />
                                  <div className="text-sm">
                                    <div>{user.first_name} {user.last_name}</div>
                                    <div className="text-xs text-muted-foreground">{user.phone_number}</div>
                                  </div>
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                </div>
                <div>
                  <Label htmlFor="amount">Sum</Label>
                  <Input
                    id="amount"
                    type="number"
                    step="1"
                    value={newSubscription.amount}
                    onChange={(e) => setNewSubscription(prev => ({ ...prev, amount: parseFloat(e.target.value) }))}
                    placeholder="Enter sum"
                    className="h-8"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="start_date">Start Date</Label>
                    <Input
                      id="start_date"
                      type="date"
                      value={newSubscription.start_date}
                      onChange={(e) => setNewSubscription(prev => ({ ...prev, start_date: e.target.value }))}
                      className="h-8"
                    />
                  </div>
                  <div>
                    <Label htmlFor="end_date">End Date</Label>
                    <Input
                      id="end_date"
                      type="date"
                      value={newSubscription.end_date}
                      onChange={(e) => setNewSubscription(prev => ({ ...prev, end_date: e.target.value }))}
                      className="h-8"
                    />
                  </div>
                </div>
                <input type="hidden" value="UZS" />
                <div>
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    value={newSubscription.notes}
                    onChange={(e) => setNewSubscription(prev => ({ ...prev, notes: e.target.value }))}
                    placeholder="Optional notes"
                    className="min-h-[50px] resize-none"
                  />
                </div>
                <Button onClick={handleCreateSubscription} disabled={loading} className="w-full h-8">
                  {loading ? 'Creating...' : 'Create Subscription'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <Dialog open={detailsDialogOpen} onOpenChange={setDetailsDialogOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Subscription Details</DialogTitle>
            </DialogHeader>
            {selectedSubscription && (() => {
              const startDate = new Date(selectedSubscription.start_date)
              const endDate = new Date(selectedSubscription.end_date)
              const durationDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
              
              return (
                <div className="space-y-4">
                  <div className="text-center">
                    <h3 className="text-lg font-semibold">{getUserById(selectedSubscription.user_id)?.first_name} {getUserById(selectedSubscription.user_id)?.last_name}</h3>
                    <p className="text-sm text-muted-foreground">{getUserById(selectedSubscription.user_id)?.phone_number}</p>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div className="p-3 bg-muted rounded">
                      <div className="text-lg font-bold">{selectedSubscription.amount.toLocaleString()}</div>
                      <div className="text-xs text-muted-foreground">UZS</div>
                    </div>
                    <div className="p-3 bg-muted rounded">
                      <div className="text-lg font-bold">{durationDays}</div>
                      <div className="text-xs text-muted-foreground">Days</div>
                    </div>
                    <div className="p-3 bg-muted rounded">
                      <div className={`text-lg font-bold ${selectedSubscription.is_active ? 'text-green-600' : 'text-red-600'}`}>
                        {selectedSubscription.is_active ? 'Active' : 'Inactive'}
                      </div>
                      <div className="text-xs text-muted-foreground">Status</div>
                    </div>
                  </div>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Start Date:</span>
                      <span>{startDate.toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">End Date:</span>
                      <span>{endDate.toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Created by Admin:</span>
                      <span>{selectedSubscription.created_by_admin_id}</span>
                    </div>
                  </div>
                  
                  {selectedSubscription.notes && (
                    <div>
                      <p className="text-sm font-medium mb-2">Notes:</p>
                      <div className="p-3 bg-muted rounded text-sm">
                        {selectedSubscription.notes}
                      </div>
                    </div>
                  )}
                  
                  <div className="pt-2 border-t text-xs text-muted-foreground space-y-1">
                    <div className="flex justify-between">
                      <span>Created:</span>
                      <span>{new Date(selectedSubscription.created_at).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Updated:</span>
                      <span>{new Date(selectedSubscription.updated_at).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              )
            })()}
          </DialogContent>
        </Dialog>

        <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Edit Subscription</DialogTitle>
            </DialogHeader>
            {selectedSubscription && (
              <div className="space-y-3">
                <div className="text-sm text-muted-foreground">
                  Editing subscription for: {getUserById(selectedSubscription.user_id)?.first_name} {getUserById(selectedSubscription.user_id)?.last_name}
                </div>
                <div>
                  <Label htmlFor="edit_amount">Sum</Label>
                  <Input
                    id="edit_amount"
                    type="number"
                    step="1"
                    value={editSubscription.amount}
                    onChange={(e) => setEditSubscription(prev => ({ ...prev, amount: parseFloat(e.target.value) }))}
                    placeholder="Enter sum"
                    className="h-8"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="edit_start_date">Start Date</Label>
                    <Input
                      id="edit_start_date"
                      type="date"
                      value={editSubscription.start_date}
                      onChange={(e) => setEditSubscription(prev => ({ ...prev, start_date: e.target.value }))}
                      className="h-8"
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit_end_date">End Date</Label>
                    <Input
                      id="edit_end_date"
                      type="date"
                      value={editSubscription.end_date}
                      onChange={(e) => setEditSubscription(prev => ({ ...prev, end_date: e.target.value }))}
                      className="h-8"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="edit_notes">Notes</Label>
                  <Textarea
                    id="edit_notes"
                    value={editSubscription.notes}
                    onChange={(e) => setEditSubscription(prev => ({ ...prev, notes: e.target.value }))}
                    placeholder="Optional notes"
                    className="min-h-[50px] resize-none"
                  />
                </div>
                <Button onClick={handleEditSubscription} disabled={loading} className="w-full h-8">
                  {loading ? 'Updating...' : 'Update Subscription'}
                </Button>
              </div>
            )}
          </DialogContent>
        </Dialog>

        <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Delete Subscription</DialogTitle>
            </DialogHeader>
            {subscriptionToDelete && (
              <div className="space-y-4">
                <div className="text-center">
                  <div className="text-sm text-muted-foreground mb-2">You are about to delete the subscription for:</div>
                  <div className="font-semibold">{getUserById(subscriptionToDelete.user_id)?.first_name} {getUserById(subscriptionToDelete.user_id)?.last_name}</div>
                  <div className="text-sm text-muted-foreground">{subscriptionToDelete.amount.toLocaleString()} UZS</div>
                </div>
                
                <div className="p-3 bg-red-50 border border-red-200 rounded text-sm text-red-700 text-center">
                  <strong>Warning:</strong> This action cannot be undone!
                </div>
                
                <div className="flex gap-3">
                  <Button 
                    variant="outline" 
                    onClick={() => setDeleteDialogOpen(false)}
                    className="flex-1 h-8"
                  >
                    Cancel
                  </Button>
                  <Button 
                    variant="destructive" 
                    onClick={handleDeleteSubscription}
                    disabled={loading}
                    className="flex-1 h-8"
                  >
                    {loading ? 'Deleting...' : 'Delete'}
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
        
        <Tabs defaultValue='subscriptions' className='space-y-4'>
          <TabsList>
            <TabsTrigger value='subscriptions'>Subscriptions</TabsTrigger>
            <TabsTrigger value='stats'>Statistics</TabsTrigger>
          </TabsList>
          
          <TabsContent value='subscriptions' className="space-y-4">
            <div className="mb-4">
              <Input
                placeholder="Search by user name, amount, or notes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="max-w-sm"
              />
            </div>
            {loading ? (
              <div className="flex justify-center p-8">Loading...</div>
            ) : (
              <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-3">
                {filteredSubscriptions.map((subscription) => (
                  <Card key={subscription.id} className="hover:shadow-sm transition-shadow">
                    <CardContent className="px-3 py-0">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2 text-sm">
                          <span className={`px-1.5 py-0.5 rounded text-xs font-medium ${subscription.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                            {subscription.is_active ? 'Active' : 'Inactive'}
                          </span>
                          <span className="font-medium">
                            {getUserById(subscription.user_id)?.first_name} {getUserById(subscription.user_id)?.last_name} - {subscription.amount.toLocaleString()} UZS
                          </span>
                        </div>
                        <div className="flex gap-1">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => {
                              setSelectedSubscription(subscription)
                              setDetailsDialogOpen(true)
                            }}
                            className="h-6 w-6 p-0"
                          >
                            <Eye className="h-3 w-3" />
                          </Button>
                          {subscription.is_active && (
                            <>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                onClick={() => {
                                  setSelectedSubscription(subscription)
                                  setEditSubscription({
                                    start_date: subscription.start_date.split('T')[0],
                                    end_date: subscription.end_date.split('T')[0],
                                    notes: subscription.notes,
                                    amount: subscription.amount
                                  })
                                  setEditDialogOpen(true)
                                }}
                                className="h-6 w-6 p-0"
                              >
                                <Edit className="h-3 w-3" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                onClick={() => {
                                  setSubscriptionToDelete(subscription)
                                  setDeleteDialogOpen(true)
                                }}
                                className="h-6 w-6 p-0"
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value='stats' className="space-y-4">
            {stats ? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.total_revenue.toLocaleString()} UZS</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.monthly_revenue.toLocaleString()} UZS</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm font-medium">Active Subscriptions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.active_subscriptions}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm font-medium">Average Value</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.average_subscription_value.toLocaleString()} UZS</div>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <div className="flex justify-center p-8">Loading stats...</div>
            )}
          </TabsContent>
        </Tabs>
      </Main>
    </>
  )
}