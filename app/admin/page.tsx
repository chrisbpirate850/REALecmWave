import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Mail, Plus, Users, TrendingUp, DollarSign } from "lucide-react"
import Link from "next/link"

export default async function AdminDashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Check if user is admin
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  if (!profile?.is_admin) {
    redirect("/dashboard")
  }

  // Fetch admin stats
  const { data: mailings } = await supabase
    .from("mailings")
    .select(
      `
      *,
      ad_spots (
        id,
        status,
        price
      )
    `,
    )
    .order("scheduled_mail_date", { ascending: false })

  const totalMailings = mailings?.length || 0
  const totalRevenue =
    mailings?.reduce((sum, mailing) => {
      const mailingRevenue = mailing.ad_spots
        ?.filter((spot) => spot.status === "purchased" || spot.status === "uploaded")
        .reduce((spotSum, spot) => spotSum + Number.parseFloat(spot.price), 0)
      return sum + (mailingRevenue || 0)
    }, 0) || 0

  const totalSpotsSold =
    mailings?.reduce(
      (sum, mailing) =>
        sum +
        (mailing.ad_spots?.filter((spot) => spot.status === "purchased" || spot.status === "uploaded").length || 0),
      0,
    ) || 0

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Mail className="h-6 w-6 text-emerald-600" />
            <span className="text-xl font-bold">Emerald Coast Marketing Wave</span>
          </Link>
          <nav className="flex items-center gap-4">
            <Badge className="bg-purple-100 text-purple-700">Admin</Badge>
          </nav>
        </div>
      </header>

      <main className="container flex-1 py-12">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Admin Dashboard</h1>
            <p className="text-muted-foreground">Manage mailings and view platform analytics</p>
          </div>
          <Link href="/admin/mailings/new">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create Mailing
            </Button>
          </Link>
        </div>

        {/* Admin Stats */}
        <div className="mb-8 grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Mailings</CardTitle>
              <Mail className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalMailings}</div>
              <p className="text-xs text-muted-foreground">All time</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Spots Sold</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalSpotsSold}</div>
              <p className="text-xs text-muted-foreground">Purchased ad spots</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${totalRevenue.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">All time</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg per Mailing</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${totalMailings > 0 ? (totalRevenue / totalMailings).toFixed(2) : "0.00"}
              </div>
              <p className="text-xs text-muted-foreground">Revenue per campaign</p>
            </CardContent>
          </Card>
        </div>

        {/* Mailings List */}
        <Card>
          <CardHeader>
            <CardTitle>All Mailings</CardTitle>
            <CardDescription>Manage your postcard campaigns</CardDescription>
          </CardHeader>
          <CardContent>
            {!mailings || mailings.length === 0 ? (
              <div className="flex min-h-[200px] flex-col items-center justify-center text-center">
                <Mail className="mb-4 h-12 w-12 text-muted-foreground" />
                <h3 className="mb-2 text-lg font-semibold">No Mailings Yet</h3>
                <p className="mb-4 text-sm text-muted-foreground">Create your first mailing campaign to get started</p>
                <Link href="/admin/mailings/new">
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Create Mailing
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {mailings.map((mailing) => {
                  const availableSpots = mailing.ad_spots?.filter((spot) => spot.status === "available").length || 0
                  const soldSpots =
                    mailing.ad_spots?.filter((spot) => spot.status === "purchased" || spot.status === "uploaded")
                      .length || 0
                  const totalSpots = 12

                  const statusColor =
                    mailing.status === "active"
                      ? "bg-emerald-100 text-emerald-700"
                      : mailing.status === "completed"
                        ? "bg-blue-100 text-blue-700"
                        : mailing.status === "draft"
                          ? "bg-gray-100 text-gray-700"
                          : "bg-red-100 text-red-700"

                  return (
                    <div key={mailing.id} className="flex items-center justify-between rounded-lg border p-4">
                      <div className="flex-1">
                        <div className="mb-1 flex items-center gap-2">
                          <h3 className="font-semibold">{mailing.title}</h3>
                          <Badge className={statusColor}>{mailing.status}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Mail Date: {new Date(mailing.scheduled_mail_date).toLocaleDateString()} • Spots Sold:{" "}
                          {soldSpots}/{totalSpots}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Link href={`/admin/mailings/${mailing.id}`}>
                          <Button variant="outline" size="sm">
                            Manage
                          </Button>
                        </Link>
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
