import { createAdminClient } from "@/lib/supabase/admin"
import { notFound } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Mail, MapPin, Phone } from "lucide-react"
import { ClaimOfferButton } from "@/components/claim-offer-button"
import type { Metadata } from "next"

type Props = {
  params: { slug: string }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  // Use admin client for public access - bypasses RLS
  const supabase = createAdminClient()
  const { slug } = await params

  const { data: landingPage } = await supabase
    .from("landing_pages")
    .select(
      `
      *,
      ad_spots (
        mailings (
          title
        )
      )
    `,
    )
    .eq("slug", slug)
    .single()

  if (!landingPage) {
    return {
      title: "Offer Not Found",
    }
  }

  return {
    title: landingPage.headline || "Special Offer",
    description: landingPage.offer_description || "Exclusive offer from a local business",
  }
}

export default async function OfferLandingPage({ params }: Props) {
  // Use admin client for public access - bypasses RLS for anonymous visitors
  const supabase = createAdminClient()
  const { slug } = await params

  // Fetch landing page with related data
  const { data: landingPage, error } = await supabase
    .from("landing_pages")
    .select(
      `
      *,
      ad_spots (
        id,
        advertiser_id,
        ad_copy_url,
        mailings (
          title,
          zip_codes
        )
      )
    `,
    )
    .eq("slug", slug)
    .eq("is_published", true)
    .single()

  if (error) {
    console.error("[v0] Error fetching landing page for slug:", slug, error)
    notFound()
  }

  if (!landingPage) {
    console.error("[v0] No landing page found for slug:", slug)
    notFound()
  }

  // Get advertiser profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", landingPage.ad_spots?.advertiser_id)
    .single()

  // Track the visit (analytics)
  const adSpotId = landingPage.ad_spots?.id
  const advertiserId = landingPage.ad_spots?.advertiser_id

  if (adSpotId && advertiserId) {
    // Record analytics in the background (no await to not block page render)
    supabase
      .from("analytics")
      .insert({
        ad_spot_id: adSpotId,
        advertiser_id: advertiserId,
        scanned_at: new Date().toISOString(),
      })
      .then(() => {
        // Silent success
      })
      .catch((err) => {
        console.error("[v0] Analytics tracking error:", err)
      })
  }

  const headline = landingPage.headline || "Exclusive Local Offer"
  const offerDescription = landingPage.offer_description || "Check out this special offer from a local business."
  const ctaText = landingPage.cta_text || "Claim Offer"
  const ctaUrl = landingPage.cta_url
  const adCopyUrl = landingPage.ad_spots?.ad_copy_url

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-emerald-50 to-background">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center">
          <div className="flex items-center gap-2">
            <Mail className="h-6 w-6 text-emerald-600" />
            <span className="text-xl font-bold">Emerald Coast Marketing Wave</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container flex-1 py-12">
        <div className="mx-auto max-w-3xl">
          {/* Featured Badge */}
          <div className="mb-6 text-center">
            <Badge className="bg-emerald-100 text-emerald-700">Featured Local Offer</Badge>
          </div>

          {/* Main Card */}
          <Card className="overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-emerald-600 to-emerald-500 text-white">
              <CardTitle className="text-center text-3xl">{headline}</CardTitle>
              {profile?.business_name && (
                <CardDescription className="text-center text-lg text-emerald-50">
                  {profile.business_name}
                </CardDescription>
              )}
            </CardHeader>
            <CardContent className="p-8">
              <div className="space-y-6">
                {/* Ad Copy Image */}
                {adCopyUrl && (
                  <div className="overflow-hidden rounded-lg border-2 border-emerald-100 shadow-md">
                    <img
                      src={adCopyUrl}
                      alt={`${profile?.business_name || 'Business'} Advertisement`}
                      className="h-auto w-full"
                    />
                  </div>
                )}

                {/* Offer Description */}
                <div>
                  <p className="text-lg leading-relaxed text-foreground">{offerDescription}</p>
                </div>

                {/* Business Info */}
                {(profile?.phone || profile?.email) && (
                  <div className="rounded-lg border bg-muted/50 p-4">
                    <h3 className="mb-3 font-semibold">Contact Information</h3>
                    <div className="space-y-2">
                      {profile.phone && (
                        <div className="flex items-center gap-2 text-sm">
                          <Phone className="h-4 w-4 text-emerald-600" />
                          <a href={`tel:${profile.phone}`} className="hover:underline">
                            {profile.phone}
                          </a>
                        </div>
                      )}
                      {profile.email && (
                        <div className="flex items-center gap-2 text-sm">
                          <Mail className="h-4 w-4 text-emerald-600" />
                          <a href={`mailto:${profile.email}`} className="hover:underline">
                            {profile.email}
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Service Area */}
                {landingPage.ad_spots?.mailings?.zip_codes && (
                  <div className="rounded-lg border bg-muted/50 p-4">
                    <div className="flex items-start gap-2">
                      <MapPin className="mt-0.5 h-4 w-4 text-emerald-600" />
                      <div>
                        <div className="text-sm font-medium">Serving the Emerald Coast</div>
                        <div className="text-sm text-muted-foreground">
                          Zip codes: {landingPage.ad_spots.mailings.zip_codes.join(", ")}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Claim Offer Button */}
                <ClaimOfferButton
                  landingPageId={landingPage.id}
                  adSpotId={landingPage.ad_spots?.id || ""}
                  advertiserId={landingPage.ad_spots?.advertiser_id || ""}
                  businessName={profile?.business_name}
                  ctaText={ctaText}
                />

                {/* Trust Indicators */}
                <div className="border-t pt-6 text-center">
                  <p className="text-sm text-muted-foreground">
                    This offer is brought to you by a trusted local business serving the Emerald Coast community.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* About Section */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="text-center text-xl">About This Offer</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-center text-sm text-muted-foreground">
                You received this offer via a 9x12 postcard mailing to{" "}
                {landingPage.ad_spots?.mailings?.zip_codes?.join(", ")} through Emerald Coast Marketing Wave. This offer
                is exclusive to residents who received the postcard.
              </p>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="container text-center text-sm text-muted-foreground">
          <p>Powered by Emerald Coast Marketing Wave</p>
          <p className="mt-1">Connecting local businesses with the Emerald Coast community</p>
        </div>
      </footer>
    </div>
  )
}
