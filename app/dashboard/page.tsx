import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Mail, QrCode, TrendingUp, Calendar, ExternalLink, Gift } from "lucide-react"
import Link from "next/link"
import { SiteHeader } from "@/components/site-header"

export default async function DashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Fetch user profile
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  // Fetch user's ad spots with mailing and analytics data
  const { data: adSpots } = await supabase
    .from("ad_spots")
    .select(
      `
      *,
      mailings (
        id,
        title,
        scheduled_mail_date,
        status
      ),
      landing_pages (
        id,
        slug,
        is_published
      ),
      analytics (
        id,
        scanned_at,
        event_type
      )
    `,
    )
    .eq("advertiser_id", user.id)
    .order("created_at", { ascending: false })

  const totalSpots = adSpots?.length || 0

  // Calculate scans (event_type = 'scan' or null for backwards compatibility)
  const totalScans = adSpots?.reduce((sum, spot) => {
    const scans = spot.analytics?.filter((a: { event_type?: string }) =>
      !a.event_type || a.event_type === 'scan'
    ).length || 0
    return sum + scans
  }, 0) || 0

  // Calculate conversions (event_type = 'conversion')
  const totalConversions = adSpots?.reduce((sum, spot) => {
    const conversions = spot.analytics?.filter((a: { event_type?: string }) =>
      a.event_type === 'conversion'
    ).length || 0
    return sum + conversions
  }, 0) || 0

  const activeMailings = adSpots?.filter((spot) => spot.mailings?.status === "active").length || 0

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader showAuthButtons={false} showDashboard={true} />

      <main className="container flex-1 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Welcome back, {profile?.business_name || "Advertiser"}</h1>
          <p className="text-muted-foreground">Track your campaigns and view analytics</p>
        </div>

        {/* Stats Cards */}
        <div className="mb-8 grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Ad Spots</CardTitle>
              <Mail className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalSpots}</div>
              <p className="text-xs text-muted-foreground">Across all mailings</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">QR Scans</CardTitle>
              <QrCode className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalScans}</div>
              <p className="text-xs text-muted-foreground">Landing page views</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Conversions</CardTitle>
              <Gift className="h-4 w-4 text-emerald-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-emerald-600">{totalConversions}</div>
              <p className="text-xs text-muted-foreground">Offers redeemed</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Campaigns</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{activeMailings}</div>
              <p className="text-xs text-muted-foreground">Currently running</p>
            </CardContent>
          </Card>
        </div>

        {/* Ad Spots List */}
        <Card>
          <CardHeader>
            <CardTitle>Your Ad Spots</CardTitle>
            <CardDescription>Manage your advertisements and view performance</CardDescription>
          </CardHeader>
          <CardContent>
            {!adSpots || adSpots.length === 0 ? (
              <div className="flex min-h-[200px] flex-col items-center justify-center text-center">
                <Mail className="mb-4 h-12 w-12 text-muted-foreground" />
                <h3 className="mb-2 text-lg font-semibold">No Ad Spots Yet</h3>
                <p className="mb-4 text-sm text-muted-foreground">
                  Browse available mailings to reserve your first ad spot
                </p>
                <Link href="/mailings">
                  <Button>Browse Mailings</Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {adSpots.map((spot) => {
                  const scans = spot.analytics?.filter((a: { event_type?: string }) =>
                    !a.event_type || a.event_type === 'scan'
                  ).length || 0
                  const conversions = spot.analytics?.filter((a: { event_type?: string }) =>
                    a.event_type === 'conversion'
                  ).length || 0
                  const mailingStatus = spot.mailings?.status || "unknown"
                  const statusColor =
                    mailingStatus === "active"
                      ? "bg-emerald-100 text-emerald-700"
                      : mailingStatus === "completed"
                        ? "bg-blue-100 text-blue-700"
                        : "bg-gray-100 text-gray-700"

                  return (
                    <div key={spot.id} className="rounded-lg border p-4">
                      <div className="mb-3 flex items-start justify-between">
                        <div>
                          <h3 className="font-semibold">{spot.mailings?.title}</h3>
                          <p className="text-sm text-muted-foreground">
                            {spot.side === "front" ? "Front" : "Back"} Side - Position {spot.grid_position}
                          </p>
                        </div>
                        <Badge className={statusColor}>{mailingStatus}</Badge>
                      </div>

                      <div className="mb-3 flex items-center gap-4 text-sm">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span>
                            {new Date(spot.mailings?.scheduled_mail_date || "").toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <QrCode className="h-4 w-4 text-muted-foreground" />
                          <span>{scans} scans</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Gift className="h-4 w-4 text-emerald-600" />
                          <span className="text-emerald-600 font-medium">{conversions} redeemed</span>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        {spot.landing_pages && spot.landing_pages.length > 0 && (
                          <Link href={`/dashboard/spots/${spot.id}`}>
                            <Button variant="outline" size="sm">
                              View Analytics
                            </Button>
                          </Link>
                        )}
                        {spot.landing_pages && spot.landing_pages.length > 0 && (
                          <Link href={`/offers/${spot.landing_pages[0].slug}`} target="_blank">
                            <Button variant="outline" size="sm">
                              <ExternalLink className="mr-1 h-3 w-3" />
                              View Landing Page
                            </Button>
                          </Link>
                        )}
                        {spot.qr_code_data && (
                          <Link href={`/dashboard/qr/${spot.id}`}>
                            <Button variant="outline" size="sm">
                              Download QR Code
                            </Button>
                          </Link>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
