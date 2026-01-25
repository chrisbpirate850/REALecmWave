"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar, MapPin, Users, RotateCw } from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"

type AdSpot = {
  id: string
  position: number
  side: string
  grid_position: number
  status: string
  price: number
  ad_copy_url: string | null
}

type Mailing = {
  id: string
  title: string
  status: string
  scheduled_mail_date: string
  zip_codes: string[]
  estimated_recipients: number
  price_per_spot: number
  ad_spots: AdSpot[]
}

// Map zip codes to SVG file pairs (front, back)
const ZIP_CODE_TO_SVG: Record<string, { front: string; back: string; name: string }> = {
  "32536": {
    front: "/9x12postcard/Crestview Side A.svg",
    back: "/9x12postcard/Crestview Side B.svg",
    name: "Crestview"
  },
  "32566": {
    front: "/9x12postcard/Navarre Side A.svg",
    back: "/9x12postcard/Navarre Side B.svg",
    name: "Navarre"
  },
  "32578": {
    front: "/9x12postcard/Niceville Side A.svg",
    back: "/9x12postcard/Niceville Side B.svg",
    name: "Niceville"
  },
  "32561": {
    front: "/9x12postcard/Gulf Breeze Side A.svg",
    back: "/9x12postcard/Gulf Breeze Side B.svg",
    name: "Gulf Breeze"
  },
}

// Default to Gulf Breeze (smallest file size)
const DEFAULT_SVG = {
  front: "/9x12postcard/Gulf Breeze Side A.svg",
  back: "/9x12postcard/Gulf Breeze Side B.svg",
  name: "Gulf Breeze"
}

function getPostcardSvgs(zipCodes: string[] | undefined) {
  if (!zipCodes || zipCodes.length === 0) return DEFAULT_SVG
  const primaryZip = zipCodes[0]
  return ZIP_CODE_TO_SVG[primaryZip] || DEFAULT_SVG
}

