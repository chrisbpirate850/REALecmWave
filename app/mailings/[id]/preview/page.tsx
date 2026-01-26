import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, MapPin, Users, ArrowLeft, Share2, RotateCw } from "lucide-react"
import Link from "next/link"
import { SiteHeader } from "@/components/site-header"
import { PostcardPreviewFlip } from "@/components/postcard-preview-flip"

export default async function PostcardPreviewPage({ params }: { params: { id: string } }) {
  const supabase = await createClient()
  const { id } = await params

  // Fetch mailing with ad spots
  const { data: mailing, error } = await supabase
    .from("mailings")
    .select(
      `
      *,
      ad_spots (
        id,
        position,
        side,
        grid_position,
        status,
        price,
        advertiser_id,
        ad_copy_url
      )
    `
    )
    .eq("id", id)
    .single()

  if (error || !mailing) {
    notFound()
  }

  const adSpots = (mailing.ad_spots || []) as Array<{ status: string }>
  const availableSpots = adSpots.filter((s) => s.status === "available").length
  const soldSpots = 12 - availableSpots

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      <SiteHeader />

      <main className="container flex-1 py-8">
        <div className="mb-6">
          <Link href="/mailings">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Mailings
            </Button>
          </Link>
        </div>

        <div className="mx-auto max-w-5xl">
          {/* Header */}
          <div className="mb-8 text-center">
            <Badge className="mb-4 bg-emerald-100 text-emerald-700">Postcard Preview</Badge>
            <h1 className="text-3xl font-bold tracking-tight">{mailing.title}</h1>
            <p className="mt-2 text-lg text-muted-foreground">
              See the actual postcard design for this mailing
            </p>
          </div>

          {/* Stats */}
          <div className="mb-8 grid gap-4 sm:grid-cols-4">
            <Card>
              <CardContent className="pt-6 text-center">
                <div className="text-3xl font-bold text-emerald-600">{soldSpots}</div>
                <div className="text-sm text-muted-foreground">Spots Claimed</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 text-center">
                <div className="text-3xl font-bold text-emerald-600">{availableSpots}</div>
                <div className="text-sm text-muted-foreground">Spots Left</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 text-center">
                <div className="text-3xl font-bold text-emerald-600">
                  {mailing.estimated_recipients?.toLocaleString()}
                </div>
                <div className="text-sm text-muted-foreground">Homes Reached</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 text-center">
                <div className="text-3xl font-bold text-emerald-600">
                  {new Date(mailing.scheduled_mail_date).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  })}
                </div>
                <div className="text-sm text-muted-foreground">Mail Date</div>
              </CardContent>
            </Card>
          </div>

          {/* Postcard Preview with Flip */}
          <PostcardPreviewFlip mailing={mailing} />

          {/* CTA */}
          {availableSpots > 0 && (
            <div className="mt-8 rounded-xl bg-emerald-50 p-8 text-center">
              <h2 className="text-2xl font-bold text-emerald-900">
                {availableSpots === 1 ? "Only 1 Spot Left!" : `Only ${availableSpots} Spots Left!`}
              </h2>
              <p className="mt-2 text-emerald-700">
                Join these local businesses and reach {mailing.estimated_recipients?.toLocaleString()} homes in{" "}
                {mailing.zip_codes?.join(", ")}.
              </p>
              <div className="mt-6 flex flex-wrap items-center justify-center gap-4">
                <Link href={`/mailings/${id}`}>
                  <Button size="lg">Claim Your Category — ${mailing.price_per_spot}</Button>
                </Link>
              </div>
            </div>
          )}

          {/* Mailing Details */}
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>Mailing Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 sm:grid-cols-3">
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
                    <div className="text-sm font-medium">Target Areas</div>
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
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="container text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} Emerald Coast Marketing Wave. Serving Niceville, Navarre, and Gulf Breeze.</p>
          <p className="mt-2">
            A project by{" "}
            <a
              href="https://christopherjbradley.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-emerald-600 hover:text-emerald-500 hover:underline"
            >
              Christopher J. Bradley
            </a>
          </p>
        </div>
      </footer>
    </div>
  )
}
