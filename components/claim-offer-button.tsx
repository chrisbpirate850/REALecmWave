"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { CheckCircle, AlertTriangle, Gift } from "lucide-react"

type ClaimOfferButtonProps = {
  landingPageId: string
  adSpotId: string
  advertiserId: string
  businessName?: string
  ctaText?: string
}

export function ClaimOfferButton({
  landingPageId,
  adSpotId,
  advertiserId,
  businessName,
  ctaText = "Claim Offer",
}: ClaimOfferButtonProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [isClaimed, setIsClaimed] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleClaim = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/claim-offer", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          landingPageId,
          adSpotId,
          advertiserId,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to claim offer")
      }

      setIsClaimed(true)
    } catch (err) {
      setError("Failed to claim offer. Please try again.")
      console.error("Claim error:", err)
    } finally {
      setIsLoading(false)
    }
  }

  if (isClaimed) {
    return (
      <div className="rounded-lg border-2 border-emerald-500 bg-emerald-50 p-6 text-center">
        <CheckCircle className="mx-auto mb-3 h-12 w-12 text-emerald-600" />
        <h3 className="text-xl font-bold text-emerald-800">Offer Claimed!</h3>
        <p className="mt-2 text-emerald-700">
          Thank you for redeeming this offer at {businessName || "the business"}.
          Enjoy your special deal!
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Warning Box */}
      <div className="rounded-lg border-2 border-amber-300 bg-amber-50 p-4">
        <div className="flex gap-3">
          <AlertTriangle className="h-6 w-6 shrink-0 text-amber-600" />
          <div className="text-sm text-amber-800">
            <p className="font-semibold">Important: Claim Only at the Business Location</p>
            <p className="mt-1">
              This offer can only be claimed once. Please only press the button below when you are
              at {businessName ? <strong>{businessName}</strong> : "the advertiser's location"} and
              ready to redeem your offer.
            </p>
            <p className="mt-2 font-medium">
              Ask the business representative to press the "Claim Offer" button on your phone to
              confirm redemption.
            </p>
          </div>
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-red-300 bg-red-50 p-3 text-center text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Claim Button with Confirmation Dialog */}
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button size="lg" className="w-full text-lg" disabled={isLoading}>
            <Gift className="mr-2 h-5 w-5" />
            {ctaText}
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              Confirm Offer Redemption
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-3 text-left">
              <p>
                <strong>Are you at {businessName || "the business location"}?</strong>
              </p>
              <p>
                Once you claim this offer, it cannot be claimed again. This action records
                your visit and confirms you are redeeming the special offer from the postcard.
              </p>
              <p className="font-medium text-foreground">
                The business representative should press "Yes, Claim Now" to confirm.
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleClaim}
              disabled={isLoading}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              {isLoading ? "Claiming..." : "Yes, Claim Now"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
