"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { RotateCw } from "lucide-react"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"

type AdSpot = {
  id: string
  position: number
  side: string
  grid_position: number
  status: string
  price: number
  advertiser_id: string | null
  ad_copy_url: string | null
}

type GridSelectorProps = {
  mailingId: string
  adSpots: AdSpot[]
  userId: string
  zipCodes?: string[]
}

// Map zip codes to SVG file pairs (front, back)
const ZIP_CODE_TO_SVG: Record<string, { front: string; back: string; name: string }> = {
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

// Helper component for spot overlay content
function SpotOverlayContent({
  spot,
  isSelected,
  isAvailable,
  isPurchased,
  isOwn,
  hasAdCopy,
}: {
  spot: AdSpot
  isSelected: boolean
  isAvailable: boolean
  isPurchased: boolean
  isOwn: boolean
  hasAdCopy: boolean
}) {
  return (
    <>
      {/* Overlay content */}
      <div className={cn(
        "absolute inset-0 flex flex-col items-center justify-center p-1 transition-opacity",
        isAvailable || isSelected ? "opacity-100" : "opacity-70"
      )}>
        {/* Show ad copy preview if uploaded */}
        {hasAdCopy && isPurchased && (
          <div className="absolute inset-1 overflow-hidden rounded">
            <img
              src={spot.ad_copy_url!}
              alt={`Ad spot ${spot.grid_position}`}
              className="h-full w-full object-cover"
            />
          </div>
        )}

        {/* Status indicator */}
        <div className={cn(
          "rounded-full px-2 py-1 text-xs font-semibold shadow-sm",
          isSelected && "bg-emerald-600 text-white",
          isAvailable && !isSelected && "bg-white/90 text-emerald-700 border border-emerald-300",
          isPurchased && !isOwn && !hasAdCopy && "bg-gray-600/80 text-white",
          isOwn && !hasAdCopy && "bg-blue-600 text-white",
        )}>
          {isSelected && "✓ Selected"}
          {isAvailable && !isSelected && `Spot ${spot.grid_position}`}
          {isPurchased && !isOwn && !hasAdCopy && "Claimed"}
          {isOwn && !hasAdCopy && "Your Spot"}
        </div>

        {/* Price indicator for available spots */}
        {isAvailable && !isSelected && (
          <div className="mt-1 rounded bg-white/90 px-1.5 py-0.5 text-xs font-medium text-gray-700 shadow-sm">
            ${spot.price}
          </div>
        )}
      </div>

      {/* Selection checkmark */}
      {isSelected && (
        <div className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-600 text-white shadow-md z-10 text-xs">
          ✓
        </div>
      )}
    </>
  )
}

export function GridSelector({ mailingId, adSpots, userId, zipCodes }: GridSelectorProps) {
  const [selectedSpots, setSelectedSpots] = useState<string[]>([])
  const [currentSide, setCurrentSide] = useState<"front" | "back">("front")
  const router = useRouter()

  const postcardSvgs = getPostcardSvgs(zipCodes)

  const frontSpots = adSpots.filter((spot) => spot.side === "front").sort((a, b) => a.grid_position - b.grid_position)
  const backSpots = adSpots.filter((spot) => spot.side === "back").sort((a, b) => a.grid_position - b.grid_position)

  const currentSpots = currentSide === "front" ? frontSpots : backSpots

  const handleSpotClick = (spotId: string, status: string, advertiserId: string | null) => {
    if (status !== "available") return

    setSelectedSpots((prev) => {
      if (prev.includes(spotId)) {
        return prev.filter((id) => id !== spotId)
      } else {
        return [...prev, spotId]
      }
    })
  }

  const totalPrice = selectedSpots.reduce((sum, spotId) => {
    const spot = adSpots.find((s) => s.id === spotId)
    return sum + (spot?.price || 0)
  }, 0)

  const handleProceed = () => {
    if (selectedSpots.length === 0) return
    const spotIds = selectedSpots.join(",")
    router.push(`/checkout?mailingId=${mailingId}&spots=${spotIds}`)
  }

  return (
    <div className="space-y-6">
      {/* Flip Button */}
      <div className="flex items-center justify-center">
        <Button
          onClick={() => setCurrentSide(currentSide === "front" ? "back" : "front")}
          variant="outline"
          className="gap-2"
        >
          <RotateCw className={cn("h-4 w-4 transition-transform", currentSide === "back" && "rotate-180")} />
          Flip to {currentSide === "front" ? "Back" : "Front"}
        </Button>
      </div>

      {/* Postcard with Overlay Grid */}
      <div className="relative mx-auto">
        {/* Side indicator */}
        <Badge className="absolute left-4 top-4 z-20 bg-slate-800/90 text-xs uppercase text-white">
          {currentSide === "front" ? "Front" : "Back"} Side
        </Badge>

        {/* Actual Postcard Image */}
        <div className="relative overflow-hidden rounded-xl border-4 border-slate-200 bg-white shadow-lg">
          <img
            src={currentSide === "front" ? postcardSvgs.front : postcardSvgs.back}
            alt={`${postcardSvgs.name} Postcard - ${currentSide === "front" ? "Front" : "Back"}`}
            className="h-auto w-full"
          />

          {/* Clickable Overlay Grid - positioned over the ad spots area */}
          {/* Layout: 12" wide × 9" high postcard */}
          {/* Ad spots: 3.8" × 3.8" squares, 3 across × 2 rows */}
          {/* Horizontal bar: 11.8" × 0.8" between the two rows (mailing indicia) */}
          {/*
            Calculations:
            - 3 ads × 3.8" = 11.4" wide → 95% of 12"
            - Each ad row: 3.8" / 9" = 42.2% height
            - Bar between rows: 0.8" / 9" = 8.9% height
            - Total: 42.2% + 8.9% + 42.2% = 93.3% height
            - Top margin: (9" - 8.4") / 2 / 9" = 3.3%
          */}
          <div
            className="absolute flex flex-col"
            style={{
              left: '2.5%',
              top: '3.3%',
              width: '95%',
              height: '93.4%',
            }}
          >
            {/* Top row of 3 ads - 3.8" out of 9" = 42.2% */}
            {/* Gap between ads: (12" - 11.4") / 2 gaps = 0.3" per gap = 2.5% of 12" */}
            <div className="flex justify-between" style={{ height: '45.2%' }}>
              {currentSpots.slice(0, 3).map((spot) => {
                const isSelected = selectedSpots.includes(spot.id)
                const isAvailable = spot.status === "available"
                const isPurchased = spot.status === "purchased" || spot.status === "uploaded" || spot.status === "reserved"
                const isOwn = spot.advertiser_id === userId
                const hasAdCopy = spot.ad_copy_url && spot.ad_copy_url.length > 0

                return (
                  <button
                    key={spot.id}
                    onClick={() => handleSpotClick(spot.id, spot.status, spot.advertiser_id)}
                    disabled={!isAvailable}
                    style={{ width: '32%' }}
                    className={cn(
                      "relative h-full flex flex-col items-center justify-center rounded transition-all overflow-hidden",
                      isAvailable && !isSelected && "hover:bg-emerald-500/20 hover:ring-2 hover:ring-emerald-500",
                      isSelected && "bg-emerald-500/30 ring-4 ring-emerald-500",
                      isPurchased && !isOwn && "bg-gray-500/10",
                      isOwn && "bg-blue-500/20 ring-2 ring-blue-500",
                      !isAvailable && "cursor-not-allowed",
                    )}
                  >
                    <SpotOverlayContent
                      spot={spot}
                      isSelected={isSelected}
                      isAvailable={isAvailable}
                      isPurchased={isPurchased}
                      isOwn={isOwn}
                      hasAdCopy={hasAdCopy}
                    />
                  </button>
                )
              })}
            </div>

            {/* Horizontal indicia bar between rows - 0.8" out of 9" = 8.9% */}
            <div style={{ height: '9.6%' }} />

            {/* Bottom row of 3 ads - 3.8" out of 9" = 42.2% */}
            <div className="flex justify-between" style={{ height: '45.2%' }}>
              {currentSpots.slice(3, 6).map((spot) => {
                const isSelected = selectedSpots.includes(spot.id)
                const isAvailable = spot.status === "available"
                const isPurchased = spot.status === "purchased" || spot.status === "uploaded" || spot.status === "reserved"
                const isOwn = spot.advertiser_id === userId
                const hasAdCopy = spot.ad_copy_url && spot.ad_copy_url.length > 0

                return (
                  <button
                    key={spot.id}
                    onClick={() => handleSpotClick(spot.id, spot.status, spot.advertiser_id)}
                    disabled={!isAvailable}
                    style={{ width: '32%' }}
                    className={cn(
                      "relative h-full flex flex-col items-center justify-center rounded transition-all overflow-hidden",
                      isAvailable && !isSelected && "hover:bg-emerald-500/20 hover:ring-2 hover:ring-emerald-500",
                      isSelected && "bg-emerald-500/30 ring-4 ring-emerald-500",
                      isPurchased && !isOwn && "bg-gray-500/10",
                      isOwn && "bg-blue-500/20 ring-2 ring-blue-500",
                      !isAvailable && "cursor-not-allowed",
                    )}
                  >
                    <SpotOverlayContent
                      spot={spot}
                      isSelected={isSelected}
                      isAvailable={isAvailable}
                      isPurchased={isPurchased}
                      isOwn={isOwn}
                      hasAdCopy={hasAdCopy}
                    />
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Size/Location indicator */}
      <div className="text-center text-sm text-muted-foreground">
        12" × 9" Postcard — {postcardSvgs.name} — {currentSide === "front" ? "Front" : "Back"} Side
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center justify-center gap-4 text-sm">
        <div className="flex items-center gap-2">
          <div className="h-4 w-4 rounded border-2 border-emerald-600 bg-emerald-50" />
          <span>Selected</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-4 w-4 rounded border-2 border-gray-300 bg-white" />
          <span>Available</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-4 w-4 rounded border-2 border-gray-200 bg-gray-100" />
          <span>Taken</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-4 w-4 rounded border-2 border-blue-300 bg-blue-50" />
          <span>Your Spot</span>
        </div>
      </div>

      {/* Checkout Summary */}
      {selectedSpots.length > 0 && (
        <div className="rounded-lg border bg-muted/50 p-6">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <div className="text-sm text-muted-foreground">
                {selectedSpots.length} spot{selectedSpots.length > 1 ? "s" : ""} selected
              </div>
              <div className="text-2xl font-bold">${totalPrice.toFixed(2)}</div>
            </div>
            <Button size="lg" onClick={handleProceed}>
              Proceed to Checkout
            </Button>
          </div>
          <p className="text-sm text-muted-foreground">
            {selectedSpots.length > 1
              ? "You're purchasing multiple spots for a larger advertisement."
              : "You're purchasing a single ad spot."}
          </p>
        </div>
      )}
    </div>
  )
}
