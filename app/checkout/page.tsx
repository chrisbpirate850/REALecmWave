"use client"

import type React from "react"

import { useSearchParams, useRouter } from "next/navigation"
import { useEffect, useState, Suspense, useCallback } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Loader2, CheckCircle2 } from "lucide-react"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { EmbeddedCheckout, EmbeddedCheckoutProvider } from "@stripe/react-stripe-js"
import { loadStripe } from "@stripe/stripe-js"
import { startCheckoutSession } from "@/app/actions/stripe"

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

function CheckoutContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [mailingData, setMailingData] = useState<any>(null)
  const [selectedSpots, setSelectedSpots] = useState<any[]>([])
  const [adCopyFile, setAdCopyFile] = useState<File | null>(null)
  const [adCopyPreview, setAdCopyPreview] = useState<string | null>(null)
  const [offerDetails, setOfferDetails] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [readyForCheckout, setReadyForCheckout] = useState(false)
  const [clientSecret, setClientSecret] = useState<string | null>(null)

  const mailingId = searchParams.get("mailingId")
  const spotIds = searchParams.get("spots")?.split(",") || []

  useEffect(() => {
    async function fetchData() {
      if (!mailingId || spotIds.length === 0) {
        router.push("/mailings")
        return
      }

      const supabase = createClient()

      const { data: mailing } = await supabase.from("mailings").select("*").eq("id", mailingId).single()

      const { data: spots } = await supabase.from("ad_spots").select("*").in("id", spotIds)

      setMailingData(mailing)
      setSelectedSpots(spots || [])
      setLoading(false)
    }

    fetchData()
  }, [mailingId, spotIds, router])

  const totalPrice = selectedSpots.reduce((sum, spot) => sum + Number.parseFloat(spot.price), 0)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setAdCopyFile(file)

      // Create preview URL for images
      if (file.type.startsWith("image/")) {
        const previewUrl = URL.createObjectURL(file)
        setAdCopyPreview(previewUrl)
      } else {
        setAdCopyPreview(null)
      }
    }
  }

  const handlePrepareCheckout = async () => {
    setError(null)
    setLoading(true)

    try {
      const supabase = createClient()

      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) {
        router.push("/auth/login")
        return
      }

      let adCopyUrl = ""

      if (adCopyFile) {
        console.log("[v0] Uploading ad copy file...")
        const arrayBuffer = await adCopyFile.arrayBuffer()
        const fileName = `${user.id}/${Date.now()}-${adCopyFile.name}`
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from("ad-copy")
          .upload(fileName, arrayBuffer, {
            contentType: adCopyFile.type,
            upsert: false,
          })

        if (uploadError) {
          throw new Error(`Failed to upload file: ${uploadError.message}`)
        }

        const {
          data: { publicUrl },
        } = supabase.storage.from("ad-copy").getPublicUrl(fileName)

        adCopyUrl = publicUrl
        console.log("[v0] File uploaded successfully:", adCopyUrl)
      }

      console.log("[v0] Creating checkout session...")
      const secret = await startCheckoutSession({
        spotIds: spotIds,
        mailingId: mailingId!,
        adCopyUrl,
        offerText: offerDetails,
        userId: user.id,
      })

      console.log("[v0] Checkout session created, client secret received")
      setClientSecret(secret)
      setLoading(false)
      setReadyForCheckout(true)
    } catch (err) {
      console.error("[v0] Checkout preparation error:", err)
      setError(err instanceof Error ? err.message : "An error occurred")
      setLoading(false)
    }
  }

  const fetchClientSecret = useCallback(() => {
    if (!clientSecret) {
      throw new Error("Client secret not available")
    }
    return Promise.resolve(clientSecret)
  }, [clientSecret])

  const handleComplete = useCallback(() => {
    console.log("[v0] Payment completed, redirecting to return page...")
    router.push(`/checkout/return?session_id=${clientSecret}`)
  }, [router, clientSecret])

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
      </div>
    )
  }

  if (!mailingData || selectedSpots.length === 0) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <p className="text-muted-foreground">Invalid checkout session</p>
            <Button className="mt-4" onClick={() => router.push("/mailings")}>
              Return to Mailings
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (readyForCheckout && clientSecret) {
    return (
      <div className="min-h-screen bg-background">
        <EmbeddedCheckoutProvider
          stripe={stripePromise}
          options={{
            fetchClientSecret,
            onComplete: handleComplete,
          }}
        >
          <EmbeddedCheckout />
        </EmbeddedCheckoutProvider>
      </div>
    )
  }

  return (
    <div className="container max-w-4xl py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Complete Your Purchase</h1>
        <p className="text-muted-foreground">Review your order and provide ad details</p>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1fr,400px]">
        {/* Left Column - Ad Details Form */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Ad Copy Upload</CardTitle>
              <CardDescription>Upload your ad design or provide details for us to create one for you</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="ad-copy">Upload Ad Design (Optional)</Label>
                <div className="mt-2">
                  <Input
                    id="ad-copy"
                    type="file"
                    accept="image/*,.pdf,.ai,.psd"
                    onChange={handleFileChange}
                    className="cursor-pointer"
                  />
                  {adCopyFile && (
                    <div className="mt-3 rounded-lg border bg-emerald-50 p-3">
                      <div className="flex items-start gap-3">
                        {adCopyPreview ? (
                          <img
                            src={adCopyPreview}
                            alt="Ad preview"
                            className="h-20 w-20 rounded-md border object-cover"
                          />
                        ) : (
                          <div className="flex h-20 w-20 items-center justify-center rounded-md border bg-muted">
                            <CheckCircle2 className="h-8 w-8 text-emerald-600" />
                          </div>
                        )}
                        <div className="flex-1">
                          <div className="flex items-center gap-2 text-sm font-medium text-emerald-700">
                            <CheckCircle2 className="h-4 w-4" />
                            File uploaded
                          </div>
                          <p className="mt-1 text-sm text-muted-foreground">{adCopyFile.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {(adCopyFile.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                <p className="mt-2 text-sm text-muted-foreground">
                  Accepted formats: JPG, PNG, PDF, AI, PSD. Maximum size: 10MB
                </p>
              </div>

              <div>
                <Label htmlFor="offer-details">Offer Details</Label>
                <Textarea
                  id="offer-details"
                  placeholder="Describe your business and the offer you want to promote..."
                  value={offerDetails}
                  onChange={(e) => setOfferDetails(e.target.value)}
                  rows={6}
                  className="mt-2"
                />
                <p className="mt-2 text-sm text-muted-foreground">
                  {adCopyFile
                    ? "Provide any additional context about your offer"
                    : "We'll use this to design your ad if you haven't uploaded one"}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>What Happens Next?</CardTitle>
            </CardHeader>
            <CardContent>
              <ol className="space-y-3 text-sm">
                <li className="flex gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                    1
                  </span>
                  <span>Complete payment to reserve your spot(s)</span>
                </li>
                <li className="flex gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                    2
                  </span>
                  <span>Receive your unique QR code and landing page URL</span>
                </li>
                <li className="flex gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                    3
                  </span>
                  <span>We'll finalize your ad design (if needed) and send for approval</span>
                </li>
                <li className="flex gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                    4
                  </span>
                  <span>Postcard is printed and mailed on the scheduled date</span>
                </li>
                <li className="flex gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                    5
                  </span>
                  <span>Track scans and engagement in your dashboard</span>
                </li>
              </ol>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Order Summary */}
        <div>
          <Card className="sticky top-6">
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="text-sm font-medium">Mailing</div>
                <div className="text-sm text-muted-foreground">{mailingData.title}</div>
              </div>

              <div>
                <div className="mb-2 text-sm font-medium">Selected Spots</div>
                <div className="space-y-1">
                  {selectedSpots.map((spot) => (
                    <div key={spot.id} className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">
                        {spot.side === "front" ? "Front" : "Back"} - Spot {spot.grid_position}
                      </span>
                      <span>${spot.price}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t pt-4">
                <div className="flex items-center justify-between">
                  <span className="font-medium">Total</span>
                  <span className="text-2xl font-bold">${totalPrice.toFixed(2)}</span>
                </div>
              </div>

              {error && <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">{error}</div>}

              <Button className="w-full" size="lg" onClick={handlePrepareCheckout}>
                Proceed to Payment
              </Button>

              <p className="text-center text-xs text-muted-foreground">Secure payment powered by Stripe</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default function CheckoutPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
        </div>
      }
    >
      <CheckoutContent />
    </Suspense>
  )
}