export function PostcardPreviewCard({ mailing }: { mailing: Mailing }) {
  const [showBack, setShowBack] = useState(false)

  const availableSpots =
    mailing.ad_spots?.filter((spot) => spot.status === "available").length || 0
  const totalSpots = 12
  const soldSpots = totalSpots - availableSpots

  const statusColor =
    mailing.status === "active"
      ? "bg-emerald-100 text-emerald-700"
      : mailing.status === "completed"
        ? "bg-gray-100 text-gray-700"
        : "bg-yellow-100 text-yellow-700"

  const postcardSvgs = getPostcardSvgs(mailing.zip_codes)

  // Get ad spots for the current side
  const currentSide = showBack ? "back" : "front"
  const currentSpots = (mailing.ad_spots || [])
    .filter((spot) => spot.side === currentSide)
    .sort((a, b) => a.grid_position - b.grid_position)

  return (
    <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
      {/* Postcard Visual */}
      <div className="relative bg-gradient-to-br from-gray-50 to-gray-100 p-4 sm:p-6">
        {/* Flip Button */}
        <button
          onClick={() => setShowBack(!showBack)}
          className="absolute right-2 top-2 z-20 flex items-center gap-1 rounded-full bg-white/90 px-2 py-1 text-xs font-medium text-gray-600 shadow-sm transition-all hover:bg-white hover:shadow-md sm:right-4 sm:top-4 sm:px-3 sm:py-1.5 sm:text-sm"
        >
          <RotateCw className={cn("h-3 w-3 sm:h-4 sm:w-4 transition-transform", showBack && "rotate-180")} />
          <span className="hidden sm:inline">Flip to {showBack ? "Front" : "Back"}</span>
          <span className="sm:hidden">{showBack ? "Front" : "Back"}</span>
        </button>

        {/* Status Badge */}
        <Badge className={cn("absolute left-2 top-2 z-20 sm:left-4 sm:top-4", statusColor)}>
          {mailing.status}
        </Badge>

        {/* Postcard SVG with Ad Overlays */}
        <div className="relative mx-auto mt-8 max-w-md overflow-hidden rounded-lg border-2 border-slate-200 shadow-lg">
          <img
            src={showBack ? postcardSvgs.back : postcardSvgs.front}
            alt={`${mailing.title} - ${showBack ? "Back" : "Front"}`}
            className="h-auto w-full"
          />

          {/* Ad Spots Overlay Grid */}
          <div
            className="absolute flex flex-col"
            style={{
              left: '2.5%',
              top: '3.3%',
              width: '95%',
              height: '93.4%',
            }}
          >
            {/* Top row of 3 ads */}
            <div className="flex justify-between" style={{ height: '45.2%' }}>
              {currentSpots.slice(0, 3).map((spot) => (
                <CardAdSpotOverlay key={spot.id} spot={spot} />
              ))}
            </div>

            {/* Gap for indicia bar */}
            <div style={{ height: '9.6%' }} />

            {/* Bottom row of 3 ads */}
            <div className="flex justify-between" style={{ height: '45.2%' }}>
              {currentSpots.slice(3, 6).map((spot) => (
                <CardAdSpotOverlay key={spot.id} spot={spot} />
              ))}
            </div>
          </div>
        </div>

        {/* Size indicator */}
        <div className="mt-2 text-center text-xs text-muted-foreground">
          12" × 9" Postcard — {showBack ? "Back" : "Front"} Side
        </div>
      </div>

      {/* Info Bar */}
      <div className="border-t bg-card p-4">
        {/* Title and Progress */}
        <div className="mb-3 flex flex-wrap items-start justify-between gap-2">
          <h3 className="text-lg font-bold sm:text-xl">{mailing.title}</h3>
          <div className="text-right">
            <div className="text-lg font-bold text-emerald-600 sm:text-xl">
              ${mailing.price_per_spot}
            </div>
            <div className="text-xs text-muted-foreground">per spot</div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-3 rounded-lg bg-muted/50 p-2 sm:p-3">
          <div className="mb-1 flex items-center justify-between text-xs sm:text-sm">
            <span className="font-medium">
              {availableSpots === 0
                ? "Sold Out!"
                : `${availableSpots} spot${availableSpots === 1 ? "" : "s"} available`}
            </span>
            <span className="font-bold text-emerald-600">
              {soldSpots}/{totalSpots} claimed
            </span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-muted sm:h-2">
            <div
              className="h-full bg-emerald-600 transition-all"
              style={{ width: `${(soldSpots / totalSpots) * 100}%` }}
            />
          </div>
        </div>

        {/* Details Grid */}
        <div className="mb-4 grid grid-cols-3 gap-2 text-xs sm:text-sm">
          <div className="flex items-center gap-1 text-muted-foreground">
            <Calendar className="h-3 w-3 shrink-0 sm:h-4 sm:w-4" />
            <span className="truncate">
              {new Date(mailing.scheduled_mail_date).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
              })}
            </span>
          </div>
          <div className="flex items-center gap-1 text-muted-foreground">
            <MapPin className="h-3 w-3 shrink-0 sm:h-4 sm:w-4" />
            <span className="truncate">{mailing.zip_codes?.slice(0, 2).join(", ")}</span>
          </div>
          <div className="flex items-center gap-1 text-muted-foreground">
            <Users className="h-3 w-3 shrink-0 sm:h-4 sm:w-4" />
            <span className="truncate">
              {(mailing.estimated_recipients / 1000).toFixed(1)}k homes
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <Link href={`/mailings/${mailing.id}/preview`} className="flex-1">
            <Button variant="outline" className="w-full" size="sm">
              Full Preview
            </Button>
          </Link>
          <Link href={`/mailings/${mailing.id}`} className="flex-1">
            <Button
              className="w-full"
              size="sm"
              disabled={availableSpots === 0 || mailing.status === "completed"}
            >
              {availableSpots === 0 ? "Sold Out" : "Claim Category"}
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}

// Component to render individual ad spot overlay for the card view
function CardAdSpotOverlay({ spot }: { spot: AdSpot }) {
  const isPurchased = spot.status === "purchased" || spot.status === "uploaded" || spot.status === "reserved"
  const hasAdCopy = spot.ad_copy_url && spot.ad_copy_url.length > 0

  // Only show overlay if the spot has an uploaded ad
  if (!isPurchased || !hasAdCopy) {
    return <div style={{ width: '32%' }} className="h-full" />
  }

  return (
    <div
      style={{ width: '32%' }}
      className="relative h-full overflow-hidden rounded"
    >
      <img
        src={spot.ad_copy_url!}
        alt={`Ad in position ${spot.grid_position}`}
        className="h-full w-full object-cover"
      />
    </div>
  )
}
