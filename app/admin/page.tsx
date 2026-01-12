import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  DollarSign,
  Mail,
  Grid3X3,
  TrendingUp,
  QrCode,
  Users,
  CheckCircle,
  FileText,
} from "lucide-react"
import Link from "next/link"

export default async function AdminDashboardPage() {
  const supabase = await createClient()

  // Fetch all stats in parallel
  const [
    { data: payments },
    { data: mailings },
    { data: adSpots },
    { data: analytics },
    { data: users },
  ] = await Promise.all([
    supabase.from("payments").select("amount, status, created_at"),
    supabase.from("mailings").select("id, title, status, scheduled_mail_date"),
    supabase.from("ad_spots").select("id, status, mailing_id, advertiser_id, purchased_at"),
    supabase.from("analytics").select("id, scanned_at, event_type"),
    supabase.from("profiles").select("id, email, business_name, created_at"),
  ])

  // Calculate stats
  const totalRevenue = payments
    ?.filter(p => p.status === "completed")
    .reduce((sum, p) => sum + Number(p.amount), 0) || 0

  const activeMailings = mailings?.filter(m => m.status === "active").length || 0
  const totalMailings = mailings?.length || 0

  const spotsSold = adSpots?.filter(s => s.status === "purchased" || s.status === "uploaded").length || 0
  const spotsAvailable = adSpots?.filter(s => s.status === "available").length || 0
  const totalSpots = adSpots?.length || 0

  const totalScans = analytics?.filter(a => !a.event_type || a.event_type === "scan").length || 0
  const totalConversions = analytics?.filter(a => a.event_type === "conversion").length || 0

  const totalUsers = users?.length || 0

  // Recent activity (last 5 items)
  const recentPurchases = adSpots
    ?.filter(s => s.purchased_at)
    .sort((a, b) => new Date(b.purchased_at!).getTime() - new Date(a.purchased_at!).getTime())
    .slice(0, 5) || []

  const recentScans = analytics
    ?.sort((a, b) => new Date(b.scanned_at).getTime() - new Date(a.scanned_at).getTime())
    .slice(0, 5) || []

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <p className="text-muted-foreground">Overview of your platform performance</p>
      </div>

      {/* Key Metrics */}
      <div className="mb-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600">
              ${totalRevenue.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">From completed payments</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Mailings</CardTitle>
            <Mail className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeMailings}</div>
            <p className="text-xs text-muted-foreground">
              {totalMailings} total mailings
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Spots Sold</CardTitle>
            <Grid3X3 className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {spotsSold} / {totalSpots}
            </div>
            <p className="text-xs text-muted-foreground">
              {spotsAvailable} available
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Registered Users</CardTitle>
            <Users className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalUsers}</div>
            <p className="text-xs text-muted-foreground">Business accounts</p>
          </CardContent>
        </Card>
      </div>

      {/* Secondary Metrics */}
      <div className="mb-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">QR Scans</CardTitle>
            <QrCode className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalScans}</div>
            <p className="text-xs text-muted-foreground">Total landing page views</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conversions</CardTitle>
            <CheckCircle className="h-4 w-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600">{totalConversions}</div>
            <p className="text-xs text-muted-foreground">Offers redeemed</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {totalScans > 0 ? ((totalConversions / totalScans) * 100).toFixed(1) : 0}%
            </div>
            <p className="text-xs text-muted-foreground">Scans to redemptions</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Revenue/Mailing</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${totalMailings > 0 ? (totalRevenue / totalMailings).toFixed(0) : 0}
            </div>
            <p className="text-xs text-muted-foreground">Per mailing campaign</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Purchases */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Recent Purchases
            </CardTitle>
            <CardDescription>Latest ad spot sales</CardDescription>
          </CardHeader>
          <CardContent>
            {recentPurchases.length === 0 ? (
              <p className="text-sm text-muted-foreground">No purchases yet</p>
            ) : (
              <div className="space-y-3">
                {recentPurchases.map((spot) => (
                  <div
                    key={spot.id}
                    className="flex items-center justify-between rounded-lg border p-3"
                  >
                    <div>
                      <p className="text-sm font-medium">Spot purchased</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(spot.purchased_at!).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          hour: "numeric",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                    <Badge variant="secondary">$675</Badge>
                  </div>
                ))}
              </div>
            )}
            <Link
              href="/admin/payments"
              className="mt-4 block text-sm text-emerald-600 hover:underline"
            >
              View all payments →
            </Link>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <QrCode className="h-5 w-5" />
              Recent QR Activity
            </CardTitle>
            <CardDescription>Latest scans and conversions</CardDescription>
          </CardHeader>
          <CardContent>
            {recentScans.length === 0 ? (
              <p className="text-sm text-muted-foreground">No scans yet</p>
            ) : (
              <div className="space-y-3">
                {recentScans.map((scan) => (
                  <div
                    key={scan.id}
                    className="flex items-center justify-between rounded-lg border p-3"
                  >
                    <div>
                      <p className="text-sm font-medium">
                        {scan.event_type === "conversion" ? "Offer Redeemed" : "QR Scan"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(scan.scanned_at).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          hour: "numeric",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                    <Badge
                      variant={scan.event_type === "conversion" ? "default" : "secondary"}
                      className={scan.event_type === "conversion" ? "bg-emerald-600" : ""}
                    >
                      {scan.event_type === "conversion" ? "Conversion" : "Scan"}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
            <Link
              href="/admin/spots"
              className="mt-4 block text-sm text-emerald-600 hover:underline"
            >
              View all spots →
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/admin/mailings/new"
              className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700"
            >
              <Mail className="h-4 w-4" />
              Create Mailing
            </Link>
            <Link
              href="/admin/blog/new"
              className="inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium hover:bg-muted"
            >
              <FileText className="h-4 w-4" />
              New Blog Post
            </Link>
            <Link
              href="/admin/payments"
              className="inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium hover:bg-muted"
            >
              <DollarSign className="h-4 w-4" />
              Export Payments
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
