"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Users,
  Loader2,
  Search,
  Shield,
  Mail,
  Calendar,
  Grid3X3,
  DollarSign,
  RefreshCw,
} from "lucide-react"
import { createClient } from "@/lib/supabase/client"

interface User {
  id: string
  email: string
  business_name: string | null
  phone: string | null
  website: string | null
  is_admin: boolean
  created_at: string
  ad_spots?: {
    id: string
    status: string
    mailings: {
      title: string
    }
  }[]
  payments?: {
    amount: number
    status: string
  }[]
}

export default function AdminUsersPage() {
  const supabase = createClient()
  const [loading, setLoading] = useState(true)
  const [users, setUsers] = useState<User[]>([])
  const [filteredUsers, setFilteredUsers] = useState<User[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [detailsOpen, setDetailsOpen] = useState(false)
  const [updatingAdmin, setUpdatingAdmin] = useState<string | null>(null)

  useEffect(() => {
    fetchUsers()
  }, [])

  useEffect(() => {
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      setFilteredUsers(
        users.filter(
          u =>
            u.email?.toLowerCase().includes(term) ||
            u.business_name?.toLowerCase().includes(term)
        )
      )
    } else {
      setFilteredUsers(users)
    }
  }, [users, searchTerm])

  const fetchUsers = async () => {
    setLoading(true)

    const { data, error } = await supabase
      .from("profiles")
      .select(`
        *,
        ad_spots (
          id,
          status,
          mailings (
            title
          )
        ),
        payments (
          amount,
          status
        )
      `)
      .order("created_at", { ascending: false })

    if (data) {
      setUsers(data)
    }

    setLoading(false)
  }

  const toggleAdmin = async (userId: string, currentValue: boolean) => {
    setUpdatingAdmin(userId)

    const { error } = await supabase
      .from("profiles")
      .update({ is_admin: !currentValue })
      .eq("id", userId)

    if (!error) {
      setUsers(prev =>
        prev.map(u =>
          u.id === userId ? { ...u, is_admin: !currentValue } : u
        )
      )
    }

    setUpdatingAdmin(null)
  }

  const openUserDetails = (user: User) => {
    setSelectedUser(user)
    setDetailsOpen(true)
  }

  const getUserStats = (user: User) => {
    const purchasedSpots = user.ad_spots?.filter(
      s => s.status === "purchased" || s.status === "uploaded"
    ).length || 0

    const totalSpent = user.payments
      ?.filter(p => p.status === "completed")
      .reduce((sum, p) => sum + Number(p.amount), 0) || 0

    return { purchasedSpots, totalSpent }
  }

  const adminCount = users.filter(u => u.is_admin).length
  const totalSpent = users.reduce((sum, u) => {
    return sum + (u.payments
      ?.filter(p => p.status === "completed")
      .reduce((s, p) => s + Number(p.amount), 0) || 0)
  }, 0)

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Users</h1>
        <p className="text-muted-foreground">Manage user accounts and admin access</p>
      </div>

      {/* Stats */}
      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{users.length}</div>
            <p className="text-xs text-muted-foreground">Registered accounts</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Admins</CardTitle>
            <Shield className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{adminCount}</div>
            <p className="text-xs text-muted-foreground">Users with admin access</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600">
              ${totalSpent.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">From all users</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Revenue/User</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${users.length > 0 ? (totalSpent / users.length).toFixed(0) : 0}
            </div>
            <p className="text-xs text-muted-foreground">Per registered user</p>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by email or business name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline" size="icon" onClick={fetchUsers}>
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Users List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            All Users
          </CardTitle>
          <CardDescription>
            Showing {filteredUsers.length} of {users.length} users
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredUsers.length === 0 ? (
            <div className="flex min-h-[200px] flex-col items-center justify-center text-center">
              <Users className="mb-4 h-12 w-12 text-muted-foreground" />
              <h3 className="mb-2 text-lg font-semibold">No Users Found</h3>
              <p className="text-sm text-muted-foreground">
                {searchTerm ? "Try adjusting your search" : "Users will appear here after sign up"}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredUsers.map((user) => {
                const stats = getUserStats(user)

                return (
                  <div
                    key={user.id}
                    className="flex items-center justify-between rounded-lg border p-4 hover:bg-muted/50"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted text-sm font-medium">
                        {user.business_name?.[0] || user.email?.[0]?.toUpperCase() || "?"}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">
                            {user.business_name || "No business name"}
                          </span>
                          {user.is_admin && (
                            <Badge className="bg-purple-100 text-purple-700">
                              <Shield className="mr-1 h-3 w-3" />
                              Admin
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                        <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Grid3X3 className="h-3 w-3" />
                            {stats.purchasedSpots} spots
                          </span>
                          <span className="flex items-center gap-1">
                            <DollarSign className="h-3 w-3" />
                            ${stats.totalSpent.toLocaleString()}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {new Date(user.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openUserDetails(user)}
                      >
                        View Details
                      </Button>

                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">Admin</span>
                        <Switch
                          checked={user.is_admin}
                          onCheckedChange={() => toggleAdmin(user.id, user.is_admin)}
                          disabled={updatingAdmin === user.id}
                        />
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* User Details Dialog */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>User Details</DialogTitle>
            <DialogDescription>
              {selectedUser?.business_name || selectedUser?.email}
            </DialogDescription>
          </DialogHeader>

          {selectedUser && (
            <div className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-xs text-muted-foreground">Email</p>
                  <p className="font-medium">{selectedUser.email}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Business Name</p>
                  <p className="font-medium">{selectedUser.business_name || "-"}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Phone</p>
                  <p className="font-medium">{selectedUser.phone || "-"}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Website</p>
                  <p className="font-medium">{selectedUser.website || "-"}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Joined</p>
                  <p className="font-medium">
                    {new Date(selectedUser.created_at).toLocaleDateString("en-US", {
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Role</p>
                  <p className="font-medium">
                    {selectedUser.is_admin ? "Administrator" : "Advertiser"}
                  </p>
                </div>
              </div>

              {/* Purchase History */}
              <div className="border-t pt-4">
                <h4 className="mb-3 font-medium">Purchase History</h4>
                {selectedUser.ad_spots && selectedUser.ad_spots.length > 0 ? (
                  <div className="space-y-2 max-h-[200px] overflow-y-auto">
                    {selectedUser.ad_spots
                      .filter(s => s.status === "purchased" || s.status === "uploaded")
                      .map((spot) => (
                        <div
                          key={spot.id}
                          className="flex items-center justify-between rounded border p-2 text-sm"
                        >
                          <span>{spot.mailings?.title || "Unknown Mailing"}</span>
                          <Badge variant="secondary" className="text-xs">
                            {spot.status}
                          </Badge>
                        </div>
                      ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No purchases yet</p>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between border-t pt-4">
                <a
                  href={`mailto:${selectedUser.email}`}
                  className="inline-flex items-center gap-2 text-sm text-emerald-600 hover:underline"
                >
                  <Mail className="h-4 w-4" />
                  Send Email
                </a>

                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Admin Access</span>
                  <Switch
                    checked={selectedUser.is_admin}
                    onCheckedChange={() => {
                      toggleAdmin(selectedUser.id, selectedUser.is_admin)
                      setSelectedUser(prev =>
                        prev ? { ...prev, is_admin: !prev.is_admin } : null
                      )
                    }}
                    disabled={updatingAdmin === selectedUser.id}
                  />
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
