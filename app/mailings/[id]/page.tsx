import { createClient } from "@/lib/supabase/server"
import { notFound, redirect } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, MapPin, Users, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { GridSelector } from "@/components/grid-selector"
import { SiteHeader } from "@/components/site-header"

export default async function MailingDetailPage({ params }: { params: { id: string } }) {
  const supabase = await createClient()
  const { id } = await params

  // Check if user is logged in
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect(`/auth/login?redirect=/mailings/${id}`)
  }

  // Fetch mailing with ad spots
  const { data: mailing, error } = await supabase
    .from("mailings")
    .select(
      `
      *,
      ad_spots (
        *
      )
    `,
    )
    .eq("id", id)
    .single()

  if (error || !mailing) {
    notFound()
  }

  if (mailing.status !== "active") {
    redirect("/mailings")
  }

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader showAuthButtons={false} showDashboard={true} />

      <main className="container flex-1 py-12">
        <div className="mb-6">
          <Link href="/mailings">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Mailings
            </Button>
          </Link>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1fr,400px]">
          {/* Left Column - Grid Selector */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">{mailing.title}</CardTitle>
                <CardDescription>
                  Click on available spots to select them. This is the actual postcard that will be mailed to {mailing.estimated_recipients?.toLocaleString()} homes.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <GridSelector mailingId={mailing.id} adSpots={mailing.ad_spots || []} userId={user.id} zipCodes={mailing.zip_codes} />
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Mailing Info */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Mailing Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3">
                  <Calendar className="mt-0.5 h-5 w-5 text-emerald-600" />
                  <div>
                    <div className="text-sm font-medium">Mail Date</div>
                    <div className="text-sm text-muted-foreground">
                      {new Date(mailing.scheduled_mail_date).toLocaleDateString("en-US", {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <MapPin className="mt-0.5 h-5 w-5 text-emerald-600" />
                  <div>
                    <div className="text-sm font-medium">Target Zip Codes</div>
                    <div className="text-sm text-muted-foreground">{mailing.zip_codes?.join(", ")}</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Users className="mt-0.5 h-5 w-5 text-emerald-600" />
                  <div>
                    <div className="text-sm font-medium">Estimated Reach</div>
                    <div className="text-sm text-muted-foreground">
                      {mailing.estimated_recipients?.toLocaleString()} residential addresses
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Pricing</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-baseline justify-between">
                    <span className="text-sm text-muted-foreground">Single ad spot</span>
                    <span className="text-2xl font-bold">${mailing.price_per_spot}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Purchase multiple adjacent spots to create a larger advertisement.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>What's Included</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <Badge className="mt-0.5 h-5 w-5 shrink-0 rounded-full bg-emerald-100 p-0 text-emerald-700">
                      ✓
                    </Badge>
                    <span>Unique QR code for tracking</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Badge className="mt-0.5 h-5 w-5 shrink-0 rounded-full bg-emerald-100 p-0 text-emerald-700">
                      ✓
                    </Badge>
                    <span>Custom landing page for your offer</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Badge className="mt-0.5 h-5 w-5 shrink-0 rounded-full bg-emerald-100 p-0 text-emerald-700">
                      ✓
                    </Badge>
                    <span>Real-time analytics dashboard</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Badge className="mt-0.5 h-5 w-5 shrink-0 rounded-full bg-emerald-100 p-0 text-emerald-700">
                      ✓
                    </Badge>
                    <span>Professional ad design assistance</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
