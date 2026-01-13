"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Download, Loader2, Image as ImageIcon, AlertCircle } from "lucide-react"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import JSZip from "jszip"

interface AdSpot {
  id: string
  position: number
  side: string
  grid_position: number
  status: string
  price: number
  advertiser_id: string | null
  ad_copy_url: string | null
  landing_page_slug: string | null
}

interface Mailing {
  id: string
  title: string
  zip_codes: string[]
  scheduled_mail_date: string
  price_per_spot: number
  estimated_recipients: number
  status: string
  ad_spots: AdSpot[]
}

export default function ExportMailingPage() {
  const params = useParams()
  const supabase = createClient()
  const [loading, setLoading] = useState(true)
  const [downloading, setDownloading] = useState(false)
  const [mailing, setMailing] = useState<Mailing | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchMailing()
  }, [params.id])

  const fetchMailing = async () => {
    setLoading(true)
    const { data, error } = await supabase
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
          advertiser_id,
          ad_copy_url,
          landing_page_slug
        )
      `)
      .eq("id", params.id)
      .single()

    if (error) {
      setError("Failed to load mailing")
      setLoading(false)
      return
    }

    setMailing(data)
    setLoading(false)
  }

  const handleDownloadAll = async () => {
    if (!mailing) return
    setDownloading(true)

    try {
      const zip = new JSZip()
      const spotsWithArtwork = mailing.ad_spots.filter(s => s.ad_copy_url)

      // Download each artwork file
      for (const spot of spotsWithArtwork) {
        if (!spot.ad_copy_url) continue

        try {
          const response = await fetch(spot.ad_copy_url)
          const blob = await response.blob()
          const extension = spot.ad_copy_url.split('.').pop()?.split('?')[0] || 'png'
          const filename = `spot_${spot.position}_${spot.side}_${spot.grid_position}.${extension}`
          zip.file(filename, blob)
        } catch (err) {
          console.error(`Failed to download artwork for spot ${spot.position}:`, err)
        }
      }

      // Create manifest file
      const manifest = generateManifest(mailing)
      zip.file("manifest.txt", manifest)

      // Generate and download ZIP
      const content = await zip.generateAsync({ type: "blob" })
      const url = URL.createObjectURL(content)
      const a = document.createElement("a")
      a.href = url
      a.download = `${mailing.title.replace(/\s+/g, "_")}_artwork.zip`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (err) {
      console.error("Failed to create ZIP:", err)
      setError("Failed to create ZIP file")
    } finally {
      setDownloading(false)
    }
  }

  const generateManifest = (mailing: Mailing): string => {
    const lines = [
      "PRINT MANIFEST",
      "==============",
      "",
      `Mailing: ${mailing.title}`,
      `Mail Date: ${new Date(mailing.scheduled_mail_date).toLocaleDateString()}`,
      `ZIP Codes: ${mailing.zip_codes?.join(", ")}`,
      `Estimated Recipients: ${mailing.estimated_recipients?.toLocaleString()}`,
      "",
      "SPOT DETAILS",
      "------------",
      "",
    ]

    const sortedSpots = [...mailing.ad_spots].sort((a, b) => a.position - b.position)

    for (const spot of sortedSpots) {
      lines.push(`Position ${spot.position} (${spot.side.toUpperCase()} - Grid ${spot.grid_position})`)
      lines.push(`  Status: ${spot.status.toUpperCase()}`)

      if (spot.profiles) {
        lines.push(`  Business: ${spot.profiles.business_name}`)
        lines.push(`  Email: ${spot.profiles.email}`)
        if (spot.profiles.phone) {
          lines.push(`  Phone: ${spot.profiles.phone}`)
        }
      }

      if (spot.ad_copy_url) {
        const extension = spot.ad_copy_url.split('.').pop()?.split('?')[0] || 'png'
        lines.push(`  Artwork: spot_${spot.position}_${spot.side}_${spot.grid_position}.${extension}`)
      } else {
        lines.push(`  Artwork: NOT UPLOADED`)
      }

      if (spot.landing_page_slug) {
        lines.push(`  QR Landing: /offers/${spot.landing_page_slug}`)
      }

      lines.push("")
    }

    lines.push("")
    lines.push(`Generated: ${new Date().toISOString()}`)

    return lines.join("\n")
  }

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!mailing) {
    return (
      <div className="p-8">
        <div className="text-center">
          <h2 className="text-xl font-semibold">Mailing not found</h2>
          <Link href="/admin/mailings">
            <Button className="mt-4">Back to Mailings</Button>
          </Link>
        </div>
      </div>
    )
  }

  const spotsWithArtwork = mailing.ad_spots.filter(s => s.ad_copy_url).length
  const spotsMissingArtwork = mailing.ad_spots.filter(
    s => (s.status === "purchased" || s.status === "uploaded") && !s.ad_copy_url
  ).length

  return (
    <div className="p-8">
      <div className="mb-6">
        <Link href={`/admin/mailings/${params.id}`}>
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Mailing
          </Button>
        </Link>
      </div>

      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{mailing.title}</h1>
          <p className="text-muted-foreground">Export artwork for print production</p>
        </div>
        <Button
          onClick={handleDownloadAll}
          disabled={downloading || spotsWithArtwork === 0}
          className="gap-2"
        >
          {downloading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Download className="h-4 w-4" />
          )}
          Download All Artwork ({spotsWithArtwork} files)
        </Button>
      </div>

      {error && (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-600">
          {error}
        </div>
      )}

      {spotsMissingArtwork > 0 && (
        <div className="mb-6 flex items-start gap-3 rounded-lg border border-yellow-200 bg-yellow-50 p-4">
          <AlertCircle className="h-5 w-5 text-yellow-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-yellow-800">Missing Artwork</p>
            <p className="text-sm text-yellow-700">
              {spotsMissingArtwork} purchased spot(s) are missing artwork uploads.
              Contact advertisers to complete their submissions.
            </p>
          </div>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Front Side */}
        <Card>
          <CardHeader>
            <CardTitle>Front Side</CardTitle>
            <CardDescription>6 ad spots (2 rows × 3 columns)</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-3">
              {mailing.ad_spots
                .filter(s => s.side === "front")
                .sort((a, b) => a.grid_position - b.grid_position)
                .map((spot) => (
                  <SpotPreview key={spot.id} spot={spot} />
                ))}
            </div>
          </CardContent>
        </Card>

        {/* Back Side */}
        <Card>
          <CardHeader>
            <CardTitle>Back Side</CardTitle>
            <CardDescription>6 ad spots (2 rows × 3 columns)</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-3">
              {mailing.ad_spots
                .filter(s => s.side === "back")
                .sort((a, b) => a.grid_position - b.grid_position)
                .map((spot) => (
                  <SpotPreview key={spot.id} spot={spot} />
                ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Spot List */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Spot Details</CardTitle>
          <CardDescription>Complete information for each ad spot</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {mailing.ad_spots
              .sort((a, b) => a.position - b.position)
              .map((spot) => (
                <div
                  key={spot.id}
                  className="flex items-start justify-between rounded-lg border p-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">
                        Position {spot.position} ({spot.side.toUpperCase()} - Grid {spot.grid_position})
                      </span>
                      <StatusBadge status={spot.status} />
                    </div>
                    {spot.profiles && (
                      <p className="text-sm text-muted-foreground">
                        {spot.profiles.business_name} · {spot.profiles.email}
                      </p>
                    )}
                    {spot.landing_page_slug && (
                      <p className="text-xs text-muted-foreground">
                        QR: /offers/{spot.landing_page_slug}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {spot.ad_copy_url ? (
                      <a
                        href={spot.ad_copy_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-emerald-600 hover:underline"
                      >
                        View Artwork
                      </a>
                    ) : (
                      <span className="text-sm text-muted-foreground">No artwork</span>
                    )}
                  </div>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function SpotPreview({ spot }: { spot: AdSpot }) {
  return (
    <div className="relative aspect-[4/3] overflow-hidden rounded-lg border bg-muted">
      {spot.ad_copy_url ? (
        <img
          src={spot.ad_copy_url}
          alt={`Spot ${spot.position}`}
          className="h-full w-full object-cover"
        />
      ) : (
        <div className="flex h-full flex-col items-center justify-center text-muted-foreground">
          <ImageIcon className="h-8 w-8 mb-1" />
          <span className="text-xs">No artwork</span>
        </div>
      )}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-white">#{spot.grid_position}</span>
          <StatusBadge status={spot.status} small />
        </div>
      </div>
    </div>
  )
}

function StatusBadge({ status, small }: { status: string; small?: boolean }) {
  const colors: Record<string, string> = {
    available: "bg-gray-100 text-gray-700",
    reserved: "bg-yellow-100 text-yellow-700",
    purchased: "bg-emerald-100 text-emerald-700",
    uploaded: "bg-blue-100 text-blue-700",
  }

  return (
    <Badge
      className={`${colors[status] || colors.available} ${small ? "text-[10px] px-1.5 py-0" : ""}`}
    >
      {status}
    </Badge>
  )
}
