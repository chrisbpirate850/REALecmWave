"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { RotateCw } from "lucide-react"
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
  category?: string
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

// Default to Gulf Breeze (smallest file size, loads fastest)
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

type LandingPostcardPreviewProps = {
  mailing?: Mailing | null
}

export function LandingPostcardPreview({ mailing }: LandingPostcardPreviewProps) {
  const [showBack, setShowBack] = useState(false)

  const availableSpots = mailing?.ad_spots?.filter((spot) => spot.status === "available").length || 12
  const totalSpots = 12
  const soldSpots = totalSpots - availableSpots

  const postcardSvgs = getPostcardSvgs(mailing?.zip_codes)

  // Get ad spots for the current side
  const currentSide = showBack ? "back" : "front"
  const currentSpots = (mailing?.ad_spots || [])
    .filter((spot) => spot.side === currentSide)
    .sort((a, b) => a.grid_position - b.grid_position)

  return (
    <div className="mx-auto max-w-4xl">
      {/* Flip Button */}
      <div className="mb-6 flex justify-center">
        <Button
          onClick={() => setShowBack(!showBack)}
          variant="outline"
          className="gap-2"
        >
          <RotateCw className={cn("h-4 w-4 transition-transform", showBack && "rotate-180")} />
          Flip to {showBack ? "Front" : "Back"}
        </Button>
      </div>

      {/* Postcard Container */}
      <div className="relative mx-auto">
        {/* Front/Back toggle display */}
        <div
          className={cn(
            "relative overflow-hidden rounded-xl border-4 border-slate-200 bg-white shadow-2xl transition-opacity duration-300",
          )}
        >
          <img
            src={showBack ? postcardSvgs.back : postcardSvgs.front}
            alt={`${postcardSvgs.name} Postcard - ${showBack ? "Back" : "Front"}`}
            className="h-auto w-full"
          />
          {/* Overlay badge for side indicator */}
          <Badge
            className="absolute left-4 top-4 z-20 bg-slate-800/90 text-xs uppercase text-white"
          >
            {showBack ? "Back" : "Front"} Side
          </Badge>

          {/* Ad Spots Overlay Grid */}
          {mailing && currentSpots.length > 0 && (
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
                  <LandingAdSpotOverlay key={spot.id} spot={spot} />
                ))}
              </div>

              {/* Gap for indicia bar */}
              <div style={{ height: '9.6%' }} />

              {/* Bottom row of 3 ads */}
              <div className="flex justify-between" style={{ height: '45.2%' }}>
                {currentSpots.slice(3, 6).map((spot) => (
                  <LandingAdSpotOverlay key={spot.id} spot={spot} />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Size indicator */}
      <div className="mt-4 text-center text-sm text-muted-foreground">
        12" × 9" Postcard — {postcardSvgs.name} — {showBack ? "Back" : "Front"} Side
      </div>

      {/* Progress indicator - only show if there's an active mailing */}
      {mailing && (
        <div className="mx-auto mt-6 max-w-md">
          <div className="mb-2 flex items-center justify-between text-sm">
            <span className="font-medium">
              {availableSpots === 0
                ? "Sold Out!"
                : `${availableSpots} spot${availableSpots === 1 ? "" : "s"} available`}
            </span>
            <span className="font-bold text-emerald-600">
              {soldSpots}/{totalSpots} claimed
            </span>
          </div>
          <div className="h-3 overflow-hidden rounded-full bg-slate-200">
            <div
              className="h-full bg-emerald-600 transition-all duration-500"
              style={{ width: `${(soldSpots / totalSpots) * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* CTA */}
      <div className="mt-8 text-center">
        <Link href={mailing ? `/mailings/${mailing.id}` : "/mailings"}>
          <Button size="lg" className="text-lg">
            {mailing
              ? `Claim Your Category — $${mailing.price_per_spot}`
              : "View Available Mailings"
            }
          </Button>
        </Link>
      </div>
    </div>
  )
}

// Component to render individual ad spot overlay for the landing page
function LandingAdSpotOverlay({ spot }: { spot: AdSpot }) {
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
