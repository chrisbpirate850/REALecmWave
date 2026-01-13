import { createClient } from "@/lib/supabase/server"
import { Card, CardContent } from "@/components/ui/card"
import { Calendar } from "lucide-react"
import { SiteHeader } from "@/components/site-header"
import { PostcardPreviewCard } from "@/components/postcard-preview-card"

export default async function MailingsPage() {
  const supabase = await createClient()

  const { data: mailingsData } = await supabase
    .from("mailings")
    .select(`
      *,
      ad_spots (
        id,
        position,
        side,
        grid_position,
        status,
        price,
        ad_copy_url
      )
    `)
    .in("status", ["active", "completed"])
    .order("scheduled_mail_date", { ascending: true })

  const mailings = mailingsData || []

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />

      <main className="container flex-1 py-8 sm:py-12">
        <div className="mx-auto max-w-5xl">
          {/* Header */}
          <div className="mb-6 text-center sm:mb-8">
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Available Mailings
            </h1>
            <p className="mt-2 text-muted-foreground">
              Browse upcoming postcards and reserve your ad spot
            </p>
          </div>

          {/* Mailings Grid */}
          {!mailings || mailings.length === 0 ? (
            <Card>
              <CardContent className="flex min-h-[300px] flex-col items-center justify-center py-12 text-center">
                <Calendar className="mb-4 h-12 w-12 text-muted-foreground" />
                <h2 className="mb-2 text-xl font-semibold">No Mailings Available</h2>
                <p className="text-muted-foreground">
                  Check back soon for upcoming postcard mailings.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6 md:grid-cols-2">
              {mailings.map((mailing) => (
                <PostcardPreviewCard key={mailing.id} mailing={mailing} />
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t py-6">
        <div className="container text-center text-sm text-muted-foreground">
          <p>
            &copy; 2026 Emerald Coast Marketing Wave. Serving Niceville, Navarre, and Gulf Breeze.
          </p>
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
