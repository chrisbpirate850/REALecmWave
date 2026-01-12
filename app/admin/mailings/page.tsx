import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plus, Mail, Calendar, MapPin, Users } from "lucide-react"
import Link from "next/link"

const STATUS_COLORS: Record<string, string> = {
  draft: "bg-gray-100 text-gray-700",
  active: "bg-emerald-100 text-emerald-700",
  printing: "bg-blue-100 text-blue-700",
  sent: "bg-purple-100 text-purple-700",
  completed: "bg-slate-100 text-slate-700",
  cancelled: "bg-red-100 text-red-700",
}

export default async function AdminMailingsPage() {
  const supabase = await createClient()

  const { data: mailings } = await supabase
    .from("mailings")
    .select(`
      *,
      ad_spots (
        id,
        status,
        advertiser_id
      )
    `)
    .order("scheduled_mail_date", { ascending: false })

  return (
    <div className="p-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Mailings</h1>
          <p className="text-muted-foreground">Manage your postcard campaigns</p>
        </div>
        <Link href="/admin/mailings/new">
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Create Mailing
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Mailings</CardTitle>
          <CardDescription>
            {mailings?.length || 0} total mailings
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!mailings || mailings.length === 0 ? (
            <div className="flex min-h-[200px] flex-col items-center justify-center text-center">
              <Mail className="mb-4 h-12 w-12 text-muted-foreground" />
              <h3 className="mb-2 text-lg font-semibold">No Mailings Yet</h3>
              <p className="mb-4 text-sm text-muted-foreground">
                Create your first mailing campaign to get started
              </p>
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
                const soldSpots = mailing.ad_spots?.filter(
                  (s: { status: string }) => s.status === "purchased" || s.status === "uploaded"
                ).length || 0
                const availableSpots = mailing.ad_spots?.filter(
                  (s: { status: string }) => s.status === "available"
                ).length || 0
                const totalSpots = mailing.ad_spots?.length || 12

                return (
                  <div
                    key={mailing.id}
                    className="flex items-center justify-between rounded-lg border p-4 hover:bg-muted/50"
                  >
                    <div className="flex-1">
                      <div className="mb-2 flex items-center gap-3">
                        <h3 className="font-semibold">{mailing.title}</h3>
                        <Badge className={STATUS_COLORS[mailing.status] || STATUS_COLORS.draft}>
                          {mailing.status}
                        </Badge>
                      </div>
                      <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {new Date(mailing.scheduled_mail_date).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          {mailing.zip_codes?.join(", ")}
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          {mailing.estimated_recipients?.toLocaleString()} homes
                        </span>
                        <span>
                          <strong className="text-foreground">{soldSpots}</strong>/{totalSpots} spots sold
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Link href={`/admin/mailings/${mailing.id}/export`}>
                        <Button variant="outline" size="sm">
                          Export
                        </Button>
                      </Link>
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
    </div>
  )
}
