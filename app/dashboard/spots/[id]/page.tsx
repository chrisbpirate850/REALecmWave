import { createClient } from "@/lib/supabase/server"
import { redirect, notFound } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, TrendingUp, Calendar, MapPin, QrCode } from "lucide-react"
import Link from "next/link"
import { AnalyticsChart } from "@/components/analytics-chart"
import { SiteHeader } from "@/components/site-header"

export default async function SpotAnalyticsPage({ params }: { params: { id: string } }) {
  const supabase = await createClient()
  const { id } = await params

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Fetch ad spot with all related data
  const { data: spot, error } = await supabase
    .from("ad_spots")
    .select(
      `
      *,
      mailings (
        id,
        title,
        scheduled_mail_date,
        status,
        zip_codes,
        estimated_recipients
      ),
      landing_pages (
        id,
        slug,
        headline,
        is_published
      ),
      analytics (
        id,
        scanned_at,
        user_agent,
        location
      )
    `,
    )
    .eq("id", id)
    .eq("advertiser_id", user.id)
    .single()

  if (error || !spot) {
    notFound()
  }

  const totalScans = spot.analytics?.length || 0

  // Group scans by date for chart
  const scansByDate = spot.analytics?.reduce(
    (acc, scan) => {
      const date = new Date(scan.scanned_at).toLocaleDateString("en-US")
      acc[date] = (acc[date] || 0) + 1
      return acc
    },
    {} as Record<string, number>,
  )

  const chartData = Object.entries(scansByDate || {})
    .map(([date, count]) => ({
      date,
      scans: count,
    }))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

  const mailingDate = new Date(spot.mailings?.scheduled_mail_date || "")
  const today = new Date()
  const daysActive = Math.max(0, Math.floor((today.getTime() - mailingDate.getTime()) / (1000 * 60 * 60 * 24)))
  const estimatedReach = spot.mailings?.estimated_recipients || 0
  const scanRate = estimatedReach > 0 ? ((totalScans / estimatedReach) * 100).toFixed(2) : "0.00"

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader showAuthButtons={false} showDashboard={true} />

      <main className="container flex-1 py-12">
        <div className="mb-6">
          <Link href="/dashboard">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Button>
          </Link>
        </div>

        <div className="mb-8 flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold">{spot.mailings?.title}</h1>
            <p className="text-muted-foreground">
              {spot.side === "front" ? "Front" : "Back"} Side - Position {spot.grid_position}
            </p>
          </div>
          <Badge
            className={
              spot.mailings?.status === "active" ? "bg-emerald-100 text-emerald-700" : "bg-blue-100 text-blue-700"
            }
          >
            {spot.mailings?.status}
          </Badge>
        </div>

        {/* Key Metrics */}
        <div className="mb-8 grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Scans</CardTitle>
              <QrCode className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalScans}</div>
              <p className="text-xs text-muted-foreground">QR code engagements</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Scan Rate</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{scanRate}%</div>
              <p className="text-xs text-muted-foreground">Of recipients engaged</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Days Active</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{daysActive}</div>
              <p className="text-xs text-muted-foreground">Since mail date</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Estimated Reach</CardTitle>
              <MapPin className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{estimatedReach.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">Homes reached</p>
            </CardContent>
          </Card>
        </div>

        {/* Analytics Chart */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Scan Activity Over Time</CardTitle>
            <CardDescription>Daily QR code scans for your advertisement</CardDescription>
          </CardHeader>
          <CardContent>
            {chartData.length > 0 ? (
              <AnalyticsChart data={chartData} />
            ) : (
              <div className="flex min-h-[300px] items-center justify-center text-muted-foreground">
                No scan data available yet
              </div>
            )}
          </CardContent>
        </Card>

        {/* Campaign Details */}
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Campaign Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <div className="text-sm font-medium">Mail Date</div>
                <div className="text-sm text-muted-foreground">
                  {mailingDate.toLocaleDateString("en-US", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </div>
              </div>
              <div>
                <div className="text-sm font-medium">Target Areas</div>
                <div className="text-sm text-muted-foreground">{spot.mailings?.zip_codes?.join(", ")}</div>
              </div>
              <div>
                <div className="text-sm font-medium">Ad Position</div>
                <div className="text-sm text-muted-foreground">
                  {spot.side === "front" ? "Front" : "Back"} Side, Spot {spot.grid_position}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Landing Page</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {spot.landing_pages && spot.landing_pages.length > 0 ? (
                <>
                  <div>
                    <div className="text-sm font-medium">Status</div>
                    <Badge variant={spot.landing_pages[0].is_published ? "default" : "secondary"} className="mt-1">
                      {spot.landing_pages[0].is_published ? "Published" : "Draft"}
                    </Badge>
                  </div>
                  <div>
                    <div className="text-sm font-medium">URL</div>
                    <div className="text-sm text-muted-foreground break-all">/offers/{spot.landing_pages[0].slug}</div>
                  </div>
                  <Link href={`/offers/${spot.landing_pages[0].slug}`} target="_blank">
                    <Button variant="outline" className="w-full bg-transparent">
                      View Landing Page
                    </Button>
                  </Link>
                </>
              ) : (
                <p className="text-sm text-muted-foreground">Landing page being set up</p>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
